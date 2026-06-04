import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import { NotificationsService } from '@/shared/notifications/notifications.service'
import { WorkOrderStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import type { RequestUser } from '@/common/decorators'
import type {
  CreateWorkOrderDto, UpdateWorkOrderDto, CreateLaborAttendanceDto,
  CreateRABillDto, ProcessRABillDto, CreateMaterialIndentDto, ProcessMaterialIndentDto,
} from './dto/contractor.dto'

@Injectable()
export class ContractorService {
  private readonly logger = new Logger(ContractorService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─── Dashboard ────────────────────────────────────────────────────────────

  async getDashboard(userId: string) {
    const contractor = await this.prisma.contractor.findFirst({
      where: { userId },
      select: { id: true, companyName: true },
    })

    if (!contractor) {
      return { message: 'No contractor profile found', activeWorkOrders: 0 }
    }

    const [activeWOs, pendingBills, openIndents, todayAttendance, recentWOs] = await Promise.all([
      this.prisma.workOrder.count({
        where: { contractorId: contractor.id, status: { in: [WorkOrderStatus.ACCEPTED, WorkOrderStatus.IN_PROGRESS] } },
      }),
      this.prisma.rABill.count({ where: { workOrder: { contractorId: contractor.id }, status: 'SUBMITTED' } }),
      this.prisma.materialIndent.count({ where: { contractorId: contractor.id, status: 'PENDING' } }),
      this.prisma.laborAttendance.findFirst({
        where: {
          contractorId: contractor.id,
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.workOrder.findMany({
        where: { contractorId: contractor.id },
        orderBy: { createdAt: 'desc' }, take: 5,
        include: { project: { select: { name: true, city: true } } },
      }),
    ])

    return {
      contractor,
      stats: { activeWorkOrders: activeWOs, pendingBills, openIndents, attendanceMarked: !!todayAttendance },
      recentWorkOrders: recentWOs,
    }
  }

  // ─── Work Orders ──────────────────────────────────────────────────────────

  async createWorkOrder(dto: CreateWorkOrderDto) {
    const seq = await this.prisma.workOrder.count({ where: { projectId: dto.projectId } })
    const woNumber = `WO-${dto.projectId.slice(0, 8).toUpperCase()}-${String(seq + 1).padStart(4, '0')}`

    return this.prisma.workOrder.create({
      data: {
        woNumber, projectId: dto.projectId, contractorId: dto.contractorId,
        title: dto.title, scope: dto.scope,
        startDate: new Date(dto.startDate), endDate: new Date(dto.endDate),
        contractValue: dto.contractValue,
        retentionPercentage: dto.retentionPercentage ?? 5,
        status: WorkOrderStatus.DRAFT,
        milestones: dto.milestones?.length ? {
          create: dto.milestones.map((m) => ({
            description: m.description, percentage: m.percentage, amount: m.amount,
          })),
        } : undefined,
      },
      include: {
        project: { select: { name: true } },
        contractor: { select: { companyName: true } },
        milestones: true,
      },
    })
  }

  async getWorkOrders(filters: { projectId?: string; contractorId?: string; userId?: string; status?: string }, page = 1, limit = 20) {
    let contractorId = filters.contractorId
    if (filters.userId && !contractorId) {
      const contractor = await this.prisma.contractor.findFirst({ where: { userId: filters.userId }, select: { id: true } })
      contractorId = contractor?.id
    }

    const where: Prisma.WorkOrderWhereInput = {
      ...(filters.projectId && { projectId: filters.projectId }),
      ...(contractorId && { contractorId }),
      ...(filters.status && { status: filters.status as WorkOrderStatus }),
    }

    const [items, total] = await Promise.all([
      this.prisma.workOrder.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true, city: true } },
          contractor: { select: { id: true, companyName: true } },
          _count: { select: { bills: true, milestones: true } },
        },
      }),
      this.prisma.workOrder.count({ where }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getWorkOrderById(id: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        contractor: { select: { id: true, companyName: true } },
        milestones: true,
        bills: { orderBy: { billDate: 'desc' } },
      },
    })
    if (!wo) throw new NotFoundException('Work order not found')
    return wo
  }

  async updateWorkOrder(id: string, dto: UpdateWorkOrderDto) {
    return this.prisma.workOrder.update({ where: { id }, data: { ...dto } as any })
  }

  async issueWorkOrder(id: string) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id } })
    if (!wo) throw new NotFoundException('Work order not found')
    if (wo.status !== WorkOrderStatus.DRAFT) throw new BadRequestException('Only draft work orders can be issued')
    return this.prisma.workOrder.update({ where: { id }, data: { status: WorkOrderStatus.ISSUED } })
  }

  async acceptWorkOrder(id: string, userId: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id }, include: { contractor: true },
    })
    if (!wo) throw new NotFoundException('Work order not found')
    if (wo.contractor.userId !== userId) throw new ForbiddenException('Not your work order')
    if (wo.status !== WorkOrderStatus.ISSUED) throw new BadRequestException('Work order is not in ISSUED status')
    return this.prisma.workOrder.update({ where: { id }, data: { status: WorkOrderStatus.ACCEPTED } })
  }

  // ─── Labour Attendance ────────────────────────────────────────────────────

  async markAttendance(dto: CreateLaborAttendanceDto, userId: string) {
    const date = new Date(dto.date)
    date.setHours(0, 0, 0, 0)

    const existing = await this.prisma.laborAttendance.findUnique({
      where: { projectId_contractorId_date: { projectId: dto.projectId, contractorId: dto.contractorId, date } },
    })
    if (existing) throw new BadRequestException('Attendance already marked for this date')

    const totalPresent = dto.labourBreakdown.reduce((sum, e) => sum + e.present, 0)
    return this.prisma.laborAttendance.create({
      data: {
        projectId: dto.projectId, contractorId: dto.contractorId,
        date, labourBreakdown: dto.labourBreakdown, totalPresent, submittedById: userId,
      },
    })
  }

  async getAttendance(projectId: string, contractorId?: string, from?: string, to?: string) {
    const where: Prisma.LaborAttendanceWhereInput = {
      projectId,
      ...(contractorId && { contractorId }),
      ...(from && { date: { gte: new Date(from) } }),
      ...(to && { date: { lte: new Date(to) } }),
    }
    return this.prisma.laborAttendance.findMany({
      where, orderBy: { date: 'desc' }, take: 60,
      include: { contractor: { select: { companyName: true } } },
    })
  }

  async getAttendanceSummary(projectId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const records = await this.prisma.laborAttendance.findMany({
      where: { projectId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' },
      include: { contractor: { select: { companyName: true } } },
    })

    const byDate: Record<string, number> = {}
    const byContractor: Record<string, number> = {}
    for (const r of records) {
      const dateKey = r.date.toISOString().split('T')[0]!
      byDate[dateKey] = (byDate[dateKey] ?? 0) + r.totalPresent
      const cName = r.contractor.companyName
      byContractor[cName] = (byContractor[cName] ?? 0) + r.totalPresent
    }

    return {
      chartData: Object.entries(byDate).map(([date, count]) => ({ date, count })),
      byContractor: Object.entries(byContractor).map(([name, total]) => ({ name, total })),
      peakDay: Object.entries(byDate).sort((a, b) => b[1]! - a[1]!)[0],
    }
  }

  // ─── RA Bills ─────────────────────────────────────────────────────────────

  async submitRABill(dto: CreateRABillDto, userId: string) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id: dto.workOrderId } })
    if (!wo) throw new NotFoundException('Work order not found')

    const seq = await this.prisma.rABill.count({ where: { workOrderId: dto.workOrderId } })
    const billNumber = `${wo.woNumber}-RA${String(seq + 1).padStart(2, '0')}`

    const retentionAmount = dto.grossAmount * (Number(wo.retentionPercentage) / 100)
    const previouslyPaid = dto.previouslyPaid ?? 0
    const currentDue = dto.grossAmount - retentionAmount - previouslyPaid

    return this.prisma.rABill.create({
      data: {
        workOrderId: dto.workOrderId, billNumber,
        billDate: new Date(dto.billDate), grossAmount: dto.grossAmount,
        retentionAmount, previouslyPaid, currentDue, status: 'SUBMITTED',
      },
    })
  }

  async processRABill(id: string, dto: ProcessRABillDto, userId: string) {
    const bill = await this.prisma.rABill.findUnique({ where: { id } })
    if (!bill) throw new NotFoundException('Bill not found')
    return this.prisma.rABill.update({
      where: { id },
      data: {
        status: dto.status === 'CERTIFIED' ? 'CERTIFIED' : 'SUBMITTED',
        ...(dto.status === 'CERTIFIED' && { certifiedById: userId, certifiedAt: new Date() }),
      },
    })
  }

  async payRABill(id: string) {
    return this.prisma.rABill.update({ where: { id }, data: { status: 'PAID', paidAt: new Date() } })
  }

  // ─── Material Indents ─────────────────────────────────────────────────────

  async createMaterialIndent(dto: CreateMaterialIndentDto, userId: string) {
    return this.prisma.materialIndent.create({
      data: {
        projectId: dto.projectId, contractorId: dto.contractorId,
        items: dto.items, status: 'PENDING',
      },
    })
  }

  async getMaterialIndents(filters: { projectId?: string; contractorId?: string; status?: string }) {
    const where: Prisma.MaterialIndentWhereInput = {
      ...(filters.projectId && { projectId: filters.projectId }),
      ...(filters.contractorId && { contractorId: filters.contractorId }),
      ...(filters.status && { status: filters.status }),
    }
    return this.prisma.materialIndent.findMany({
      where, orderBy: { requestedAt: 'desc' }, take: 50,
      include: { contractor: { select: { companyName: true } } },
    })
  }

  async processMaterialIndent(id: string, dto: ProcessMaterialIndentDto, userId: string) {
    return this.prisma.materialIndent.update({
      where: { id },
      data: {
        status: dto.status,
        approvedById: dto.status === 'APPROVED' ? userId : null,
        approvedAt: dto.status === 'APPROVED' ? new Date() : null,
        remarks: dto.remarks,
      },
    })
  }
}
