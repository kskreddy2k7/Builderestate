import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Logger, ConflictException,
} from '@nestjs/common'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import { NotificationsService } from '@/shared/notifications/notifications.service'
import { LeadStage, LeadSource, CommissionStatus, NotificationType, UserRole } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import type { RequestUser } from '@/common/decorators'
import type {
  CreateLeadDto, UpdateLeadDto, TransferLeadDto, CreateActivityDto,
  ScheduleSiteVisitDto, CompleteSiteVisitDto,
  CreateCommissionDto, UpdateCommissionStatusDto, RecordCommissionPaymentDto,
  CreateCustomerDto, UpdateCustomerDto, LeadFilterDto,
} from './dto/crm.dto'

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─── Leads ────────────────────────────────────────────────────────────────

  async createLead(dto: CreateLeadDto, user: RequestUser) {
    if (!user.orgId) throw new ForbiddenException('Must belong to an organisation')

    // Duplicate check within org
    const duplicate = await this.prisma.lead.findFirst({
      where: { phone: dto.phone, orgId: user.orgId, stage: { not: LeadStage.JUNK } },
    })
    if (duplicate) throw new ConflictException(`Lead with phone ${dto.phone} already exists in your CRM`)

    const lead = await this.prisma.lead.create({
      data: {
        name: dto.name, email: dto.email, phone: dto.phone,
        alternatePhone: dto.alternatePhone,
        source: dto.source, stage: dto.stage ?? LeadStage.NEW,
        score: this.calculateInitialScore(dto),
        budgetMin: dto.budgetMin, budgetMax: dto.budgetMax,
        preferredLocations: dto.preferredLocations ?? [],
        preferredBhk: dto.preferredBhk ?? [],
        propertyId: dto.propertyId, projectId: dto.projectId,
        assignedToId: dto.assignedToId ?? user.id,
        orgId: user.orgId,
        notes: dto.notes,
        nextFollowUpDate: dto.nextFollowUpDate ? new Date(dto.nextFollowUpDate) : null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
        property: { select: { id: true, title: true, city: true } },
        project: { select: { id: true, name: true } },
      },
    })

    // Auto-create initial activity
    await this.prisma.leadActivity.create({
      data: {
        leadId: lead.id, type: 'NOTE',
        title: 'Lead created',
        description: `Lead created from ${dto.source}`,
        doneById: user.id, doneAt: new Date(),
      },
    })

    // Notify assigned broker if different from creator
    if (dto.assignedToId && dto.assignedToId !== user.id) {
      await this.notifications.create({
        userId: dto.assignedToId,
        type: NotificationType.LEAD_ASSIGNED,
        title: 'New lead assigned',
        body: `${dto.name} (${dto.phone}) has been assigned to you.`,
        data: { leadId: lead.id },
      })
    }

    await this.redis.del(this.redis.key('crm', user.orgId!, 'pipeline'))
    return lead
  }

  async getLeads(user: RequestUser, dto: LeadFilterDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc',
      search, stage, source, assignedToId, projectId, overdueFollowUp } = dto

    const where: Prisma.LeadWhereInput = { orgId: user.orgId! }

    // Non-admins see only their own leads
    if (!user.roles.includes(UserRole.ADMIN) && !user.roles.includes(UserRole.SUPER_ADMIN)) {
      where.assignedToId = user.id
    } else if (assignedToId) {
      where.assignedToId = assignedToId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (stage) where.stage = stage
    if (source) where.source = source
    if (projectId) where.projectId = projectId
    if (overdueFollowUp) {
      where.nextFollowUpDate = { lt: new Date() }
      where.stage = { notIn: [LeadStage.BOOKED, LeadStage.LOST, LeadStage.JUNK] }
    }

    const orderBy: Prisma.LeadOrderByWithRelationInput =
      sortBy === 'score' ? { score: sortOrder }
      : sortBy === 'name' ? { name: sortOrder }
      : { createdAt: sortOrder }

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: {
          assignedTo: { select: { id: true, name: true, avatar: true } },
          property: { select: { id: true, title: true, city: true } },
          project: { select: { id: true, name: true } },
          _count: { select: { activities: true, siteVisits: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ])

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getLeadById(id: string, user: RequestUser) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        activities: { orderBy: { doneAt: 'desc' }, take: 50 },
        siteVisits: { orderBy: { scheduledAt: 'desc' } },
        assignedTo: { select: { id: true, name: true, avatar: true, phone: true } },
        property: { select: { id: true, title: true, city: true } },
        project: { select: { id: true, name: true } },
      },
    })
    if (!lead) throw new NotFoundException('Lead not found')
    if (lead.orgId !== user.orgId) throw new ForbiddenException('Access denied')
    return lead
  }

  async updateLead(id: string, dto: UpdateLeadDto, user: RequestUser) {
    const lead = await this.prisma.lead.findUnique({ where: { id } })
    if (!lead) throw new NotFoundException('Lead not found')
    if (lead.orgId !== user.orgId) throw new ForbiddenException('Access denied')

    const prevStage = lead.stage
    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.stage && { stage: dto.stage }),
        ...(dto.score !== undefined && { score: dto.score }),
        ...(dto.budgetMin !== undefined && { budgetMin: dto.budgetMin }),
        ...(dto.budgetMax !== undefined && { budgetMax: dto.budgetMax }),
        ...(dto.preferredLocations && { preferredLocations: dto.preferredLocations }),
        ...(dto.preferredBhk && { preferredBhk: dto.preferredBhk }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.nextFollowUpDate && { nextFollowUpDate: new Date(dto.nextFollowUpDate) }),
        ...(dto.lostReason && { lostReason: dto.lostReason }),
        ...(dto.stage === LeadStage.BOOKED || dto.stage === LeadStage.LOST ? { closedAt: new Date() } : {}),
      },
    })

    // Log stage change as activity
    if (dto.stage && dto.stage !== prevStage) {
      await this.prisma.leadActivity.create({
        data: {
          leadId: id, type: 'STAGE_CHANGE',
          title: `Stage changed to ${dto.stage}`,
          description: dto.lostReason ? `Lost reason: ${dto.lostReason}` : undefined,
          doneById: user.id, doneAt: new Date(),
        },
      })
    }

    await this.redis.del(this.redis.key('crm', user.orgId!, 'pipeline'))
    return updated
  }

  async transferLead(id: string, dto: TransferLeadDto, user: RequestUser) {
    const lead = await this.prisma.lead.findUnique({ where: { id } })
    if (!lead) throw new NotFoundException('Lead not found')
    if (lead.orgId !== user.orgId) throw new ForbiddenException('Access denied')

    const prev = lead.assignedToId
    await this.prisma.lead.update({ where: { id }, data: { assignedToId: dto.toUserId } })

    await this.prisma.leadActivity.create({
      data: {
        leadId: id, type: 'NOTE',
        title: `Lead transferred`,
        description: dto.note ?? 'Lead transferred to new agent',
        doneById: user.id, doneAt: new Date(),
      },
    })

    await this.notifications.create({
      userId: dto.toUserId,
      type: NotificationType.LEAD_ASSIGNED,
      title: 'Lead transferred to you',
      body: `${lead.name} (${lead.phone}) has been transferred to you.`,
      data: { leadId: id },
    })

    return { message: 'Lead transferred successfully' }
  }

  // ─── Pipeline Overview ────────────────────────────────────────────────────

  async getPipeline(orgId: string, userId?: string) {
    const cacheKey = this.redis.key('crm', orgId, 'pipeline', userId ?? 'all')
    return this.redis.cached(cacheKey, async () => {
      const where: Prisma.LeadWhereInput = {
        orgId,
        stage: { notIn: [LeadStage.JUNK] },
        ...(userId && { assignedToId: userId }),
      }

      const [stageCounts, sourceCounts, overdue, recentLeads] = await Promise.all([
        this.prisma.lead.groupBy({
          by: ['stage'], where, _count: { stage: true },
          orderBy: { _count: { stage: 'desc' } },
        }),
        this.prisma.lead.groupBy({
          by: ['source'], where, _count: { source: true },
          orderBy: { _count: { source: 'desc' } }, take: 5,
        }),
        this.prisma.lead.count({
          where: { ...where, nextFollowUpDate: { lt: new Date() }, stage: { notIn: [LeadStage.BOOKED, LeadStage.LOST, LeadStage.JUNK] } },
        }),
        this.prisma.lead.findMany({
          where, orderBy: { createdAt: 'desc' }, take: 5,
          select: { id: true, name: true, phone: true, stage: true, score: true, createdAt: true },
        }),
      ])

      const stageOrder = [LeadStage.NEW, LeadStage.CONTACTED, LeadStage.INTERESTED, LeadStage.SITE_VISIT_SCHEDULED, LeadStage.SITE_VISIT_DONE, LeadStage.NEGOTIATION, LeadStage.BOOKED, LeadStage.LOST]
      const stageMap = Object.fromEntries(stageCounts.map((s) => [s.stage, s._count.stage]))
      const pipeline = stageOrder.map((stage) => ({ stage, count: stageMap[stage] ?? 0 }))

      return { pipeline, sources: sourceCounts, overdueFollowUps: overdue, recentLeads }
    }, 120)
  }

  // ─── Activities ───────────────────────────────────────────────────────────

  async addActivity(leadId: string, dto: CreateActivityDto, user: RequestUser) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) throw new NotFoundException('Lead not found')
    if (lead.orgId !== user.orgId) throw new ForbiddenException('Access denied')

    const activity = await this.prisma.leadActivity.create({
      data: {
        leadId, type: dto.type, title: dto.title,
        description: dto.description, outcome: dto.outcome,
        nextAction: dto.nextAction,
        nextActionDate: dto.nextActionDate ? new Date(dto.nextActionDate) : null,
        doneById: user.id, doneAt: new Date(),
      },
    })

    // Update follow-up date if next action specified
    if (dto.nextActionDate) {
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { nextFollowUpDate: new Date(dto.nextActionDate) },
      })
    }

    // Auto-score update based on activity
    await this.updateLeadScore(leadId, dto.type)

    return activity
  }

  async getActivities(leadId: string, page = 1, limit = 30) {
    const [items, total] = await Promise.all([
      this.prisma.leadActivity.findMany({
        where: { leadId }, skip: (page - 1) * limit, take: limit,
        orderBy: { doneAt: 'desc' },
      }),
      this.prisma.leadActivity.count({ where: { leadId } }),
    ])
    return { items, meta: { total, page, limit } }
  }

  // ─── Site Visits ──────────────────────────────────────────────────────────

  async scheduleSiteVisit(leadId: string, dto: ScheduleSiteVisitDto, user: RequestUser) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) throw new NotFoundException('Lead not found')

    const visit = await this.prisma.siteVisit.create({
      data: {
        leadId, projectId: dto.projectId,
        scheduledAt: new Date(dto.scheduledAt),
        conductedById: dto.conductedById ?? user.id,
        status: 'SCHEDULED',
      },
    })

    // Move lead to site visit scheduled stage
    if (lead.stage === LeadStage.NEW || lead.stage === LeadStage.CONTACTED || lead.stage === LeadStage.INTERESTED) {
      await this.prisma.lead.update({ where: { id: leadId }, data: { stage: LeadStage.SITE_VISIT_SCHEDULED } })
    }

    await this.prisma.leadActivity.create({
      data: {
        leadId, type: 'SITE_VISIT',
        title: `Site visit scheduled`,
        description: `Visit scheduled for ${new Date(dto.scheduledAt).toLocaleDateString('en-IN')}`,
        doneById: user.id, doneAt: new Date(),
      },
    })

    return visit
  }

  async completeSiteVisit(visitId: string, dto: CompleteSiteVisitDto, user: RequestUser) {
    const visit = await this.prisma.siteVisit.findUnique({ where: { id: visitId }, include: { lead: true } })
    if (!visit) throw new NotFoundException('Site visit not found')

    const updated = await this.prisma.siteVisit.update({
      where: { id: visitId },
      data: {
        status: dto.status, feedback: dto.feedback,
        rating: dto.rating, interestedUnits: dto.interestedUnits ?? [],
        conductedAt: dto.status === 'COMPLETED' ? new Date() : null,
      },
    })

    if (dto.status === 'COMPLETED' && visit.lead.stage === LeadStage.SITE_VISIT_SCHEDULED) {
      await this.prisma.lead.update({ where: { id: visit.leadId }, data: { stage: LeadStage.SITE_VISIT_DONE } })
      await this.updateLeadScore(visit.leadId, 'SITE_VISIT')
    }

    return updated
  }

  async getSiteVisits(filters: { orgId: string; from?: string; to?: string; status?: string }) {
    const where: Prisma.SiteVisitWhereInput = {
      lead: { orgId: filters.orgId },
      ...(filters.status && { status: filters.status }),
      ...(filters.from && { scheduledAt: { gte: new Date(filters.from) } }),
      ...(filters.to && { scheduledAt: { lte: new Date(filters.to) } }),
    }
    return this.prisma.siteVisit.findMany({
      where, orderBy: { scheduledAt: 'asc' },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
      },
      take: 100,
    })
  }

  // ─── Commissions ──────────────────────────────────────────────────────────

  async createCommission(dto: CreateCommissionDto, user: RequestUser) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { unit: { include: { floor: { include: { tower: { include: { project: true } } } } } } },
    })
    if (!booking) throw new NotFoundException('Booking not found')

    const existing = await this.prisma.commission.findUnique({ where: { bookingId: dto.bookingId } })
    if (existing) throw new ConflictException('Commission already exists for this booking')

    const baseAmount = Number(booking.finalAmount)
    const commissionAmount = (baseAmount * dto.percentage) / 100
    const gstAmount = commissionAmount * 0.18
    const tdsAmount = commissionAmount * 0.05
    const netPayable = commissionAmount + gstAmount - tdsAmount

    return this.prisma.commission.create({
      data: {
        bookingId: dto.bookingId, brokerId: user.id,
        agentId: dto.agentId,
        amount: commissionAmount, gstAmount, tdsAmount, netPayable,
        percentage: dto.percentage,
        status: CommissionStatus.PENDING,
        remarks: dto.remarks,
      },
      include: {
        booking: {
          include: {
            unit: { select: { unitNumber: true } },
            buyer: { select: { name: true } },
          },
        },
      },
    })
  }

  async getCommissions(user: RequestUser, page = 1, limit = 20, status?: string) {
    const isAdmin = user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN)
    const where: Prisma.CommissionWhereInput = {
      ...(!isAdmin && { brokerId: user.id }),
      ...(status && { status: status as CommissionStatus }),
    }

    const [items, total, summary] = await Promise.all([
      this.prisma.commission.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              unit: { select: { unitNumber: true, bhkType: true } },
              buyer: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.commission.count({ where }),
      this.prisma.commission.aggregate({
        where, _sum: { amount: true, netPayable: true },
        _count: { id: true },
      }),
    ])

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      summary: {
        total: Number(summary._sum.amount ?? 0),
        netPayable: Number(summary._sum.netPayable ?? 0),
        count: summary._count.id,
      },
    }
  }

  async updateCommissionStatus(id: string, dto: UpdateCommissionStatusDto, user: RequestUser) {
    const commission = await this.prisma.commission.findUnique({ where: { id } })
    if (!commission) throw new NotFoundException('Commission not found')

    const isAdmin = user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN)
    if (!isAdmin && dto.status === 'APPROVED') throw new ForbiddenException('Only admins can approve commissions')

    const updated = await this.prisma.commission.update({
      where: { id },
      data: {
        status: dto.status as CommissionStatus,
        ...(dto.status === 'APPROVED' && { approvedById: user.id, approvedAt: new Date() }),
        ...(dto.remarks && { remarks: dto.remarks }),
      },
    })

    if (dto.status === 'APPROVED') {
      await this.notifications.create({
        userId: commission.brokerId,
        type: NotificationType.COMMISSION_APPROVED,
        title: 'Commission approved',
        body: `Your commission of ₹${Number(commission.netPayable).toLocaleString('en-IN')} has been approved.`,
        data: { commissionId: id },
      })
    }

    return updated
  }

  async recordCommissionPayment(dto: RecordCommissionPaymentDto, user: RequestUser) {
    const commission = await this.prisma.commission.findUnique({ where: { id: dto.commissionId } })
    if (!commission) throw new NotFoundException('Commission not found')
    if (commission.status !== CommissionStatus.APPROVED)
      throw new BadRequestException('Commission must be approved before payment')

    return this.prisma.commission.update({
      where: { id: dto.commissionId },
      data: {
        status: CommissionStatus.PAID, paidAt: new Date(),
        paymentReference: dto.paymentReference,
        invoiceNumber: dto.invoiceNumber, invoiceUrl: dto.invoiceUrl,
      },
    })
  }

  // ─── Customers ────────────────────────────────────────────────────────────

  async createCustomer(dto: CreateCustomerDto, user: RequestUser) {
    if (!user.orgId) throw new ForbiddenException('Must belong to an organisation')
    return this.prisma.customer.create({
      data: {
        orgId: user.orgId, name: dto.name, email: dto.email,
        phone: dto.phone, pan: dto.pan, aadhaar: dto.aadhaar,
        occupation: dto.occupation, annualIncome: dto.annualIncome, tags: dto.tags ?? [],
      },
    })
  }

  async getCustomers(orgId: string, page = 1, limit = 20, search?: string) {
    const where: Prisma.CustomerWhereInput = {
      orgId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }
    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.customer.count({ where }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getCustomerById(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, include: { documents: true } })
    if (!customer) throw new NotFoundException('Customer not found')
    return customer
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    return this.prisma.customer.update({ where: { id }, data: { ...dto } })
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private calculateInitialScore(dto: CreateLeadDto): number {
    let score = 20
    if (dto.email) score += 10
    if (dto.budgetMin && dto.budgetMax) score += 15
    if (dto.preferredLocations?.length) score += 10
    if (dto.preferredBhk?.length) score += 10
    if (dto.source === LeadSource.REFERRAL) score += 15
    if (dto.source === LeadSource.WALK_IN) score += 10
    if (dto.propertyId || dto.projectId) score += 10
    return Math.min(score, 100)
  }

  private async updateLeadScore(leadId: string, activityType: string): Promise<void> {
    const increments: Record<string, number> = {
      CALL: 5, EMAIL: 3, MEETING: 8, SITE_VISIT: 15,
      WHATSAPP: 2, FOLLOW_UP: 3,
    }
    const increment = increments[activityType]
    if (!increment) return

    const lead = await this.prisma.lead.findUnique({ where: { id: leadId }, select: { score: true } })
    if (!lead) return

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { score: Math.min((lead.score ?? 0) + increment, 100) },
    })
  }
}
