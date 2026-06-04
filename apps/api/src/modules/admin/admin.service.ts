import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import { UserStatus, PropertyStatus, VerificationStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ─── Platform Analytics ───────────────────────────────────────────────────

  async getPlatformStats() {
    return this.redis.cached(this.redis.key('admin:stats'), async () => {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const [
        totalUsers, activeUsers, newUsersThisMonth,
        totalProperties, activeProperties, pendingVerifications,
        totalProjects, activeProjects,
        bookingsThisMonth, bookingsValue,
        totalPayments, paymentsThisMonth,
        openComplaints, openNCRs,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
        this.prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
        this.prisma.property.count({ where: { deletedAt: null } }),
        this.prisma.property.count({ where: { status: PropertyStatus.ACTIVE } }),
        this.prisma.property.count({ where: { status: PropertyStatus.UNDER_REVIEW } }),
        this.prisma.project.count(),
        this.prisma.project.count({ where: { status: { in: ['UNDER_CONSTRUCTION', 'APPROVED'] } } }),
        this.prisma.booking.count({ where: { createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } } }),
        this.prisma.booking.aggregate({
          where: { status: { not: 'CANCELLED' } }, _sum: { finalAmount: true },
        }),
        this.prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { totalAmount: true } }),
        this.prisma.payment.aggregate({
          where: { status: 'COMPLETED', paidAt: { gte: monthStart } }, _sum: { totalAmount: true },
        }),
        this.prisma.complaint.count({ where: { status: { not: 'CLOSED' } } }),
        this.prisma.nCReport.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
      ])

      return {
        users: { total: totalUsers, active: activeUsers, newThisMonth: newUsersThisMonth },
        properties: { total: totalProperties, active: activeProperties, pendingVerifications },
        projects: { total: totalProjects, active: activeProjects },
        bookings: { thisMonth: bookingsThisMonth, totalValue: Number(bookingsValue._sum.finalAmount ?? 0) },
        payments: { totalCollected: Number(totalPayments._sum.totalAmount ?? 0), thisMonth: Number(paymentsThisMonth._sum.totalAmount ?? 0) },
        operations: { openComplaints, openNCRs },
      }
    }, 300)
  }

  // ─── User Management ──────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 20, filters: {
    search?: string; role?: string; status?: UserStatus; orgId?: string
  } = {}) {
    const where: Prisma.UserWhereInput = {
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search } },
        ],
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.role && { roles: { has: filters.role as any } }),
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          orgMemberships: { include: { org: { select: { id: true, name: true, type: true } } } },
        },
        // @ts-ignore`n        omit: { passwordHash: true, emailVerifyToken: true, phoneOtp: true },
      }),
      this.prisma.user.count({ where }),
    ])

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        orgMemberships: { include: { org: true } },
        _count: { select: { notifications: true } },
      },
      // @ts-ignore`n        omit: { passwordHash: true, emailVerifyToken: true, phoneOtp: true },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async updateUserStatus(id: string, status: UserStatus, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    return this.prisma.user.update({ where: { id }, data: { status } })
  }

  // ─── Property Verification Queue ─────────────────────────────────────────

  async getVerificationQueue(page = 1, limit = 20, type?: 'property' | 'project' | 'org') {
    const results: Record<string, unknown> = {}

    if (!type || type === 'property') {
      const [items, total] = await Promise.all([
        this.prisma.property.findMany({
          where: { status: PropertyStatus.UNDER_REVIEW, deletedAt: null },
          skip: (page - 1) * limit, take: limit, orderBy: { updatedAt: 'asc' },
          include: {
            listedBy: { select: { name: true, email: true, phone: true } },
            org: { select: { name: true, reraNumber: true } },
            media: { where: { isPrimary: true }, take: 1 },
          },
        }),
        this.prisma.property.count({ where: { status: PropertyStatus.UNDER_REVIEW } }),
      ])
      results['properties'] = { items, meta: { total, page, limit } }
    }

    if (!type || type === 'org') {
      const [items, total] = await Promise.all([
        this.prisma.organization.findMany({
          where: { verificationStatus: VerificationStatus.PENDING },
          skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'asc' },
        }),
        this.prisma.organization.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      ])
      results['orgs'] = { items, meta: { total, page, limit } }
    }

    return results
  }

  // ─── Audit Logs ───────────────────────────────────────────────────────────

  async getAuditLogs(page = 1, limit = 50, filters: { userId?: string; resource?: string; from?: string; to?: string } = {}) {
    const where: Prisma.AuditLogWhereInput = {
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.resource && { resource: filters.resource }),
      ...(filters.from && { createdAt: { gte: new Date(filters.from) } }),
      ...(filters.to && { createdAt: { lte: new Date(filters.to) } }),
    }
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  // ─── Organisation Verification ────────────────────────────────────────────

  async verifyOrganization(id: string, decision: 'VERIFIED' | 'REJECTED', adminId: string, reason?: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } })
    if (!org) throw new NotFoundException('Organisation not found')
    return this.prisma.organization.update({
      where: { id },
      data: {
        verificationStatus: decision === 'VERIFIED' ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
        ...(decision === 'VERIFIED' && { verifiedAt: new Date(), verifiedBy: adminId }),
      },
    })
  }
}
