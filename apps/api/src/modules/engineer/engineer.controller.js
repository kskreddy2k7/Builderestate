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
exports.EngineerController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const engineer_service_1 = require("./engineer.service");
const engineer_dto_1 = require("./dto/engineer.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const client_1 = require("@prisma/client");
let EngineerController = class EngineerController {
    engineerService;
    constructor(engineerService) {
        this.engineerService = engineerService;
    }
    getDashboard(user) {
        return this.engineerService.getDashboard(user.id);
    }
    createInspection(dto, user) {
        return this.engineerService.createInspection(dto, user);
    }
    getInspections(projectId, page, status) {
        return this.engineerService.getInspections(projectId, page, 20, status);
    }
    getInspection(id) {
        return this.engineerService.getInspectionById(id);
    }
    completeInspection(id, dto, files, user) {
        return this.engineerService.completeInspection(id, dto, files, user);
    }
    createNCR(dto, files, user) {
        return this.engineerService.createNCR(dto, files, user);
    }
    getNCRs(projectId, page, status) {
        return this.engineerService.getNCRs(projectId, page, 20, status);
    }
    updateNCR(id, dto, files) {
        return this.engineerService.updateNCR(id, dto, files);
    }
    createTestResult(dto) {
        return this.engineerService.createTestResult(dto);
    }
    getTestResults(projectId, page) {
        return this.engineerService.getTestResults(projectId, page);
    }
    createApproval(dto, files, user) {
        return this.engineerService.createApproval(dto, files, user);
    }
    processApproval(id, dto, user) {
        return this.engineerService.processApproval(id, dto, user);
    }
    getApprovals(projectId, page) {
        return this.engineerService.getApprovals(projectId, page);
    }
};
exports.EngineerController = EngineerController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, decorators_1.Roles)(client_1.UserRole.SITE_ENGINEER, client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Today's inspections, open NCRs, pending approvals" }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('inspections'),
    (0, decorators_1.Roles)(client_1.UserRole.SITE_ENGINEER, client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule an inspection' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [engineer_dto_1.CreateInspectionDto, Object]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "createInspection", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/inspections'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all inspections for a project' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "getInspections", null);
__decorate([
    (0, common_1.Get)('inspections/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inspection details' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "getInspection", null);
__decorate([
    (0, common_1.Post)('inspections/:id/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('media', 20)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit inspection results with photos' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, engineer_dto_1.CompleteInspectionDto, Array, Object]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "completeInspection", null);
__decorate([
    (0, common_1.Post)('ncr'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('before', 10)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, decorators_1.Roles)(client_1.UserRole.SITE_ENGINEER, client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Raise a Non-Conformance Report' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [engineer_dto_1.CreateNCRDto, Array, Object]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "createNCR", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/ncr'),
    (0, swagger_1.ApiOperation)({ summary: 'Get NCRs for a project' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "getNCRs", null);
__decorate([
    (0, common_1.Patch)('ncr/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('after', 10)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Update NCR status / add rectification evidence' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, engineer_dto_1.UpdateNCRDto, Array]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "updateNCR", null);
__decorate([
    (0, common_1.Post)('test-results'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Log a material or structural test result' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [engineer_dto_1.CreateTestResultDto]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "createTestResult", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/test-results'),
    (0, swagger_1.ApiOperation)({ summary: 'Get test results for a project' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "getTestResults", null);
__decorate([
    (0, common_1.Post)('approvals'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('media', 10)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Request an approval (pour card, slab, waterproofing)' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [engineer_dto_1.CreateApprovalDto, Array, Object]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "createApproval", null);
__decorate([
    (0, common_1.Patch)('approvals/:id'),
    (0, decorators_1.Roles)(client_1.UserRole.SITE_ENGINEER, client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Approve or reject an approval request' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, engineer_dto_1.ProcessApprovalDto, Object]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "processApproval", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/approvals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get approvals for a project' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], EngineerController.prototype, "getApprovals", null);
exports.EngineerController = EngineerController = __decorate([
    (0, swagger_1.ApiTags)('engineer'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('engineer'),
    __metadata("design:paramtypes", [engineer_service_1.EngineerService])
], EngineerController);
//# sourceMappingURL=engineer.controller.js.map