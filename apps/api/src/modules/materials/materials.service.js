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
var MaterialsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const redis_service_1 = require("../../shared/cache/redis.service");
const client_1 = require("@prisma/client");
let MaterialsService = MaterialsService_1 = class MaterialsService {
    prisma;
    redis;
    logger = new common_1.Logger(MaterialsService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    // ─── Categories ───────────────────────────────────────────────────────────
    async getCategories() {
        return this.redis.cached(this.redis.key('material:categories'), () => this.prisma.productCategory.findMany({
            where: { isActive: true, parentId: null },
            include: { children: { where: { isActive: true } } },
            orderBy: { name: 'asc' },
        }), 3600);
    }
    // ─── Products ─────────────────────────────────────────────────────────────
    async createProduct(dto, supplierId) {
        const sku = `SKU-${supplierId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        return this.prisma.product.create({
            data: {
                supplierId, categoryId: dto.categoryId, name: dto.name,
                description: dto.description, unit: dto.unit, sku,
                basePrice: dto.basePrice, gstRate: dto.gstRate,
                moq: dto.moq ?? 1, leadTimeDays: dto.leadTimeDays ?? 7,
                specifications: dto.specifications ?? {},
            },
        });
    }
    async getProducts(filters) {
        const { page = 1, limit = 20, categoryId, supplierId, search } = filters;
        const where = {
            isActive: true,
            ...(categoryId && { categoryId }),
            ...(supplierId && { supplierId }),
            ...(search && { name: { contains: search, mode: 'insensitive' } }),
        };
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' },
                include: {
                    supplier: { select: { companyName: true, rating: true } },
                    category: { select: { name: true } },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getSuppliers(page = 1, limit = 20, category) {
        const where = {
            verificationStatus: 'VERIFIED',
            ...(category && { categories: { has: category } }),
        };
        const [items, total] = await Promise.all([
            this.prisma.supplier.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy: { rating: 'desc' },
            }),
            this.prisma.supplier.count({ where }),
        ]);
        return { items, meta: { total, page, limit } };
    }
    // ─── RFQ ──────────────────────────────────────────────────────────────────
    async createRFQ(dto, user) {
        return this.prisma.rFQRequest.create({
            data: {
                projectId: dto.projectId, title: dto.title,
                items: dto.items, deadline: new Date(dto.deadline),
                createdById: user.id,
            },
        });
    }
    async getRFQs(projectId) {
        return this.prisma.rFQRequest.findMany({
            where: { projectId }, orderBy: { createdAt: 'desc' }, take: 50,
            include: { _count: { select: { responses: true } } },
        });
    }
    async submitRFQResponse(dto, supplierId) {
        const rfq = await this.prisma.rFQRequest.findUnique({ where: { id: dto.rfqId } });
        if (!rfq || rfq.status !== 'OPEN')
            throw new common_1.BadRequestException('RFQ is not open');
        const totalAmount = dto.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        return this.prisma.rFQResponse.create({
            data: {
                rfqId: dto.rfqId, supplierId, items: dto.items,
                totalAmount, validUntil: new Date(dto.validUntil), notes: dto.notes,
                status: 'SUBMITTED',
            },
        });
    }
    async getRFQResponses(rfqId) {
        return this.prisma.rFQResponse.findMany({
            where: { rfqId }, orderBy: { totalAmount: 'asc' },
            include: { supplier: { select: { companyName: true, rating: true, onTimeDelivery: true } } },
        });
    }
    // ─── Purchase Orders ──────────────────────────────────────────────────────
    async createPO(dto, user) {
        const seq = await this.prisma.purchaseOrder.count({ where: { projectId: dto.projectId } });
        const poNumber = `PO-${dto.projectId.slice(0, 8).toUpperCase()}-${String(seq + 1).padStart(4, '0')}`;
        const totalAmount = dto.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        const gstAmount = dto.items.reduce((sum, i) => sum + i.quantity * i.unitPrice * (i.gstRate / 100), 0);
        return this.prisma.purchaseOrder.create({
            data: {
                poNumber, projectId: dto.projectId, supplierId: dto.supplierId,
                status: client_1.OrderStatus.PO_ISSUED, totalAmount, gstAmount, finalAmount: totalAmount + gstAmount,
                deliveryAddress: dto.deliveryAddress,
                expectedDeliveryDate: new Date(dto.expectedDeliveryDate),
                termsAndConditions: dto.termsAndConditions,
                createdById: user.id,
                items: {
                    create: dto.items.map((item) => ({
                        productId: item.productId, productName: item.productName,
                        quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice,
                        gstRate: item.gstRate, totalAmount: item.quantity * item.unitPrice,
                    })),
                },
            },
            include: { items: true, supplier: { select: { companyName: true } } },
        });
    }
    async getPOs(filters, page = 1, limit = 20) {
        const where = {
            ...(filters.projectId && { projectId: filters.projectId }),
            ...(filters.supplierId && { supplierId: filters.supplierId }),
            ...(filters.status && { status: filters.status }),
        };
        const [items, total] = await Promise.all([
            this.prisma.purchaseOrder.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
                include: {
                    supplier: { select: { companyName: true } },
                    _count: { select: { items: true } },
                },
            }),
            this.prisma.purchaseOrder.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getPOById(id) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                items: { include: { product: { select: { name: true, unit: true } } } },
                supplier: true, deliveries: true, grnRecords: true,
            },
        });
        if (!po)
            throw new common_1.NotFoundException('Purchase order not found');
        return po;
    }
    // ─── Deliveries ───────────────────────────────────────────────────────────
    async updateDelivery(poId, dto) {
        const existingDelivery = await this.prisma.delivery.findFirst({ where: { poId } });
        if (existingDelivery) {
            return this.prisma.delivery.update({
                where: { id: existingDelivery.id },
                data: {
                    status: dto.status,
                    ...(dto.trackingNumber && { trackingNumber: dto.trackingNumber }),
                    ...(dto.carrier && { carrier: dto.carrier }),
                    ...(dto.status === 'DISPATCHED' && { dispatchedAt: new Date() }),
                    ...(dto.status === 'DELIVERED' && { deliveredAt: new Date() }),
                },
            });
        }
        const result = await this.prisma.delivery.create({
            data: {
                poId, status: dto.status,
                trackingNumber: dto.trackingNumber, carrier: dto.carrier,
                driverName: dto.driverName, vehicleNumber: dto.vehicleNumber,
                ...(dto.status === 'DISPATCHED' && { dispatchedAt: new Date() }),
            },
        });
        await this.prisma.purchaseOrder.update({
            where: { id: poId },
            data: { status: dto.status === 'DELIVERED' ? client_1.OrderStatus.DELIVERED : client_1.OrderStatus.IN_TRANSIT },
        });
        return result;
    }
    // ─── GRN ──────────────────────────────────────────────────────────────────
    async createGRN(dto, user) {
        const seq = await this.prisma.gRNRecord.count({ where: { poId: dto.poId } });
        const grnNumber = `GRN-${dto.poId.slice(0, 8).toUpperCase()}-${String(seq + 1).padStart(3, '0')}`;
        const grn = await this.prisma.gRNRecord.create({
            data: {
                poId: dto.poId, grnNumber, receivedItems: dto.receivedItems,
                inspectedById: user.id, inspectedAt: new Date(),
                status: dto.status, remarks: dto.remarks,
            },
        });
        await this.prisma.purchaseOrder.update({
            where: { id: dto.poId },
            data: { status: dto.status === 'ACCEPTED' ? client_1.OrderStatus.GRN_DONE : client_1.OrderStatus.DELIVERED },
        });
        return grn;
    }
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = MaterialsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, redis_service_1.RedisService])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map