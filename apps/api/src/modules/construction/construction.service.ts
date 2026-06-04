import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import { NotificationsService } from '@/shared/notifications/notifications.service'
import { FilesService } from '@/shared/files/files.service'
import { slugify } from '@buildestate/utils'
import { ProjectStatus, MilestoneStatus, NotificationType, UserRole, UnitStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import type { RequestUser } from '@/common/decorators'
import type {
  CreateProjectDto, UpdateProjectDto, CreateTowerDto, CreateUnitDto,
  CreateMilestoneDto, UpdateMilestoneDto, CreateProgressUpdateDto,
  CreateDSRDto, ApproveDSRDto, CreateQualityCheckDto,
} from './dto/construction.dto'

@Injectable()
export class ConstructionService {
  private readonly logger = new Logger(ConstructionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
    private readonly files: FilesService,
  ) {}

  // ─── Projects ─────────────────────────────────────────────────────────────

  async createProject(dto: CreateProjectDto, user: RequestUser) {
    if (!user.orgId) throw new ForbiddenException('You must belong to an organisation')
    const baseSlug = slugify(dto.name)
    const existing = await this.prisma.project.findMany({ where: { slug: { startsWith: baseSlug } }, select: { slug: true } })
    let slug = baseSlug
    let counter = 1
    while (existing.map((p) => p.slug).includes(slug)) slug = `${baseSlug}-${counter++}`

    return this.prisma.project.create({
      data: {
        orgId: user.orgId, name: dto.name, slug, description: dto.description,
        addressLine1: dto.addressLine1, city: dto.city, state: dto.state, pincode: dto.pincode,
        latitude: dto.latitude, longitude: dto.longitude,
        totalArea: dto.totalArea ?? 0, reraNumber: dto.reraNumber,
        startDate: new Date(dto.startDate),
        expectedCompletionDate: new Date(dto.expectedCompletionDate),
        amenities: dto.amenities ?? [],
        status: ProjectStatus.PLANNING,
      },
    })
  }

  async getProjects(orgId: string, page = 1, limit = 20, status?: ProjectStatus) {
    const where: Prisma.ProjectWhereInput = { orgId, ...(status && { status }) }
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { towers: true, milestones: true } },
          phases: { select: { id: true, name: true, status: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getProjectById(id: string) {
    const cacheKey = this.redis.key('project', id)
    const cached = await this.redis.get(cacheKey)
    if (cached) return cached

    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        phases: true,
        towers: { include: { floors: { include: { units: { orderBy: { unitNumber: 'asc' } } } } } },
        milestones: { orderBy: { plannedStartDate: 'asc' } },
        budget: { include: { heads: true } },
        _count: { select: { workOrders: true, inspections: true, dailyReports: true } },
      },
    })
    if (!project) throw new NotFoundException('Project not found')
    await this.redis.set(cacheKey, project, 300)
    return project
  }

  async updateProject(id: string, dto: UpdateProjectDto, user: RequestUser) {
    const project = await this.prisma.project.findUnique({ where: { id } })
    if (!project) throw new NotFoundException('Project not found')
    if (project.orgId !== user.orgId && !user.roles.includes(UserRole.ADMIN))
      throw new ForbiddenException('Not authorized')

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status && { status: dto.status }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.expectedCompletionDate && { expectedCompletionDate: new Date(dto.expectedCompletionDate) }),
        ...(dto.amenities && { amenities: dto.amenities }),
        ...(dto.reraNumber && { reraNumber: dto.reraNumber }),
        ...(dto.totalArea && { totalArea: dto.totalArea }),
      },
    })
    await this.redis.del(this.redis.key('project', id))
    return updated
  }

  // ─── Towers ────────────────────────────────────────────────────────────────

  async createTower(projectId: string, dto: CreateTowerDto, user: RequestUser) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) throw new NotFoundException('Project not found')
    if (project.orgId !== user.orgId) throw new ForbiddenException('Not authorized')

    const totalUnits = dto.numberOfFloors * dto.numberOfUnitsPerFloor
    const tower = await this.prisma.tower.create({
      data: {
        projectId, name: dto.name, phaseId: dto.phaseId,
        numberOfFloors: dto.numberOfFloors,
        numberOfUnitsPerFloor: dto.numberOfUnitsPerFloor,
        totalUnits, status: ProjectStatus.PLANNING,
      },
    })

    // Auto-create floors
    const floorData = Array.from({ length: dto.numberOfFloors }, (_, i) => ({
      towerId: tower.id,
      floorNumber: i + 1,
      label: i === 0 ? 'Ground Floor' : `Floor ${i + 1}`,
    }))
    await this.prisma.floor.createMany({ data: floorData })

    // Update project unit count
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        numberOfTowers: { increment: 1 },
        numberOfUnits: { increment: totalUnits },
      },
    })

    await this.redis.del(this.redis.key('project', projectId))
    return this.prisma.tower.findUnique({ where: { id: tower.id }, include: { floors: true } })
  }

  async createUnit(floorId: string, dto: CreateUnitDto) {
    const floor = await this.prisma.floor.findUnique({ where: { id: floorId } })
    if (!floor) throw new NotFoundException('Floor not found')

    const finalPrice = dto.basePrice + (dto.floorRisePremium ?? 0) + (dto.facingPremium ?? 0)
    return this.prisma.unit.create({
      data: {
        floorId, unitNumber: dto.unitNumber, bhkType: dto.bhkType,
        area: dto.area, carpetArea: dto.carpetArea,
        superBuiltUpArea: dto.area * 1.25,
        facing: dto.facing, basePrice: dto.basePrice,
        floorRisePremium: dto.floorRisePremium,
        facingPremium: dto.facingPremium,
        finalPrice,
        amenities: dto.amenities ?? [],
        floorPlanUrl: dto.floorPlanUrl,
        status: UnitStatus.AVAILABLE,
      },
    })
  }

  async getUnitInventory(projectId: string) {
    const cacheKey = this.redis.key('project', projectId, 'inventory')
    const cached = await this.redis.get(cacheKey)
    if (cached) return cached

    const [towers, unitStats] = await Promise.all([
      this.prisma.tower.findMany({
        where: { projectId },
        include: {
          floors: {
            include: { units: { select: { id: true, unitNumber: true, bhkType: true, area: true, status: true, finalPrice: true } } },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.unit.groupBy({
        by: ['status'],
        where: { floor: { tower: { projectId } } },
        _count: { status: true },
        _sum: { finalPrice: true },
      }),
    ])

    const summary = {
      total: 0, available: 0, booked: 0, sold: 0, held: 0,
      totalValue: 0, bookedValue: 0,
    }

    for (const stat of unitStats) {
      const count = stat._count.status
      const value = Number(stat._sum.finalPrice ?? 0)
      summary.total += count
      if (stat.status === UnitStatus.AVAILABLE) summary.available += count
      if (stat.status === UnitStatus.BOOKED || stat.status === UnitStatus.AGREEMENT_DONE) {
        summary.booked += count; summary.bookedValue += value
      }
      if (stat.status === UnitStatus.REGISTERED || stat.status === UnitStatus.POSSESSION_GIVEN) summary.sold += count
      if (stat.status === UnitStatus.HOLD) summary.held += count
      summary.totalValue += value
    }

    const result = { towers, summary }
    await this.redis.set(cacheKey, result, 120)
    return result
  }

  // ─── Milestones ────────────────────────────────────────────────────────────

  async createMilestone(projectId: string, dto: CreateMilestoneDto) {
    return this.prisma.milestone.create({
      data: {
        projectId, name: dto.name, description: dto.description,
        phaseId: dto.phaseId,
        plannedStartDate: new Date(dto.plannedStartDate),
        plannedEndDate: new Date(dto.plannedEndDate),
        linkedPaymentPercentage: dto.linkedPaymentPercentage,
        dependencies: dto.dependencies ?? [],
        status: MilestoneStatus.NOT_STARTED,
        completionPercentage: 0,
      },
    })
  }

  async updateMilestone(id: string, dto: UpdateMilestoneDto, user: RequestUser) {
    const milestone = await this.prisma.milestone.findUnique({ where: { id }, include: { project: true } })
    if (!milestone) throw new NotFoundException('Milestone not found')
    if (milestone.project.orgId !== user.orgId) throw new ForbiddenException('Not authorized')

    const wasCompleted = milestone.status !== MilestoneStatus.COMPLETED
    const nowCompleted = dto.status === MilestoneStatus.COMPLETED

    const updated = await this.prisma.milestone.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.completionPercentage !== undefined && { completionPercentage: dto.completionPercentage }),
        ...(dto.actualStartDate && { actualStartDate: new Date(dto.actualStartDate) }),
        ...(dto.actualEndDate && { actualEndDate: new Date(dto.actualEndDate) }),
        ...(dto.name && { name: dto.name }),
      },
    })

    // When milestone completes, notify buyers who have payment tied to it
    if (wasCompleted && nowCompleted) {
      const scheduleItems = await this.prisma.paymentScheduleItem.findMany({
        where: { milestoneId: id, status: 'PENDING' },
        include: { booking: { include: { buyer: true } } },
      })

      for (const item of scheduleItems) {
        await this.notifications.create({
          userId: item.booking.buyerId,
          type: NotificationType.MILESTONE_COMPLETED,
          title: 'Construction milestone completed',
          body: `The "${milestone.name}" milestone is complete. A payment demand will be raised soon.`,
          data: { milestoneId: id, projectId: milestone.projectId },
        })
      }
    }

    await this.redis.del(this.redis.key('project', milestone.projectId))
    return updated
  }

  async getMilestones(projectId: string) {
    return this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { plannedStartDate: 'asc' },
      include: {
        paymentScheduleItems: {
          where: { status: { not: 'PAID' } },
          select: { id: true, amount: true, status: true, dueDate: true },
        },
      },
    })
  }

  // ─── Progress Updates ──────────────────────────────────────────────────────

  async createProgressUpdate(projectId: string, dto: CreateProgressUpdateDto, files: Express.Multer.File[], user: RequestUser) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } })
    if (!project) throw new NotFoundException('Project not found')

    let mediaUrls: string[] = []
    if (files?.length) {
      const results = await this.files.uploadMultiple(files, {
        folder: `projects/${projectId}/progress`,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
        maxSizeMB: 50,
        generateThumbnail: true,
      })
      mediaUrls = results.map((r) => r.url)
    }

    const update = await this.prisma.progressUpdate.create({
      data: {
        projectId, milestoneId: dto.milestoneId,
        title: dto.title, description: dto.description,
        completionPercentage: dto.completionPercentage,
        mediaUrls, postedById: user.id,
        isVisibleToBuyers: dto.isVisibleToBuyers ?? true,
      },
      include: { postedBy: { select: { id: true, name: true, avatar: true } } },
    })

    // Notify buyers if visible
    if (dto.isVisibleToBuyers !== false) {
      const bookings = await this.prisma.booking.findMany({
        where: { unit: { floor: { tower: { projectId } } } },
        select: { buyerId: true },
        distinct: ['buyerId'],
      })
      if (bookings.length) {
        await this.notifications.createBulk(
          bookings.map((b) => b.buyerId),
          {
            type: NotificationType.PROGRESS_UPDATE,
            title: 'Construction update',
            body: `${dto.title} — ${dto.completionPercentage}% complete`,
            data: { projectId, updateId: update.id },
          },
        )
      }
    }

    return update
  }

  async getProgressUpdates(projectId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.progressUpdate.findMany({
        where: { projectId },
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { postedBy: { select: { id: true, name: true, avatar: true } } },
      }),
      this.prisma.progressUpdate.count({ where: { projectId } }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  // ─── Daily Site Reports ────────────────────────────────────────────────────

  async createDSR(projectId: string, dto: CreateDSRDto, files: Express.Multer.File[], user: RequestUser) {
    const reportDate = new Date(dto.reportDate)
    const existing = await this.prisma.dailySiteReport.findUnique({
      where: { projectId_reportDate: { projectId, reportDate } },
    })
    if (existing) throw new BadRequestException('A report for this date already exists')

    let mediaUrls: string[] = []
    if (files?.length) {
      const results = await this.files.uploadMultiple(files, {
        folder: `projects/${projectId}/reports`,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeMB: 10, generateThumbnail: true,
      })
      mediaUrls = results.map((r) => r.url)
    }

    return this.prisma.dailySiteReport.create({
      data: {
        projectId, reportDate, preparedById: user.id,
        weather: dto.weather, totalLabour: dto.totalLabour,
        labourBreakdown: dto.labourBreakdown ?? [],
        workDone: dto.workDone,
        materialsUsed: dto.materialsUsed ?? [],
        equipmentUsed: dto.equipmentUsed ?? [],
        issues: dto.issues, mediaUrls,
        status: 'SUBMITTED', submittedAt: new Date(),
      },
    })
  }

  async getDSRs(projectId: string, page = 1, limit = 30) {
    const [items, total] = await Promise.all([
      this.prisma.dailySiteReport.findMany({
        where: { projectId }, skip: (page - 1) * limit, take: limit,
        orderBy: { reportDate: 'desc' },
        include: { preparedBy: { select: { id: true, name: true } } },
      }),
      this.prisma.dailySiteReport.count({ where: { projectId } }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async approveDSR(id: string, dto: ApproveDSRDto, user: RequestUser) {
    const report = await this.prisma.dailySiteReport.findUnique({ where: { id } })
    if (!report) throw new NotFoundException('Report not found')
    return this.prisma.dailySiteReport.update({
      where: { id },
      data: {
        status: dto.status === 'APPROVED' ? 'APPROVED' : 'DRAFT',
        approvedById: dto.status === 'APPROVED' ? user.id : null,
        approvedAt: dto.status === 'APPROVED' ? new Date() : null,
      },
    })
  }

  // ─── Quality Checks ────────────────────────────────────────────────────────

  async createQualityCheck(projectId: string, dto: CreateQualityCheckDto, files: Express.Multer.File[], user: RequestUser) {
    let mediaUrls: string[] = []
    if (files?.length) {
      const results = await this.files.uploadMultiple(files, {
        folder: `projects/${projectId}/quality`, allowedTypes: ['image/jpeg', 'image/png'], maxSizeMB: 10,
      })
      mediaUrls = results.map((r) => r.url)
    }
    return this.prisma.qualityCheck.create({
      data: {
        projectId, activity: dto.activity, location: dto.location,
        checklistItems: dto.checklistItems as any,
        overallStatus: dto.overallStatus,
        inspectedById: user.id, inspectedAt: new Date(),
        remarks: dto.remarks, mediaUrls,
      },
    })
  }

  async getQualityChecks(projectId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.qualityCheck.findMany({
        where: { projectId }, skip: (page - 1) * limit, take: limit,
        orderBy: { inspectedAt: 'desc' },
      }),
      this.prisma.qualityCheck.count({ where: { projectId } }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  // ─── Dashboard Summary ────────────────────────────────────────────────────

  async getProjectSummary(projectId: string) {
    const cacheKey = this.redis.key('project', projectId, 'summary')
    return this.redis.cached(cacheKey, async () => {
      const [project, milestoneStats, unitStats, latestProgress, pendingDSRs] = await Promise.all([
        this.prisma.project.findUnique({ where: { id: projectId }, select: { name: true, status: true, expectedCompletionDate: true } }),
        this.prisma.milestone.groupBy({ by: ['status'], where: { projectId }, _count: { status: true } }),
        this.prisma.unit.groupBy({
          by: ['status'], where: { floor: { tower: { projectId } } }, _count: { status: true },
        }),
        this.prisma.progressUpdate.findFirst({ where: { projectId }, orderBy: { createdAt: 'desc' }, select: { completionPercentage: true, createdAt: true } }),
        this.prisma.dailySiteReport.count({ where: { projectId, status: 'SUBMITTED' } }),
      ])

      const msMap = Object.fromEntries(milestoneStats.map((s) => [s.status, s._count.status]))
      const unitMap = Object.fromEntries(unitStats.map((s) => [s.status, s._count.status]))
      const totalUnits = Object.values(unitMap).reduce((a, b) => a + b, 0)

      return {
        project, milestones: msMap,
        units: { ...unitMap, total: totalUnits },
        overallProgress: latestProgress?.completionPercentage ?? 0,
        pendingDSRApprovals: pendingDSRs,
      }
    }, 120)
  }
}
