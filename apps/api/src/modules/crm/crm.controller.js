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
exports.CrmController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const crm_service_1 = require("./crm.service");
const crm_dto_1 = require("./dto/crm.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const client_1 = require("@prisma/client");
let CrmController = class CrmController {
    crmService;
    constructor(crmService) {
        this.crmService = crmService;
    }
    // ─── Leads ────────────────────────────────────────────────────────────────
    createLead(dto, user) {
        return this.crmService.createLead(dto, user);
    }
    getLeads(user, dto) {
        return this.crmService.getLeads(user, dto);
    }
    getPipeline(user) {
        const isAdmin = user.roles.includes(client_1.UserRole.ADMIN);
        return this.crmService.getPipeline(user.orgId, isAdmin ? undefined : user.id);
    }
    getLead(id, user) {
        return this.crmService.getLeadById(id, user);
    }
    updateLead(id, dto, user) {
        return this.crmService.updateLead(id, dto, user);
    }
    transferLead(id, dto, user) {
        return this.crmService.transferLead(id, dto, user);
    }
    // ─── Activities ───────────────────────────────────────────────────────────
    addActivity(id, dto, user) {
        return this.crmService.addActivity(id, dto, user);
    }
    getActivities(id, page) {
        return this.crmService.getActivities(id, page);
    }
    // ─── Site Visits ──────────────────────────────────────────────────────────
    scheduleSiteVisit(id, dto, user) {
        return this.crmService.scheduleSiteVisit(id, dto, user);
    }
    completeSiteVisit(visitId, dto, user) {
        return this.crmService.completeSiteVisit(visitId, dto, user);
    }
    getSiteVisits(user, from, to, status) {
        return this.crmService.getSiteVisits({ orgId: user.orgId, from, to, status });
    }
    // ─── Commissions ──────────────────────────────────────────────────────────
    createCommission(dto, user) {
        return this.crmService.createCommission(dto, user);
    }
    getCommissions(user, page, status) {
        return this.crmService.getCommissions(user, page, 20, status);
    }
    updateCommissionStatus(id, dto, user) {
        return this.crmService.updateCommissionStatus(id, dto, user);
    }
    recordPayment(dto, user) {
        return this.crmService.recordCommissionPayment(dto, user);
    }
    // ─── Customers ────────────────────────────────────────────────────────────
    createCustomer(dto, user) {
        return this.crmService.createCustomer(dto, user);
    }
    getCustomers(user, page, search) {
        return this.crmService.getCustomers(user.orgId, page, 20, search);
    }
    getCustomer(id) {
        return this.crmService.getCustomerById(id);
    }
    updateCustomer(id, dto) {
        return this.crmService.updateCustomer(id, dto);
    }
};
exports.CrmController = CrmController;
__decorate([
    (0, common_1.Post)('leads'),
    (0, decorators_1.Roles)(client_1.UserRole.BROKER, client_1.UserRole.AGENT, client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new lead' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.CreateLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createLead", null);
__decorate([
    (0, common_1.Get)('leads'),
    (0, swagger_1.ApiOperation)({ summary: 'Get leads with filters and pagination' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, crm_dto_1.LeadFilterDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getLeads", null);
__decorate([
    (0, common_1.Get)('leads/pipeline'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pipeline overview by stage' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getPipeline", null);
__decorate([
    (0, common_1.Get)('leads/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead with full activity history' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getLead", null);
__decorate([
    (0, common_1.Patch)('leads/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update lead details, stage, or score' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.UpdateLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateLead", null);
__decorate([
    (0, common_1.Post)('leads/:id/transfer'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer lead to another broker/agent' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.TransferLeadDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "transferLead", null);
__decorate([
    (0, common_1.Post)('leads/:id/activities'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Log an activity on a lead (call, email, visit, note)' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.CreateActivityDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "addActivity", null);
__decorate([
    (0, common_1.Get)('leads/:id/activities'),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead activity timeline' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getActivities", null);
__decorate([
    (0, common_1.Post)('leads/:id/site-visits'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule a site visit for a lead' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.ScheduleSiteVisitDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "scheduleSiteVisit", null);
__decorate([
    (0, common_1.Patch)('site-visits/:visitId/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark site visit as completed/cancelled/no-show' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('visitId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.CompleteSiteVisitDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "completeSiteVisit", null);
__decorate([
    (0, common_1.Get)('site-visits'),
    (0, swagger_1.ApiOperation)({ summary: 'Get site visits calendar (upcoming + past)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getSiteVisits", null);
__decorate([
    (0, common_1.Post)('commissions'),
    (0, decorators_1.Roles)(client_1.UserRole.BROKER, client_1.UserRole.AGENT, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create commission record on booking' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.CreateCommissionDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createCommission", null);
__decorate([
    (0, common_1.Get)('commissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get commissions with summary stats' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getCommissions", null);
__decorate([
    (0, common_1.Patch)('commissions/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve, hold, or cancel a commission' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.UpdateCommissionStatusDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateCommissionStatus", null);
__decorate([
    (0, common_1.Post)('commissions/pay'),
    (0, decorators_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.BUILDER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Record commission payout to broker' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.RecordCommissionPaymentDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Post)('customers'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a customer record' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crm_dto_1.CreateCustomerDto, Object]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Get)('customers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all customers' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Get)('customers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer with documents' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "getCustomer", null);
__decorate([
    (0, common_1.Patch)('customers/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update customer details' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, crm_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CrmController.prototype, "updateCustomer", null);
exports.CrmController = CrmController = __decorate([
    (0, swagger_1.ApiTags)('crm'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('crm'),
    __metadata("design:paramtypes", [crm_service_1.CrmService])
], CrmController);
//# sourceMappingURL=crm.controller.js.map