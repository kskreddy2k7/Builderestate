"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ConstructionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const redis_service_1 = require("../../shared/cache/redis.service");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const files_service_1 = require("../../shared/files/files.service");
const utils_1 = require("@buildestate/utils");
const client_1 = require("@prisma/client");
let ConstructionService = ConstructionService_1 = class ConstructionService {
    prisma;
    redis;
    notifications;
    files;
    logger = new common_1.Logger(ConstructionService_1.name);
    constructor(prisma, redis, notifications, files) {
        this.prisma = prisma;
        this.redis = redis;
        this.notifications = notifications;
        this.files = files;
    }
    // ─── Projects ─────────────────────────────────────────────────────────────
    async createProject(dto, user) {
        if (!user.orgId)
            throw new common_1.ForbiddenException('You must belong to an organisation');
        const baseSlug = (0, utils_1.slugify)(dto.name);
        const existing = await this.prisma.project.findMany({ where: { slug: { startsWith: baseSlug } }, select: { slug: true } });
        let slug = baseSlug;
        let counter = 1;
        while (existing.map((p) => p.slug).includes(slug))
            slug = `${baseSlug}-${counter++}`;
        return this.prisma.project.create({
            data: {
                orgId: user.orgId, name: dto.name, slug, description: dto.description,
                addressLine1: dto.addressLine1, city: dto.city, state: dto.state, pincode: dto.pincode,
                latitude: dto.latitude, longitude: dto.longitude,
                totalArea: dto.totalArea ?? 0, reraNumber: dto.reraNumber,
                startDate: new Date(dto.startDate),
                expectedCompletionDate: new Date(dto.expectedCompletionDate),
                amenities: dto.amenities ?? [],
                status: client_1.ProjectStatus.PLANNING,
            },
        });
    }
    async getProjects(orgId, page = 1, limit = 20, status) {
        const where = { orgId, ...(status && { status }) };
        const [items, total] = await Promise.all([
            this.prisma.project.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { towers: true, milestones: true } },
                    phases: { select: { id: true, name: true, status: true } },
                },
            }),
            this.prisma.project.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getProjectById(id) {
        const cacheKey = this.redis.key('project', id);
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                phases: true,
                towers: { include: { floors: { include: { units: { orderBy: { unitNumber: 'asc' } } } } } },
                milestones: { orderBy: { plannedStartDate: 'asc' } },
                budget: { include: { heads: true } },
                _count: { select: { workOrders: true, inspections: true, dailyReports: true } },
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        await this.redis.set(cacheKey, project, 300);
        return project;
    }
    async updateProject(id, dto, user) {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.orgId !== user.orgId && !user.roles.includes(client_1.UserRole.ADMIN))
            throw new common_1.ForbiddenException('Not authorized');
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
        });
        await this.redis.del(this.redis.key('project', id));
        return updated;
    }
    // ─── Towers ────────────────────────────────────────────────────────────────
    async createTower(projectId, dto, user) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.orgId !== user.orgId)
            throw new common_1.ForbiddenException('Not authorized');
        const totalUnits = dto.numberOfFloors * dto.numberOfUnitsPerFloor;
        const tower = await this.prisma.tower.create({
            data: {
                projectId, name: dto.name, phaseId: dto.phaseId,
                numberOfFloors: dto.numberOfFloors,
                numberOfUnitsPerFloor: dto.numberOfUnitsPerFloor,
                totalUnits, status: client_1.ProjectStatus.PLANNING,
            },
        });
        // Auto-create floors
        const floorData = Array.from({ length: dto.numberOfFloors }, (_, i) => ({
            towerId: tower.id,
            floorNumber: i + 1,
            label: i === 0 ? 'Ground Floor' : `Floor ${i + 1}`,
        }));
        await this.prisma.floor.createMany({ data: floorData });
        // Update project unit count
        await this.prisma.project.update({
            where: { id: projectId },
            data: {
                numberOfTowers: { increment: 1 },
                numberOfUnits: { increment: totalUnits },
            },
        });
        await this.redis.del(this.redis.key('project', projectId));
        return this.prisma.tower.findUnique({ where: { id: tower.id }, include: { floors: true } });
    }
    async createUnit(floorId, dto) {
        const floor = await this.prisma.floor.findUnique({ where: { id: floorId } });
        if (!floor)
            throw new common_1.NotFoundException('Floor not found');
        const finalPrice = dto.basePrice + (dto.floorRisePremium ?? 0) + (dto.facingPremium ?? 0);
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
                status: client_1.UnitStatus.AVAILABLE,
            },
        });
    }
    async getUnitInventory(projectId) {
        const cacheKey = this.redis.key('project', projectId, 'inventory');
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return cached;
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
        ]);
        const summary = {
            total: 0, available: 0, booked: 0, sold: 0, held: 0,
            totalValue: 0, bookedValue: 0,
        };
        for (const stat of unitStats) {
            const count = stat._count.status;
            const value = Number(stat._sum.finalPrice ?? 0);
            summary.total += count;
            if (stat.status === client_1.UnitStatus.AVAILABLE)
                summary.available += count;
            if (stat.status === client_1.UnitStatus.BOOKED || stat.status === client_1.UnitStatus.AGREEMENT_DONE) {
                summary.booked += count;
                summary.bookedValue += value;
            }
            if (stat.status === client_1.UnitStatus.REGISTERED || stat.status === client_1.UnitStatus.POSSESSION_GIVEN)
                summary.sold += count;
            if (stat.status === client_1.UnitStatus.HOLD)
                summary.held += count;
            summary.totalValue += value;
        }
        const result = { towers, summary };
        await this.redis.set(cacheKey, result, 120);
        return result;
    }
    // ─── Milestones ────────────────────────────────────────────────────────────
    async createMilestone(projectId, dto) {
        return this.prisma.milestone.create({
            data: {
                projectId, name: dto.name, description: dto.description,
                phaseId: dto.phaseId,
                plannedStartDate: new Date(dto.plannedStartDate),
                plannedEndDate: new Date(dto.plannedEndDate),
                linkedPaymentPercentage: dto.linkedPaymentPercentage,
                dependencies: dto.dependencies ?? [],
                status: client_1.MilestoneStatus.NOT_STARTED,
                completionPercentage: 0,
            },
        });
    }
    async updateMilestone(id, dto, user) {
        const milestone = await this.prisma.milestone.findUnique({ where: { id }, include: { project: true } });
        if (!milestone)
            throw new common_1.NotFoundException('Milestone not found');
        if (milestone.project.orgId !== user.orgId)
            throw new common_1.ForbiddenException('Not authorized');
        const wasCompleted = milestone.status !== client_1.MilestoneStatus.COMPLETED;
        const nowCompleted = dto.status === client_1.MilestoneStatus.COMPLETED;
        const updated = await this.prisma.milestone.update({
            where: { id },
            data: {
                ...(dto.status && { status: dto.status }),
                ...(dto.completionPercentage !== undefined && { completionPercentage: dto.completionPercentage }),
                ...(dto.actualStartDate && { actualStartDate: new Date(dto.actualStartDate) }),
                ...(dto.actualEndDate && { actualEndDate: new Date(dto.actualEndDate) }),
                ...(dto.name && { name: dto.name }),
            },
        });
        // When milestone completes, notify buyers who have payment tied to it
        if (wasCompleted && nowCompleted) {
            const scheduleItems = await this.prisma.paymentScheduleItem.findMany({
                where: { milestoneId: id, status: 'PENDING' },
                include: { booking: { include: { buyer: true } } },
            });
            for (const item of scheduleItems) {
                await this.notifications.create({
                    userId: item.booking.buyerId,
                    type: client_1.NotificationType.MILESTONE_COMPLETED,
                    title: 'Construction milestone completed',
                    body: `The "${milestone.name}" milestone is complete. A payment demand will be raised soon.`,
                    data: { milestoneId: id, projectId: milestone.projectId },
                });
            }
        }
        await this.redis.del(this.redis.key('project', milestone.projectId));
        return updated;
    }
    async getMilestones(projectId) {
        return this.prisma.milestone.findMany({
            where: { projectId },
            orderBy: { plannedStartDate: 'asc' },
            include: {
                paymentScheduleItems: {
                    where: { status: { not: 'PAID' } },
                    select: { id: true, amount: true, status: true, dueDate: true },
                },
            },
        });
    }
    // ─── Progress Updates ──────────────────────────────────────────────────────
    async createProgressUpdate(projectId, dto, files, user) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        let mediaUrls = [];
        if (files?.length) {
            const results = await this.files.uploadMultiple(files, {
                folder: `projects/${projectId}/progress`,
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
                maxSizeMB: 50,
                generateThumbnail: true,
            });
            mediaUrls = results.map((r) => r.url);
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
        });
        // Notify buyers if visible
        if (dto.isVisibleToBuyers !== false) {
            const bookings = await this.prisma.booking.findMany({
                where: { unit: { floor: { tower: { projectId } } } },
                select: { buyerId: true },
                distinct: ['buyerId'],
            });
            if (bookings.length) {
                await this.notifications.createBulk(bookings.map((b) => b.buyerId), {
                    type: client_1.NotificationType.PROGRESS_UPDATE,
                    title: 'Construction update',
                    body: `${dto.title} — ${dto.completionPercentage}% complete`,
                    data: { projectId, updateId: update.id },
                });
            }
        }
        return update;
    }
    async getProgressUpdates(projectId, page = 1, limit = 20) {
        const [items, total] = await Promise.all([
            this.prisma.progressUpdate.findMany({
                where: { projectId },
                skip: (page - 1) * limit, take: limit,
                orderBy: { createdAt: 'desc' },
                include: { postedBy: { select: { id: true, name: true, avatar: true } } },
            }),
            this.prisma.progressUpdate.count({ where: { projectId } }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    // ─── Daily Site Reports ────────────────────────────────────────────────────
    async createDSR(projectId, dto, files, user) {
        const reportDate = new Date(dto.reportDate);
        const existing = await this.prisma.dailySiteReport.findUnique({
            where: { projectId_reportDate: { projectId, reportDate } },
        });
        if (existing)
            throw new common_1.BadRequestException('A report for this date already exists');
        let mediaUrls = [];
        if (files?.length) {
            const results = await this.files.uploadMultiple(files, {
                folder: `projects/${projectId}/reports`,
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                maxSizeMB: 10, generateThumbnail: true,
            });
            mediaUrls = results.map((r) => r.url);
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
        });
    }
    async getDSRs(projectId, page = 1, limit = 30) {
        const [items, total] = await Promise.all([
            this.prisma.dailySiteReport.findMany({
                where: { projectId }, skip: (page - 1) * limit, take: limit,
                orderBy: { reportDate: 'desc' },
                include: { preparedBy: { select: { id: true, name: true } } },
            }),
            this.prisma.dailySiteReport.count({ where: { projectId } }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async approveDSR(id, dto, user) {
        const report = await this.prisma.dailySiteReport.findUnique({ where: { id } });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        return this.prisma.dailySiteReport.update({
            where: { id },
            data: {
                status: dto.status === 'APPROVED' ? 'APPROVED' : 'DRAFT',
                approvedById: dto.status === 'APPROVED' ? user.id : null,
                approvedAt: dto.status === 'APPROVED' ? new Date() : null,
            },
        });
    }
    // ─── Quality Checks ────────────────────────────────────────────────────────
    async createQualityCheck(projectId, dto, files, user) {
        let mediaUrls = [];
        if (files?.length) {
            const results = await this.files.uploadMultiple(files, {
                folder: `projects/${projectId}/quality`, allowedTypes: ['image/jpeg', 'image/png'], maxSizeMB: 10,
            });
            mediaUrls = results.map((r) => r.url);
        }
        return this.prisma.qualityCheck.create({
            data: {
                projectId, activity: dto.activity, location: dto.location,
                checklistItems: dto.checklistItems,
                overallStatus: dto.overallStatus,
                inspectedById: user.id, inspectedAt: new Date(),
                remarks: dto.remarks, mediaUrls,
            },
        });
    }
    async getQualityChecks(projectId, page = 1, limit = 20) {
        const [items, total] = await Promise.all([
            this.prisma.qualityCheck.findMany({
                where: { projectId }, skip: (page - 1) * limit, take: limit,
                orderBy: { inspectedAt: 'desc' },
            }),
            this.prisma.qualityCheck.count({ where: { projectId } }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    // ─── Dashboard Summary ────────────────────────────────────────────────────
    async getProjectSummary(projectId) {
        const cacheKey = this.redis.key('project', projectId, 'summary');
        return this.redis.cached(cacheKey, async () => {
            const [project, milestoneStats, unitStats, latestProgress, pendingDSRs] = await Promise.all([
                this.prisma.project.findUnique({ where: { id: projectId }, select: { name: true, status: true, expectedCompletionDate: true } }),
                this.prisma.milestone.groupBy({ by: ['status'], where: { projectId }, _count: { status: true } }),
                this.prisma.unit.groupBy({
                    by: ['status'], where: { floor: { tower: { projectId } } }, _count: { status: true },
                }),
                this.prisma.progressUpdate.findFirst({ where: { projectId }, orderBy: { createdAt: 'desc' }, select: { completionPercentage: true, createdAt: true } }),
                this.prisma.dailySiteReport.count({ where: { projectId, status: 'SUBMITTED' } }),
            ]);
            const msMap = Object.fromEntries(milestoneStats.map((s) => [s.status, s._count.status]));
            const unitMap = Object.fromEntries(unitStats.map((s) => [s.status, s._count.status]));
            const totalUnits = Object.values(unitMap).reduce((a, b) => a + b, 0);
            return {
                project, milestones: msMap,
                units: { ...unitMap, total: totalUnits },
                overallProgress: latestProgress?.completionPercentage ?? 0,
                pendingDSRApprovals: pendingDSRs,
            };
        }, 120);
    }
};
exports.ConstructionService = ConstructionService;
exports.ConstructionService = ConstructionService = ConstructionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        notifications_service_1.NotificationsService,
        files_service_1.FilesService])
], ConstructionService);
//# sourceMappingURL=construction.service.js.map