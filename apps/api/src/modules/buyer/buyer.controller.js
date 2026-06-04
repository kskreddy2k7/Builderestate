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
exports.BuyerController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const buyer_service_1 = require("./buyer.service");
const buyer_dto_1 = require("./dto/buyer.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const decorators_1 = require("../../common/decorators");
const client_1 = require("@prisma/client");
let BuyerController = class BuyerController {
    buyerService;
    constructor(buyerService) {
        this.buyerService = buyerService;
    }
    getDashboard(user) {
        return this.buyerService.getDashboard(user.id);
    }
    // ─── Bookings ─────────────────────────────────────────────────────────────
    getBookings(user, page) {
        return this.buyerService.getMyBookings(user.id, page);
    }
    getBooking(id, user) {
        return this.buyerService.getBookingDetail(id, user.id);
    }
    // ─── Payments ─────────────────────────────────────────────────────────────
    getPayments(user, bookingId) {
        return this.buyerService.getPaymentSummary(user.id, bookingId);
    }
    initiatePayment(body, user) {
        return this.buyerService.initiatePayment(body.bookingId, body.scheduleItemId, user.id);
    }
    verifyPayment(body) {
        return this.buyerService.verifyPayment(body);
    }
    // ─── Documents ────────────────────────────────────────────────────────────
    getDocuments(user, bookingId) {
        return this.buyerService.getDocuments(user.id, bookingId);
    }
    getDemandLetters(user, bookingId) {
        return this.buyerService.getDemandLetters(user.id, bookingId);
    }
    // ─── Construction ─────────────────────────────────────────────────────────
    getProgress(id, user, page) {
        return this.buyerService.getConstructionUpdates(user.id, id, page);
    }
    getMilestones(id, user) {
        return this.buyerService.getMilestones(user.id, id);
    }
    // ─── Complaints ───────────────────────────────────────────────────────────
    createComplaint(dto, user, files) {
        return this.buyerService.createComplaint(dto, user, files);
    }
    getComplaints(user, page, status) {
        return this.buyerService.getComplaints(user.id, page, 20, status);
    }
    getComplaint(id, user) {
        return this.buyerService.getComplaintById(id, user.id);
    }
    addComplaintUpdate(id, dto, user) {
        return this.buyerService.addComplaintUpdate(id, dto, user);
    }
    updateComplaint(id, dto, user) {
        return this.buyerService.updateComplaintStatus(id, dto, user);
    }
    // ─── Snag Items ───────────────────────────────────────────────────────────
    createSnagItem(dto, user) {
        return this.buyerService.createSnagItem(dto, user);
    }
    getSnagItems(id, user) {
        return this.buyerService.getSnagItems(id, user.id);
    }
    updateSnagItem(id, dto) {
        return this.buyerService.updateSnagItem(id, dto);
    }
    // ─── Notifications ────────────────────────────────────────────────────────
    getNotifications(user, page) {
        return this.buyerService.getNotifications(user.id, page);
    }
    markRead(id, user) {
        return this.buyerService.markNotificationRead(id, user.id);
    }
    markAllRead(user) {
        return this.buyerService.markAllNotificationsRead(user.id);
    }
};
exports.BuyerController = BuyerController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Buyer dashboard — bookings, payments, construction overview' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all my bookings' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Get)('bookings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking detail with full project info' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getBooking", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, swagger_1.ApiOperation)({ summary: 'Payment summary with schedule and collection %' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)('payments/initiate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate online payment for a schedule item' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Post)('payments/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Razorpay payment after success callback' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)('documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all my booking documents' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)('demand-letters'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all demand letters issued' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getDemandLetters", null);
__decorate([
    (0, common_1.Get)('bookings/:id/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get construction progress updates for a booking' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Get)('bookings/:id/milestones'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project milestones for a booking' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getMilestones", null);
__decorate([
    (0, common_1.Post)('complaints'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('media', 5)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Raise a complaint' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [buyer_dto_1.CreateComplaintDto, Object, Array]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "createComplaint", null);
__decorate([
    (0, common_1.Get)('complaints'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my complaints' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getComplaints", null);
__decorate([
    (0, common_1.Get)('complaints/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get complaint detail with updates' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getComplaint", null);
__decorate([
    (0, common_1.Post)('complaints/:id/updates'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a message to complaint thread' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, buyer_dto_1.AddComplaintUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "addComplaintUpdate", null);
__decorate([
    (0, common_1.Patch)('complaints/:id/status'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN, client_1.UserRole.SITE_ENGINEER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: '[Staff] Update complaint status' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, buyer_dto_1.UpdateComplaintDto, Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "updateComplaint", null);
__decorate([
    (0, common_1.Post)('snag-items'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a snag / defect item for rectification' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.CREATED, type: Object }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [buyer_dto_1.CreateSnagItemDto, Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "createSnagItem", null);
__decorate([
    (0, common_1.Get)('bookings/:id/snag-items'),
    (0, swagger_1.ApiOperation)({ summary: 'Get snag items for a booking' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getSnagItems", null);
__decorate([
    (0, common_1.Patch)('snag-items/:id'),
    (0, decorators_1.Roles)(client_1.UserRole.BUILDER, client_1.UserRole.ADMIN, client_1.UserRole.SITE_ENGINEER, client_1.UserRole.CONTRACTOR),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: '[Staff] Update snag item status' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, buyer_dto_1.UpdateSnagItemDto]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "updateSnagItem", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my notifications' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Patch)('notifications/:id/read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a notification as read' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)('notifications/read-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BuyerController.prototype, "markAllRead", null);
exports.BuyerController = BuyerController = __decorate([
    (0, swagger_1.ApiTags)('buyer'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('buyer'),
    __metadata("design:paramtypes", [buyer_service_1.BuyerService])
], BuyerController);
//# sourceMappingURL=buyer.controller.js.map