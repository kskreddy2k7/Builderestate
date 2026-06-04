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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const materials_service_1 = require("./materials.service");
const materials_dto_1 = require("./dto/materials.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const client_1 = require("@prisma/client");
let MaterialsController = class MaterialsController {
    materialsService;
    constructor(materialsService) {
        this.materialsService = materialsService;
    }
    getCategories() { return this.materialsService.getCategories(); }
    getProducts(categoryId, supplierId, search, page) { return this.materialsService.getProducts({ categoryId, supplierId, search, page }); }
    createProduct(dto, user) {
        return this.materialsService.createProduct(dto, user.id);
    }
    getSuppliers(category, page) {
        return this.materialsService.getSuppliers(page, 20, category);
    }
    createRFQ(dto, user) {
        return this.materialsService.createRFQ(dto, user);
    }
    getRFQs(projectId) {
        return this.materialsService.getRFQs(projectId);
    }
    respondRFQ(dto, user) {
        return this.materialsService.submitRFQResponse(dto, user.id);
    }
    getRFQResponses(rfqId) {
        return this.materialsService.getRFQResponses(rfqId);
    }
    createPO(dto, user) {
        return this.materialsService.createPO(dto, user);
    }
    getPOs(projectId, supplierId, status, page) { return this.materialsService.getPOs({ projectId, supplierId, status }, page); }
    getPO(id) { return this.materialsService.getPOById(id); }
    updateDelivery(id, dto) {
        return this.materialsService.updateDelivery(id, dto);
    }
    createGRN(dto, user) {
        return this.materialsService.createGRN(dto, user);
    }
};
exports.MaterialsController = MaterialsController;
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product categories' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getCategories", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Search products' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('categoryId')),
    __param(1, (0, common_1.Query)('supplierId')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getProducts", null);
__decorate([
    (0, decorators_1.Roles)(client_1.UserRole.SUPPLIER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Post)('products'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Supplier: add product' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [materials_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "createProduct", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Get)('suppliers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get verified suppliers' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getSuppliers", null);
__decorate([
    (0, common_1.Post)('rfq'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create RFQ request' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [materials_dto_1.CreateRFQDto, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "createRFQ", null);
__decorate([
    (0, common_1.Get)('rfq/project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get RFQs for project' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getRFQs", null);
__decorate([
    (0, decorators_1.Roles)(client_1.UserRole.SUPPLIER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Post)('rfq/respond'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Supplier: submit RFQ response' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [materials_dto_1.SubmitRFQResponseDto, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "respondRFQ", null);
__decorate([
    (0, common_1.Get)('rfq/:rfqId/responses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get RFQ responses for comparison' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('rfqId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getRFQResponses", null);
__decorate([
    (0, common_1.Post)('purchase-orders'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase order' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [materials_dto_1.CreatePurchaseOrderDto, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "createPO", null);
__decorate([
    (0, common_1.Get)('purchase-orders'),
    (0, swagger_1.ApiOperation)({ summary: 'List purchase orders' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('supplierId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getPOs", null);
__decorate([
    (0, common_1.Get)('purchase-orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get PO with items and deliveries' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getPO", null);
__decorate([
    (0, common_1.Post)('purchase-orders/:id/delivery'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Update delivery status' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, materials_dto_1.UpdateDeliveryStatusDto]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "updateDelivery", null);
__decorate([
    (0, common_1.Post)('grn'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create Goods Receipt Note' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [materials_dto_1.CreateGRNDto, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "createGRN", null);
exports.MaterialsController = MaterialsController = __decorate([
    (0, swagger_1.ApiTags)('materials'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('materials'),
    __metadata("design:paramtypes", [materials_service_1.MaterialsService])
], MaterialsController);
//# sourceMappingURL=materials.controller.js.map