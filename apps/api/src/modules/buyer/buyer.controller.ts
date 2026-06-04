import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFiles, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { BuyerService } from './buyer.service'
import {
  CreateComplaintDto, UpdateComplaintDto, AddComplaintUpdateDto,
  CreateSnagItemDto, UpdateSnagItemDto,
} from './dto/buyer.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CurrentUser, Roles } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'
import { UserRole } from '@prisma/client'

@ApiTags('buyer')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('buyer')
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Buyer dashboard — bookings, payments, construction overview' })
  getDashboard(@CurrentUser() user: RequestUser) {
    return this.buyerService.getDashboard(user.id)
  }

  // ─── Bookings ─────────────────────────────────────────────────────────────

  @Get('bookings')
  @ApiOperation({ summary: 'Get all my bookings' })
  getBookings(@CurrentUser() user: RequestUser, @Query('page') page?: number) {
    return this.buyerService.getMyBookings(user.id, page)
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get booking detail with full project info' })
  getBooking(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.buyerService.getBookingDetail(id, user.id)
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  @Get('payments')
  @ApiOperation({ summary: 'Payment summary with schedule and collection %' })
  getPayments(@CurrentUser() user: RequestUser, @Query('bookingId') bookingId?: string) {
    return this.buyerService.getPaymentSummary(user.id, bookingId)
  }

  @Post('payments/initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate online payment for a schedule item' })
  initiatePayment(
    @Body() body: { bookingId: string; scheduleItemId: string },
    @CurrentUser() user: RequestUser,
  ) {
    return this.buyerService.initiatePayment(body.bookingId, body.scheduleItemId, user.id)
  }

  @Post('payments/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment after success callback' })
  verifyPayment(@Body() body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    return this.buyerService.verifyPayment(body)
  }

  // ─── Documents ────────────────────────────────────────────────────────────

  @Get('documents')
  @ApiOperation({ summary: 'Get all my booking documents' })
  getDocuments(@CurrentUser() user: RequestUser, @Query('bookingId') bookingId?: string) {
    return this.buyerService.getDocuments(user.id, bookingId)
  }

  @Get('demand-letters')
  @ApiOperation({ summary: 'Get all demand letters issued' })
  getDemandLetters(@CurrentUser() user: RequestUser, @Query('bookingId') bookingId?: string) {
    return this.buyerService.getDemandLetters(user.id, bookingId)
  }

  // ─── Construction ─────────────────────────────────────────────────────────

  @Get('bookings/:id/progress')
  @ApiOperation({ summary: 'Get construction progress updates for a booking' })
  getProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Query('page') page?: number,
  ) {
    return this.buyerService.getConstructionUpdates(user.id, id, page)
  }

  @Get('bookings/:id/milestones')
  @ApiOperation({ summary: 'Get project milestones for a booking' })
  getMilestones(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.buyerService.getMilestones(user.id, id)
  }

  // ─── Complaints ───────────────────────────────────────────────────────────

  @Post('complaints')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('media', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Raise a complaint' })
  createComplaint(
    @Body() dto: CreateComplaintDto,
    @CurrentUser() user: RequestUser,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.buyerService.createComplaint(dto, user, files)
  }

  @Get('complaints')
  @ApiOperation({ summary: 'Get my complaints' })
  getComplaints(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: number,
    @Query('status') status?: string,
  ) {
    return this.buyerService.getComplaints(user.id, page, 20, status)
  }

  @Get('complaints/:id')
  @ApiOperation({ summary: 'Get complaint detail with updates' })
  getComplaint(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.buyerService.getComplaintById(id, user.id)
  }

  @Post('complaints/:id/updates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a message to complaint thread' })
  addComplaintUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddComplaintUpdateDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.buyerService.addComplaintUpdate(id, dto, user)
  }

  @Patch('complaints/:id/status')
  @Roles(UserRole.BUILDER, UserRole.ADMIN, UserRole.SITE_ENGINEER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '[Staff] Update complaint status' })
  updateComplaint(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateComplaintDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.buyerService.updateComplaintStatus(id, dto, user)
  }

  // ─── Snag Items ───────────────────────────────────────────────────────────

  @Post('snag-items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a snag / defect item for rectification' })
  createSnagItem(@Body() dto: CreateSnagItemDto, @CurrentUser() user: RequestUser) {
    return this.buyerService.createSnagItem(dto, user)
  }

  @Get('bookings/:id/snag-items')
  @ApiOperation({ summary: 'Get snag items for a booking' })
  getSnagItems(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.buyerService.getSnagItems(id, user.id)
  }

  @Patch('snag-items/:id')
  @Roles(UserRole.BUILDER, UserRole.ADMIN, UserRole.SITE_ENGINEER, UserRole.CONTRACTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '[Staff] Update snag item status' })
  updateSnagItem(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSnagItemDto) {
    return this.buyerService.updateSnagItem(id, dto)
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  @Get('notifications')
  @ApiOperation({ summary: 'Get my notifications' })
  getNotifications(@CurrentUser() user: RequestUser, @Query('page') page?: number) {
    return this.buyerService.getNotifications(user.id, page)
  }

  @Patch('notifications/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  markRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.buyerService.markNotificationRead(id, user.id)
  }

  @Post('notifications/read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser() user: RequestUser) {
    return this.buyerService.markAllNotificationsRead(user.id)
  }
}
