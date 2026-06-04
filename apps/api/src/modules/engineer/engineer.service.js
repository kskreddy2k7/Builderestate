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
var EngineerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const redis_service_1 = require("../../shared/cache/redis.service");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const files_service_1 = require("../../shared/files/files.service");
const client_1 = require("@prisma/client");
let EngineerService = EngineerService_1 = class EngineerService {
    prisma;
    redis;
    notifications;
    files;
    logger = new common_1.Logger(EngineerService_1.name);
    constructor(prisma, redis, notifications, files) {
        this.prisma = prisma;
        this.redis = redis;
        this.notifications = notifications;
        this.files = files;
    }
    // ─── Dashboard ────────────────────────────────────────────────────────────
    async getDashboard(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
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
        ]);
        return {
            todayInspections,
            openNCRs,
            pendingApprovals,
            recentTests,
            stats: {
                todayCount: todayInspections.length,
                passCount: todayInspections.filter((i) => i.status === client_1.InspectionStatus.PASS).length,
                failCount: todayInspections.filter((i) => i.status === client_1.InspectionStatus.FAIL).length,
            },
        };
    }
    // ─── Inspections ──────────────────────────────────────────────────────────
    async createInspection(dto, user) {
        return this.prisma.inspection.create({
            data: {
                projectId: dto.projectId, activity: dto.activity,
                location: dto.location, tower: dto.tower, floor: dto.floor, unit: dto.unit,
                scheduledDate: new Date(dto.scheduledDate),
                inspectorId: user.id,
                checklistItems: dto.checklistItems,
                status: client_1.InspectionStatus.SCHEDULED,
                remarks: dto.remarks,
            },
            include: { project: { select: { name: true } } },
        });
    }
    async getInspections(projectId, page = 1, limit = 20, status) {
        const where = {
            projectId,
            ...(status && { status: status }),
        };
        const [items, total] = await Promise.all([
            this.prisma.inspection.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy: { scheduledDate: 'desc' },
                include: {
                    inspector: { select: { id: true, name: true, avatar: true } },
                    ncrReports: { select: { id: true, severity: true, status: true } },
                },
            }),
            this.prisma.inspection.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getInspectionById(id) {
        const inspection = await this.prisma.inspection.findUnique({
            where: { id },
            include: {
                inspector: { select: { id: true, name: true } },
                ncrReports: true,
                testResults: true,
            },
        });
        if (!inspection)
            throw new common_1.NotFoundException('Inspection not found');
        return inspection;
    }
    async completeInspection(id, dto, files, user) {
        const inspection = await this.prisma.inspection.findUnique({ where: { id } });
        if (!inspection)
            throw new common_1.NotFoundException('Inspection not found');
        if (inspection.inspectorId !== user.id)
            throw new common_1.ForbiddenException('Not your inspection');
        let mediaUrls = [];
        if (files?.length) {
            const results = await this.files.uploadMultiple(files, {
                folder: `projects/${inspection.projectId}/inspections`,
                allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                maxSizeMB: 10,
            });
            mediaUrls = results.map((r) => r.url);
        }
        const failedItems = dto.checklistItems.filter((i) => i.result === 'FAIL');
        return this.prisma.inspection.update({
            where: { id },
            data: {
                status: dto.status,
                conductedDate: new Date(),
                checklistItems: dto.checklistItems,
                mediaUrls: [...(inspection.mediaUrls ?? []), ...mediaUrls],
                remarks: dto.remarks,
            },
        });
    }
    // ─── NCR Reports ──────────────────────────────────────────────────────────
    async createNCR(dto, files, user) {
        const inspection = await this.prisma.inspection.findUnique({
            where: { id: dto.inspectionId }, select: { projectId: true },
        });
        if (!inspection)
            throw new common_1.NotFoundException('Inspection not found');
        let beforeMediaUrls = [];
        if (files?.length) {
            const results = await this.files.uploadMultiple(files, {
                folder: `projects/${inspection.projectId}/ncr`, allowedTypes: ['image/jpeg', 'image/png'], maxSizeMB: 10,
            });
            beforeMediaUrls = results.map((r) => r.url);
        }
        const seq = await this.prisma.nCReport.count({ where: { projectId: inspection.projectId } });
        const ncrNumber = `NCR-${inspection.projectId.slice(0, 8).toUpperCase()}-${String(seq + 1).padStart(4, '0')}`;
        const ncr = await this.prisma.nCReport.create({
            data: {
                ncrNumber, inspectionId: dto.inspectionId,
                projectId: inspection.projectId,
                issuedToId: dto.issuedToId, description: dto.description,
                severity: dto.severity, dueDate: new Date(dto.dueDate),
                beforeMediaUrls, status: 'OPEN',
            },
        });
        await this.notifications.create({
            userId: dto.issuedToId,
            type: client_1.NotificationType.NCR_RAISED,
            title: `${dto.severity} NCR raised`,
            body: `${ncrNumber}: ${dto.description.slice(0, 80)}`,
            data: { ncrId: ncr.id },
        });
        return ncr;
    }
    async getNCRs(projectId, page = 1, limit = 20, status) {
        const where = {
            projectId,
            ...(status && { status }),
        };
        const [items, total] = await Promise.all([
            this.prisma.nCReport.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
                include: { issuedTo: { select: { companyName: true } } },
            }),
            this.prisma.nCReport.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async updateNCR(id, dto, files) {
        const ncr = await this.prisma.nCReport.findUnique({ where: { id } });
        if (!ncr)
            throw new common_1.NotFoundException('NCR not found');
        let afterMediaUrls = ncr.afterMediaUrls;
        if (files?.length) {
            const results = await this.files.uploadMultiple(files, {
                folder: `projects/${ncr.projectId}/ncr`, allowedTypes: ['image/jpeg', 'image/png'], maxSizeMB: 10,
            });
            afterMediaUrls = [...afterMediaUrls, ...results.map((r) => r.url)];
        }
        const updated = await this.prisma.nCReport.update({
            where: { id },
            data: {
                status: dto.status,
                rootCause: dto.rootCause, correctiveAction: dto.correctiveAction,
                preventiveAction: dto.preventiveAction, afterMediaUrls,
                ...(dto.status === 'CLOSED' && { closedAt: new Date() }),
            },
        });
        if (dto.status === 'CLOSED') {
            await this.notifications.create({
                userId: ncr.issuedToId,
                type: client_1.NotificationType.NCR_CLOSED,
                title: 'NCR closed',
                body: `NCR ${ncr.ncrNumber} has been closed.`,
                data: { ncrId: id },
            });
        }
        return updated;
    }
    // ─── Test Results ─────────────────────────────────────────────────────────
    async createTestResult(dto) {
        return this.prisma.testResult.create({
            data: {
                projectId: dto.projectId, inspectionId: dto.inspectionId,
                testType: dto.testType, sampleId: dto.sampleId, location: dto.location,
                date: new Date(dto.date), result: dto.result, unit: dto.unit,
                standardValue: dto.standardValue, status: dto.status,
                labName: dto.labName, certificateUrl: dto.certificateUrl,
            },
        });
    }
    async getTestResults(projectId, page = 1, limit = 20) {
        const [items, total] = await Promise.all([
            this.prisma.testResult.findMany({
                where: { projectId }, skip: (page - 1) * limit, take: limit, orderBy: { date: 'desc' },
            }),
            this.prisma.testResult.count({ where: { projectId } }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    // ─── Approvals ────────────────────────────────────────────────────────────
    async createApproval(dto, files, user) {
        let mediaUrls = [];
        if (files?.length) {
            const results = await this.files.uploadMultiple(files, {
                folder: `projects/${dto.projectId}/approvals`, allowedTypes: ['image/jpeg', 'image/png'], maxSizeMB: 10,
            });
            mediaUrls = results.map((r) => r.url);
        }
        return this.prisma.approval.create({
            data: {
                projectId: dto.projectId, type: dto.type,
                location: dto.location, requestedById: user.id, mediaUrls,
            },
        });
    }
    async processApproval(id, dto, user) {
        const approval = await this.prisma.approval.findUnique({ where: { id } });
        if (!approval)
            throw new common_1.NotFoundException('Approval not found');
        return this.prisma.approval.update({
            where: { id },
            data: {
                status: dto.status, approvedById: user.id,
                ...(dto.status === 'APPROVED' && { approvedAt: new Date() }),
                ...(dto.rejectedReason && { rejectedReason: dto.rejectedReason }),
            },
        });
    }
    async getApprovals(projectId, page = 1, limit = 20) {
        const [items, total] = await Promise.all([
            this.prisma.approval.findMany({
                where: { projectId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
            }),
            this.prisma.approval.count({ where: { projectId } }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
};
exports.EngineerService = EngineerService;
exports.EngineerService = EngineerService = EngineerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        notifications_service_1.NotificationsService,
        files_service_1.FilesService])
], EngineerService);
//# sourceMappingURL=engineer.service.js.map