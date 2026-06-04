import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import { NotificationsService } from '@/shared/notifications/notifications.service'
import { FilesService } from '@/shared/files/files.service'
import { NotificationType, InspectionStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import type { RequestUser } from '@/common/decorators'
import type {
  CreateInspectionDto, CompleteInspectionDto, CreateNCRDto, UpdateNCRDto,
  CreateTestResultDto, CreateApprovalDto, ProcessApprovalDto,
} from './dto/engineer.dto'

@Injectable()
export class EngineerService {
  private readonly logger = new Logger(EngineerService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
    private readonly files: FilesService,
  ) {}

  // ─── Dashboard ────────────────────────────────────────────────────────────

  async getDashboard(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [todayInspections, openNCRs, pendingApprovals, recentTests] = await Promise.all([
      this.prisma.inspection.findMany({
        where: {
          inspectorId: userId,
          scheduledDate: { gte: today, lt: tomorrow },
        },
        include: { project: { select: { name: true } } },
        orderBy: { scheduledDate: 'asc' },
      }),
      this.prisma.nCReport.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      this.prisma.approval.count({ where: { status: 'PENDING' } }),
      this.prisma.testResult.findMany({
        where: { inspection: { inspectorId: userId } },
        orderBy: { date: 'desc' }, take: 5,
      }),
    ])

    return {
      todayInspections,
      openNCRs,
      pendingApprovals,
      recentTests,
      stats: {
        todayCount: todayInspections.length,
        passCount: todayInspections.filter((i) => i.status === InspectionStatus.PASS).length,
        failCount: todayInspections.filter((i) => i.status === InspectionStatus.FAIL).length,
      },
    }
  }

  // ─── Inspections ──────────────────────────────────────────────────────────

  async createInspection(dto: CreateInspectionDto, user: RequestUser) {
    return this.prisma.inspection.create({
      data: {
        projectId: dto.projectId, activity: dto.activity,
        location: dto.location, tower: dto.tower, floor: dto.floor, unit: dto.unit,
        scheduledDate: new Date(dto.scheduledDate),
        inspectorId: user.id,
        checklistItems: dto.checklistItems as any,
        status: InspectionStatus.SCHEDULED,
        remarks: dto.remarks,
      },
      include: { project: { select: { name: true } } },
    })
  }

  async getInspections(projectId: string, page = 1, limit = 20, status?: string) {
    const where: Prisma.InspectionWhereInput = {
      projectId,
      ...(status && { status: status as InspectionStatus }),
    }
    const [items, total] = await Promise.all([
      this.prisma.inspection.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { scheduledDate: 'desc' },
        include: {
          inspector: { select: { id: true, name: true, avatar: true } },
          ncrReports: { select: { id: true, severity: true, status: true } },
        },
      }),
      this.prisma.inspection.count({ where }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getInspectionById(id: string) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
      include: {
        inspector: { select: { id: true, name: true } },
        ncrReports: true,
        testResults: true,
      },
    })
    if (!inspection) throw new NotFoundException('Inspection not found')
    return inspection
  }

  async completeInspection(id: string, dto: CompleteInspectionDto, files: Express.Multer.File[], user: RequestUser) {
    const inspection = await this.prisma.inspection.findUnique({ where: { id } })
    if (!inspection) throw new NotFoundException('Inspection not found')
    if (inspection.inspectorId !== user.id) throw new ForbiddenException('Not your inspection')

    let mediaUrls: string[] = []
    if (files?.length) {
      const results = await this.files.uploadMultiple(files, {
        folder: `projects/${inspection.projectId}/inspections`,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeMB: 10,
      })
      mediaUrls = results.map((r) => r.url)
    }

    const failedItems = dto.checklistItems.filter((i) => i.result === 'FAIL')

    return this.prisma.inspection.update({
      where: { id },
      data: {
        status: dto.status as InspectionStatus,
        conductedDate: new Date(),
        checklistItems: dto.checklistItems as any,
        mediaUrls: [...(inspection.mediaUrls ?? []), ...mediaUrls],
        remarks: dto.remarks,
      },
    })
  }

  // ─── NCR Reports ──────────────────────────────────────────────────────────

  async createNCR(dto: CreateNCRDto, files: Express.Multer.File[], user: RequestUser) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: dto.inspectionId }, select: { projectId: true },
    })
    if (!inspection) throw new NotFoundException('Inspection not found')

    let beforeMediaUrls: string[] = []
    if (files?.length) {
      const results = await this.files.uploadMultiple(files, {
        folder: `projects/${inspection.projectId}/ncr`, allowedTypes: ['image/jpeg', 'image/png'], maxSizeMB: 10,
      })
      beforeMediaUrls = results.map((r) => r.url)
    }

    const seq = await this.prisma.nCReport.count({ where: { projectId: inspection.projectId } })
    const ncrNumber = `NCR-${inspection.projectId.slice(0, 8).toUpperCase()}-${String(seq + 1).padStart(4, '0')}`

    const ncr = await this.prisma.nCReport.create({
      data: {
        ncrNumber, inspectionId: dto.inspectionId,
        projectId: inspection.projectId,
        issuedToId: dto.issuedToId, description: dto.description,
        severity: dto.severity, dueDate: new Date(dto.dueDate),
        beforeMediaUrls, status: 'OPEN',
      },
    })

    await this.notifications.create({
      userId: dto.issuedToId,
      type: NotificationType.NCR_RAISED,
      title: `${dto.severity} NCR raised`,
      body: `${ncrNumber}: ${dto.description.slice(0, 80)}`,
      data: { ncrId: ncr.id },
    })

    return ncr
  }

  async getNCRs(projectId: string, page = 1, limit = 20, status?: string) {
    const where: Prisma.NCReportWhereInput = {
      projectId,
      ...(status && { status }),
    }
    const [items, total] = await Promise.all([
      this.prisma.nCReport.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { issuedTo: { select: { companyName: true } } },
      }),
      this.prisma.nCReport.count({ where }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async updateNCR(id: string, dto: UpdateNCRDto, files: Express.Multer.File[]) {
    const ncr = await this.prisma.nCReport.findUnique({ where: { id } })
    if (!ncr) throw new NotFoundException('NCR not found')

    let afterMediaUrls: string[] = ncr.afterMediaUrls
    if (files?.length) {
      const results = await this.files.uploadMultiple(files, {
        folder: `projects/${ncr.projectId}/ncr`, allowedTypes: ['image/jpeg', 'image/png'], maxSizeMB: 10,
      })
      afterMediaUrls = [...afterMediaUrls, ...results.map((r) => r.url)]
    }

    const updated = await this.prisma.nCReport.update({
      where: { id },
      data: {
        status: dto.status,
        rootCause: dto.rootCause, correctiveAction: dto.correctiveAction,
        preventiveAction: dto.preventiveAction, afterMediaUrls,
        ...(dto.status === 'CLOSED' && { closedAt: new Date() }),
      },
    })

    if (dto.status === 'CLOSED') {
      await this.notifications.create({
        userId: ncr.issuedToId,
        type: NotificationType.NCR_CLOSED,
        title: 'NCR closed',
        body: `NCR ${ncr.ncrNumber} has been closed.`,
        data: { ncrId: id },
      })
    }

    return updated
  }

  // ─── Test Results ─────────────────────────────────────────────────────────

  async createTestResult(dto: CreateTestResultDto) {
    return this.prisma.testResult.create({
      data: {
        projectId: dto.projectId, inspectionId: dto.inspectionId,
        testType: dto.testType, sampleId: dto.sampleId, location: dto.location,
        date: new Date(dto.date), result: dto.result, unit: dto.unit,
        standardValue: dto.standardValue, status: dto.status,
        labName: dto.labName, certificateUrl: dto.certificateUrl,
      },
    })
  }

  async getTestResults(projectId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.testResult.findMany({
        where: { projectId }, skip: (page - 1) * limit, take: limit, orderBy: { date: 'desc' },
      }),
      this.prisma.testResult.count({ where: { projectId } }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  // ─── Approvals ────────────────────────────────────────────────────────────

  async createApproval(dto: CreateApprovalDto, files: Express.Multer.File[], user: RequestUser) {
    let mediaUrls: string[] = []
    if (files?.length) {
      const results = await this.files.uploadMultiple(files, {
        folder: `projects/${dto.projectId}/approvals`, allowedTypes: ['image/jpeg', 'image/png'], maxSizeMB: 10,
      })
      mediaUrls = results.map((r) => r.url)
    }
    return this.prisma.approval.create({
      data: {
        projectId: dto.projectId, type: dto.type,
        location: dto.location, requestedById: user.id, mediaUrls,
      },
    })
  }

  async processApproval(id: string, dto: ProcessApprovalDto, user: RequestUser) {
    const approval = await this.prisma.approval.findUnique({ where: { id } })
    if (!approval) throw new NotFoundException('Approval not found')
    return this.prisma.approval.update({
      where: { id },
      data: {
        status: dto.status, approvedById: user.id,
        ...(dto.status === 'APPROVED' && { approvedAt: new Date() }),
        ...(dto.rejectedReason && { rejectedReason: dto.rejectedReason }),
      },
    })
  }

  async getApprovals(projectId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.approval.findMany({
        where: { projectId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.approval.count({ where: { projectId } }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }
}
