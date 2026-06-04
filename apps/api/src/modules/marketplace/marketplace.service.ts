import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Logger,
} from '@nestjs/common'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import { FilesService } from '@/shared/files/files.service'
import { NotificationsService } from '@/shared/notifications/notifications.service'
import { slugify } from '@buildestate/utils'
import { PropertyStatus, VerificationStatus, NotificationType, UserRole } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import type { RequestUser } from '@/common/decorators'
import type {
  CreatePropertyDto, UpdatePropertyDto, PropertySearchDto,
  CreateEnquiryDto, VerifyPropertyDto,
} from './dto/marketplace.dto'

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name)
  private readonly CACHE_TTL = 300

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly files: FilesService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreatePropertyDto, user: RequestUser) {
    const baseSlug = slugify(dto.title)
    const existing = await this.prisma.property.findMany({
      where: { slug: { startsWith: baseSlug } },
      select: { slug: true },
    })
    const existingSlugs = existing.map((p) => p.slug)
    let slug = baseSlug
    let counter = 1
    while (existingSlugs.includes(slug)) slug = `${baseSlug}-${counter++}`

    const property = await this.prisma.property.create({
      data: {
        title: dto.title, slug, description: dto.description,
        type: dto.type, transactionType: dto.transactionType,
        listedById: user.id, orgId: user.orgId,
        addressLine1: dto.address.line1, addressLine2: dto.address.line2,
        city: dto.address.city, state: dto.address.state, pincode: dto.address.pincode,
        latitude: dto.address.latitude, longitude: dto.address.longitude,
        price: dto.price,
        pricePerSqft: dto.area > 0 ? dto.price / dto.area : null,
        area: dto.area, bhkType: dto.bhkType, bathrooms: dto.bathrooms,
        balconies: dto.balconies, facing: dto.facing,
        floorNumber: dto.floorNumber, totalFloors: dto.totalFloors,
        furnishingStatus: dto.furnishingStatus, reraNumber: dto.reraNumber,
        possessionDate: dto.possessionDate ? new Date(dto.possessionDate) : null,
        amenities: dto.amenities ?? [],
        status: PropertyStatus.DRAFT,
        verificationStatus: VerificationStatus.PENDING,
      },
      include: { listedBy: { select: { id: true, name: true, email: true } }, org: true },
    })
    await this.redis.invalidate(this.redis.key('properties:*'))
    return property
  }

  async search(dto: PropertySearchDto) {
    const {
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc',
      search, type, transactionType, city, state, pincode,
      minPrice, maxPrice, minArea, maxArea, bhkType, reraVerified,
    } = dto

    const where: Prisma.PropertyWhereInput = { status: PropertyStatus.ACTIVE, deletedAt: null }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { addressLine1: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (type) where.type = type
    if (transactionType) where.transactionType = transactionType
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (state) where.state = { contains: state, mode: 'insensitive' }
    if (pincode) where.pincode = pincode
    if (bhkType) where.bhkType = bhkType
    if (reraVerified) where.reraStatus = VerificationStatus.VERIFIED
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      }
    }
    if (minArea !== undefined || maxArea !== undefined) {
      where.area = {
        ...(minArea !== undefined && { gte: minArea }),
        ...(maxArea !== undefined && { lte: maxArea }),
      }
    }

    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      sortBy === 'price' ? { price: sortOrder }
      : sortBy === 'area' ? { area: sortOrder }
      : sortBy === 'viewCount' ? { viewCount: sortOrder }
      : { createdAt: sortOrder }

    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where, orderBy, skip, take: limit,
        include: {
          media: { where: { isPrimary: true }, take: 1 },
          listedBy: { select: { id: true, name: true, avatar: true } },
          org: { select: { id: true, name: true, logo: true } },
        },
      }),
      this.prisma.property.count({ where }),
    ])

    const [typeFacets, cityFacets] = await Promise.all([
      this.prisma.property.groupBy({
        by: ['type'], where: { ...where, type: undefined }, _count: { type: true },
      }),
      this.prisma.property.groupBy({
        by: ['city'], where: { ...where, city: undefined },
        _count: { city: true }, orderBy: { _count: { city: 'desc' } }, take: 10,
      }),
    ])

    return {
      items,
      meta: {
        total, page, limit, totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total, hasPreviousPage: page > 1,
        facets: {
          types: Object.fromEntries(typeFacets.map((f) => [f.type, f._count.type])),
          cities: cityFacets.map((f) => ({ city: f.city, count: f._count.city })),
        },
      },
    }
  }

  async findById(id: string, incrementView = false) {
    const cacheKey = this.redis.key('property', id)
    if (!incrementView) {
      const cached = await this.redis.get(cacheKey)
      if (cached) return cached
    }
    const property = await this.prisma.property.findUnique({
      where: { id, deletedAt: null },
      include: {
        media: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
        documents: { where: { isPublic: true } },
        listedBy: { select: { id: true, name: true, avatar: true, phone: true } },
        org: { select: { id: true, name: true, logo: true, reraNumber: true } },
        _count: { select: { enquiries: true } },
      },
    })
    if (!property) throw new NotFoundException('Property not found')
    if (incrementView) {
      await this.prisma.property.update({ where: { id }, data: { viewCount: { increment: 1 } } })
    } else {
      await this.redis.set(cacheKey, property, this.CACHE_TTL)
    }
    return property
  }

  async findBySlug(slug: string) {
    const property = await this.prisma.property.findUnique({
      where: { slug, deletedAt: null },
      include: {
        media: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
        documents: { where: { isPublic: true } },
        listedBy: { select: { id: true, name: true, avatar: true } },
        org: { select: { id: true, name: true, logo: true, reraNumber: true } },
        _count: { select: { enquiries: true } },
      },
    })
    if (!property) throw new NotFoundException('Property not found')
    this.prisma.property.update({ where: { id: property.id }, data: { viewCount: { increment: 1 } } }).catch(() => null)
    return property
  }

  async update(id: string, dto: UpdatePropertyDto, user: RequestUser) {
    const property = await this.prisma.property.findUnique({ where: { id } })
    if (!property) throw new NotFoundException('Property not found')
    const isOwner = property.listedById === user.id
    const isAdmin = user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN)
    if (!isOwner && !isAdmin) throw new ForbiddenException('Not authorized')

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title, slug: slugify(dto.title) }),
        ...(dto.description && { description: dto.description }),
        ...(dto.price && { price: dto.price, pricePerSqft: dto.area ? dto.price / dto.area : undefined }),
        ...(dto.area && { area: dto.area }),
        ...(dto.status && { status: dto.status }),
        ...(dto.bhkType && { bhkType: dto.bhkType }),
        ...(dto.bathrooms && { bathrooms: dto.bathrooms }),
        ...(dto.amenities && { amenities: dto.amenities }),
        ...(dto.furnishingStatus && { furnishingStatus: dto.furnishingStatus }),
        ...(dto.reraNumber && { reraNumber: dto.reraNumber }),
      },
    })
    await this.redis.del(this.redis.key('property', id))
    return updated
  }

  async uploadMedia(propertyId: string, files: Express.Multer.File[], user: RequestUser) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) throw new NotFoundException('Property not found')
    if (property.listedById !== user.id) throw new ForbiddenException('Not authorized')

    const results = await this.files.uploadMultiple(files, {
      folder: `properties/${propertyId}/media`,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSizeMB: 10, resize: { width: 1920, height: 1080, fit: 'cover' }, generateThumbnail: true,
    })
    const existingCount = await this.prisma.propertyMedia.count({ where: { propertyId } })
    const created = await this.prisma.propertyMedia.createMany({
      data: results.map((r, i) => ({
        propertyId, url: r.url, type: 'IMAGE',
        isPrimary: existingCount === 0 && i === 0, order: existingCount + i,
      })),
    })
    await this.redis.del(this.redis.key('property', propertyId))
    return { uploaded: created.count }
  }

  async submitForReview(id: string, user: RequestUser) {
    const property = await this.prisma.property.findUnique({ where: { id } })
    if (!property) throw new NotFoundException('Property not found')
    if (property.listedById !== user.id) throw new ForbiddenException('Not authorized')
    if (property.status !== PropertyStatus.DRAFT)
      throw new BadRequestException('Only draft properties can be submitted')
    const mediaCount = await this.prisma.propertyMedia.count({ where: { propertyId: id } })
    if (mediaCount === 0) throw new BadRequestException('Add at least one photo before submitting')
    await this.prisma.property.update({
      where: { id },
      data: { status: PropertyStatus.UNDER_REVIEW, verificationStatus: VerificationStatus.UNDER_REVIEW },
    })
    return { message: 'Property submitted for review' }
  }

  async verify(id: string, dto: VerifyPropertyDto, adminId: string) {
    const property = await this.prisma.property.findUnique({ where: { id }, include: { listedBy: true } })
    if (!property) throw new NotFoundException('Property not found')
    const isApproved = dto.decision === 'VERIFIED'
    await this.prisma.property.update({
      where: { id },
      data: {
        verificationStatus: isApproved ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
        status: isApproved ? PropertyStatus.ACTIVE : PropertyStatus.DRAFT,
        ...(isApproved && { verifiedAt: new Date(), verifiedBy: adminId }),
      },
    })
    await this.notifications.create({
      userId: property.listedById,
      type: NotificationType.PROPERTY_VERIFIED,
      title: isApproved ? 'Property listing approved' : 'Property listing rejected',
      body: isApproved
        ? `Your listing "${property.title}" is now live.`
        : `Your listing "${property.title}" was rejected. ${dto.reason ?? ''}`,
      data: { propertyId: id },
    })
    await this.redis.del(this.redis.key('property', id))
    return { message: `Property ${isApproved ? 'approved' : 'rejected'}` }
  }

  async createEnquiry(propertyId: string, dto: CreateEnquiryDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId }, include: { listedBy: true },
    })
    if (!property) throw new NotFoundException('Property not found')
    const enquiry = await this.prisma.propertyEnquiry.create({
      data: { propertyId, name: dto.name, email: dto.email, phone: dto.phone,
              message: dto.message, budget: dto.budget, source: dto.source ?? 'PORTAL' },
    })
    await this.prisma.property.update({ where: { id: propertyId }, data: { enquiryCount: { increment: 1 } } })
    await this.notifications.create({
      userId: property.listedById,
      type: NotificationType.LEAD_ASSIGNED,
      title: 'New property enquiry',
      body: `${dto.name} (${dto.phone}) enquired about "${property.title}"`,
      data: { propertyId, enquiryId: enquiry.id },
    })
    return enquiry
  }

  async toggleSave(propertyId: string, userId: string) {
    const exists = await this.prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    })
    if (exists) {
      await this.prisma.savedProperty.delete({ where: { userId_propertyId: { userId, propertyId } } })
      return { saved: false }
    }
    await this.prisma.savedProperty.create({ data: { userId, propertyId } })
    return { saved: true }
  }

  async getSavedProperties(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [saved, total] = await Promise.all([
      this.prisma.savedProperty.findMany({
        where: { userId }, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { property: { include: { media: { where: { isPrimary: true }, take: 1 } } } },
      }),
      this.prisma.savedProperty.count({ where: { userId } }),
    ])
    return { items: saved.map((s) => s.property), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getMyListings(userId: string, page = 1, limit = 20, status?: PropertyStatus) {
    const where: Prisma.PropertyWhereInput = { listedById: userId, deletedAt: null, ...(status && { status }) }
    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { media: { where: { isPrimary: true }, take: 1 }, _count: { select: { enquiries: true } } },
      }),
      this.prisma.property.count({ where }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async remove(id: string, user: RequestUser) {
    const property = await this.prisma.property.findUnique({ where: { id } })
    if (!property) throw new NotFoundException('Property not found')
    const isOwner = property.listedById === user.id
    const isAdmin = user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN)
    if (!isOwner && !isAdmin) throw new ForbiddenException('Not authorized')
    await this.prisma.property.update({ where: { id }, data: { deletedAt: new Date(), status: PropertyStatus.INACTIVE } })
    await this.redis.del(this.redis.key('property', id))
    return { message: 'Property removed' }
  }

  async getFeatured(limit = 6) {
    return this.redis.cached(
      this.redis.key('properties:featured'),
      () => this.prisma.property.findMany({
        where: { status: PropertyStatus.ACTIVE, isFeatured: true, deletedAt: null },
        take: limit, orderBy: { viewCount: 'desc' },
        include: { media: { where: { isPrimary: true }, take: 1 } },
      }),
      this.CACHE_TTL,
    )
  }

  async getStats(orgId?: string) {
    const where = orgId ? { orgId } : {}
    const [total, active, pending, sold] = await Promise.all([
      this.prisma.property.count({ where: { ...where, deletedAt: null } }),
      this.prisma.property.count({ where: { ...where, status: PropertyStatus.ACTIVE } }),
      this.prisma.property.count({ where: { ...where, status: PropertyStatus.UNDER_REVIEW } }),
      this.prisma.property.count({ where: { ...where, status: PropertyStatus.SOLD } }),
    ])
    return { total, active, pending, sold }
  }
}
