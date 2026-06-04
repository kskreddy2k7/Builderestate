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
exports.ErpController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const erp_service_1 = require("./erp.service");
const erp_dto_1 = require("./dto/erp.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const client_1 = require("@prisma/client");
let ErpController = class ErpController {
    erpService;
    constructor(erpService) {
        this.erpService = erpService;
    }
    // ─── Bookings ─────────────────────────────────────────────────────────────
    createBooking(dto, user) {
        return this.erpService.createBooking(dto, user);
    }
    getBookings(user, page, limit, status, projectId) {
        return this.erpService.getBookings(user.orgId, { page, limit, status, projectId });
    }
    getBooking(id) {
        return this.erpService.getBookingById(id);
    }
    updateStatus(id, dto) {
        return this.erpService.updateBookingStatus(id, dto);
    }
    cancelBooking(id, dto) {
        return this.erpService.cancelBooking(id, dto);
    }
    // ─── Payments ─────────────────────────────────────────────────────────────
    createPaymentOrder(dto) {
        return this.erpService.createPaymentOrder(dto);
    }
    verifyPayment(dto) {
        return this.erpService.verifyPayment(dto);
    }
    recordOffline(dto, user) {
        return this.erpService.recordOfflinePayment(dto, user);
    }
    getPaymentHistory(bookingId) {
        return this.erpService.getPaymentHistory(bookingId);
    }
    // ─── Demand Letters ───────────────────────────────────────────────────────
    issueDemandLetter(dto) {
        return this.erpService.issueDemandLetter(dto);
    }
    // ─── Budget ───────────────────────────────────────────────────────────────
    createBudget(projectId, dto) {
        return this.erpService.createBudget(projectId, dto);
    }
    getBudget(projectId) {
        return this.erpService.getBudget(projectId);
    }
    createExpenditure(projectId, dto, user) {
        return this.erpService.createExpenditure(projectId, dto, user);
    }
    getFinanceSummary(projectId) {
        return this.erpService.getFinancialSummary(projectId);
    }
    // ─── Unit Pricing ─────────────────────────────────────────────────────────
    updatePricing(unitId, dto) {
        return this.erpService.updateUnitPricing(unitId, dto);
    }
};
exports.ErpController = ErpController;
__decorate([
    (0, common_1.Post)('bookings'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN, client_1.UserRole.BROKER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a unit booking' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [erp_dto_1.CreateBookingDto, Object]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)('bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookings for org' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, typeof (_a = typeof client_1.BookingStatus !== "undefined" && client_1.BookingStatus) === "function" ? _a : Object, String]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Get)('bookings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking details with payment schedule' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "getBooking", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/status'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update booking status (agreement, registration)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, erp_dto_1.UpdateBookingStatusDto]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('bookings/:id/cancel'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a booking' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, erp_dto_1.CancelBookingDto]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "cancelBooking", null);
__decorate([
    (0, common_1.Post)('payments/order'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create Razorpay payment order for a schedule item' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [erp_dto_1.CreatePaymentOrderDto]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "createPaymentOrder", null);
__decorate([
    (0, decorators_1.Public)(),
    (0, common_1.Post)('payments/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Razorpay payment signature after success' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [erp_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('payments/offline'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Record an offline payment (cheque, NEFT, etc.)' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [erp_dto_1.RecordOfflinePaymentDto, Object]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "recordOffline", null);
__decorate([
    (0, common_1.Get)('payments/booking/:bookingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment history for a booking' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "getPaymentHistory", null);
__decorate([
    (0, common_1.Post)('demand-letters'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Issue a payment demand letter to buyer' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [erp_dto_1.IssueDemandLetterDto]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "issueDemandLetter", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/budget'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create project budget with heads' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, erp_dto_1.CreateProjectBudgetDto]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "createBudget", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/budget'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project budget with variance analysis' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "getBudget", null);
__decorate([
    (0, common_1.Post)('projects/:projectId/expenditures'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Record an expenditure against a budget head' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, erp_dto_1.CreateExpenditureDto, Object]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "createExpenditure", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/finance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project financial dashboard summary' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "getFinanceSummary", null);
__decorate([
    (0, common_1.Patch)('units/:unitId/pricing'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update unit base price and premiums' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('unitId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, erp_dto_1.UpdateUnitPricingDto]),
    __metadata("design:returntype", void 0)
], ErpController.prototype, "updatePricing", null);
exports.ErpController = ErpController = __decorate([
    (0, swagger_1.ApiTags)('erp'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('erp'),
    __metadata("design:paramtypes", [erp_service_1.ErpService])
], ErpController);
//# sourceMappingURL=erp.controller.js.map