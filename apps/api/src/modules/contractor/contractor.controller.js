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
exports.ContractorController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contractor_service_1 = require("./contractor.service");
const contractor_dto_1 = require("./dto/contractor.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const client_1 = require("@prisma/client");
let ContractorController = class ContractorController {
    contractorService;
    constructor(contractorService) {
        this.contractorService = contractorService;
    }
    getDashboard(user) {
        return this.contractorService.getDashboard(user.id);
    }
    createWO(dto) { return this.contractorService.createWorkOrder(dto); }
    getWOs(user, projectId, status, page) {
        return this.contractorService.getWorkOrders({ projectId, userId: user.id, status }, page);
    }
    getWO(id) { return this.contractorService.getWorkOrderById(id); }
    updateWO(id, dto) {
        return this.contractorService.updateWorkOrder(id, dto);
    }
    issueWO(id) { return this.contractorService.issueWorkOrder(id); }
    acceptWO(id, user) {
        return this.contractorService.acceptWorkOrder(id, user.id);
    }
    markAttendance(dto, user) {
        return this.contractorService.markAttendance(dto, user.id);
    }
    getAttendance(projectId, contractorId, from, to) { return this.contractorService.getAttendance(projectId, contractorId, from, to); }
    getAttendanceSummary(projectId) {
        return this.contractorService.getAttendanceSummary(projectId);
    }
    submitBill(dto, user) {
        return this.contractorService.submitRABill(dto, user.id);
    }
    processBill(id, dto, user) {
        return this.contractorService.processRABill(id, dto, user.id);
    }
    payBill(id) { return this.contractorService.payRABill(id); }
    createIndent(dto, user) {
        return this.contractorService.createMaterialIndent(dto, user.id);
    }
    getIndents(projectId, status, user) {
        return this.contractorService.getMaterialIndents({ projectId, status });
    }
    processIndent(id, dto, user) {
        return this.contractorService.processMaterialIndent(id, dto, user.id);
    }
};
exports.ContractorController = ContractorController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Contractor dashboard' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('work-orders'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create work order' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contractor_dto_1.CreateWorkOrderDto]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "createWO", null);
__decorate([
    (0, common_1.Get)('work-orders'),
    (0, swagger_1.ApiOperation)({ summary: 'List work orders' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "getWOs", null);
__decorate([
    (0, common_1.Get)('work-orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get work order detail' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "getWO", null);
__decorate([
    (0, common_1.Patch)('work-orders/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update work order' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contractor_dto_1.UpdateWorkOrderDto]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "updateWO", null);
__decorate([
    (0, common_1.Post)('work-orders/:id/issue'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Issue a work order to contractor' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "issueWO", null);
__decorate([
    (0, common_1.Post)('work-orders/:id/accept'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, decorators_1.Roles)(client_1.UserRole.CONTRACTOR),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Contractor accepts a work order' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "acceptWO", null);
__decorate([
    (0, common_1.Post)('attendance'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Mark labour attendance' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contractor_dto_1.CreateLaborAttendanceDto, Object]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "markAttendance", null);
__decorate([
    (0, common_1.Get)('attendance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance records' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('contractorId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "getAttendance", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/attendance-summary'),
    (0, swagger_1.ApiOperation)({ summary: '30-day attendance chart data' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "getAttendanceSummary", null);
__decorate([
    (0, common_1.Post)('ra-bills'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Submit RA bill' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contractor_dto_1.CreateRABillDto, Object]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "submitBill", null);
__decorate([
    (0, common_1.Patch)('ra-bills/:id/process'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Certify or reject RA bill' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contractor_dto_1.ProcessRABillDto, Object]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "processBill", null);
__decorate([
    (0, common_1.Post)('ra-bills/:id/pay'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Mark RA bill as paid' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "payBill", null);
__decorate([
    (0, common_1.Post)('material-indents'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Request materials' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contractor_dto_1.CreateMaterialIndentDto, Object]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "createIndent", null);
__decorate([
    (0, common_1.Get)('material-indents'),
    (0, swagger_1.ApiOperation)({ summary: 'Get material indent requests' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "getIndents", null);
__decorate([
    (0, common_1.Patch)('material-indents/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve/reject material indent' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contractor_dto_1.ProcessMaterialIndentDto, Object]),
    __metadata("design:returntype", void 0)
], ContractorController.prototype, "processIndent", null);
exports.ContractorController = ContractorController = __decorate([
    (0, swagger_1.ApiTags)('contractor'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('contractor'),
    __metadata("design:paramtypes", [contractor_service_1.ContractorService])
], ContractorController);
//# sourceMappingURL=contractor.controller.js.map