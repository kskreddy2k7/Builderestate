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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructionController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const construction_service_1 = require("./construction.service");
const construction_dto_1 = require("./dto/construction.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const client_1 = require("@prisma/client");
let ConstructionController = class ConstructionController {
    constructionService;
    constructor(constructionService) {
        this.constructionService = constructionService;
    }
    // ─── Projects ─────────────────────────────────────────────────────────────
    createProject(dto, user) {
        return this.constructionService.createProject(dto, user);
    }
    getProjects(user, page, limit, status) {
        return this.constructionService.getProjects(user.orgId, page, limit, status);
    }
    getProjectSummary(id) {
        return this.constructionService.getProjectSummary(id);
    }
    getProject(id) {
        return this.constructionService.getProjectById(id);
    }
    updateProject(id, dto, user) {
        return this.constructionService.updateProject(id, dto, user);
    }
    // ─── Towers & Units ───────────────────────────────────────────────────────
    createTower(id, dto, user) {
        return this.constructionService.createTower(id, dto, user);
    }
    createUnit(floorId, dto) {
        return this.constructionService.createUnit(floorId, dto);
    }
    getInventory(id) {
        return this.constructionService.getUnitInventory(id);
    }
    // ─── Milestones ───────────────────────────────────────────────────────────
    createMilestone(id, dto) {
        return this.constructionService.createMilestone(id, dto);
    }
    getMilestones(id) {
        return this.constructionService.getMilestones(id);
    }
    updateMilestone(id, dto, user) {
        return this.constructionService.updateMilestone(id, dto, user);
    }
    // ─── Progress Updates ──────────────────────────────────────────────────────
    createProgress(id, dto, files, user) {
        return this.constructionService.createProgressUpdate(id, dto, files, user);
    }
    getProgress(id, page) {
        return this.constructionService.getProgressUpdates(id, page);
    }
    // ─── Daily Site Reports ────────────────────────────────────────────────────
    createDSR(id, dto, files, user) {
        return this.constructionService.createDSR(id, dto, files, user);
    }
    getDSRs(id, page) {
        return this.constructionService.getDSRs(id, page);
    }
    approveDSR(id, dto, user) {
        return this.constructionService.approveDSR(id, dto, user);
    }
    // ─── Quality Checks ────────────────────────────────────────────────────────
    createQualityCheck(id, dto, files, user) {
        return this.constructionService.createQualityCheck(id, dto, files, user);
    }
    getQualityChecks(id, page) {
        return this.constructionService.getQualityChecks(id, page);
    }
};
exports.ConstructionController = ConstructionController;
__decorate([
    (0, common_1.Post)('projects'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new project' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [construction_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)('projects'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all projects for current org' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, typeof (_a = typeof client_1.ProjectStatus !== "undefined" && client_1.ProjectStatus) === "function" ? _a : Object]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)('projects/:id/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project dashboard summary' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "getProjectSummary", null);
__decorate([
    (0, common_1.Get)('projects/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full project details' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "getProject", null);
__decorate([
    (0, common_1.Patch)('projects/:id'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update project details' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, construction_dto_1.UpdateProjectDto, Object]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "updateProject", null);
__decorate([
    (0, common_1.Post)('projects/:id/towers'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Add a tower to project (auto-creates floors)' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, construction_dto_1.CreateTowerDto, Object]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "createTower", null);
__decorate([
    (0, common_1.Post)('floors/:floorId/units'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Add a unit to a floor' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('floorId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, construction_dto_1.CreateUnitDto]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "createUnit", null);
__decorate([
    (0, common_1.Get)('projects/:id/inventory'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unit inventory with tower/floor breakdown' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Post)('projects/:id/milestones'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a project milestone' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, construction_dto_1.CreateMilestoneDto]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "createMilestone", null);
__decorate([
    (0, common_1.Get)('projects/:id/milestones'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all project milestones' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "getMilestones", null);
__decorate([
    (0, common_1.Patch)('milestones/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update milestone status and progress' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, construction_dto_1.UpdateMilestoneDto, Object]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "updateMilestone", null);
__decorate([
    (0, common_1.Post)('projects/:id/progress'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('media', 20)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Post a construction progress update with photos' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, construction_dto_1.CreateProgressUpdateDto, Array, Object]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "createProgress", null);
__decorate([
    (0, common_1.Get)('projects/:id/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get progress update feed for a project' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Post)('projects/:id/dsr'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('media', 10)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a Daily Site Report' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, construction_dto_1.CreateDSRDto, Array, Object]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "createDSR", null);
__decorate([
    (0, common_1.Get)('projects/:id/dsr'),
    (0, swagger_1.ApiOperation)({ summary: 'Get DSR list for a project' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "getDSRs", null);
__decorate([
    (0, common_1.Patch)('dsr/:id/approve'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.SITE_ENGINEER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Approve or reject a DSR' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, construction_dto_1.ApproveDSRDto, Object]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "approveDSR", null);
__decorate([
    (0, common_1.Post)('projects/:id/quality-checks'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('media', 10)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a quality check record' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, construction_dto_1.CreateQualityCheckDto, Array, Object]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "createQualityCheck", null);
__decorate([
    (0, common_1.Get)('projects/:id/quality-checks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quality checks for a project' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ConstructionController.prototype, "getQualityChecks", null);
exports.ConstructionController = ConstructionController = __decorate([
    (0, swagger_1.ApiTags)('construction'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('construction'),
    __metadata("design:paramtypes", [construction_service_1.ConstructionService])
], ConstructionController);
//# sourceMappingURL=construction.controller.js.map