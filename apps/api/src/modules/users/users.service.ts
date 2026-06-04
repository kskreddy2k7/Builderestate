import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import { FilesService } from '@/shared/files/files.service'
import type { Prisma } from '@prisma/client'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly files: FilesService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { orgMemberships: { include: { org: true } } },
      // @ts-ignore`n      omit: { passwordHash: true, emailVerifyToken: true, phoneOtp: true },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    if (data.phone) {
      const existing = await this.prisma.user.findFirst({
        where: { phone: data.phone, id: { not: userId } },
      })
      if (existing) throw new ConflictException('Phone number already in use')
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { ...(data.name && { name: data.name }), ...(data.phone && { phone: data.phone }) },
      // @ts-ignore`n      omit: { passwordHash: true, emailVerifyToken: true, phoneOtp: true },
    })
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const result = await this.files.uploadFile(file, {
      folder: `avatars/${userId}`,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSizeMB: 5,
      resize: { width: 400, height: 400, fit: 'cover' },
    })
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: result.url },
      select: { id: true, avatar: true },
    })
  }

  async getOrganisation(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true, roles: true } } } },
      },
    })
    if (!org) throw new NotFoundException('Organisation not found')
    return org
  }

  async getNotifications(userId: string, page = 1, limit = 30) {
    const [items, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ])
    return { items, meta: { total, page, limit }, unreadCount: unread }
  }
}
