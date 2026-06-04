import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ErpService } from './erp.service'
import {
  CreateBookingDto, UpdateBookingStatusDto, CancelBookingDto,
  CreatePaymentOrderDto, VerifyPaymentDto, RecordOfflinePaymentDto,
  IssueDemandLetterDto, CreateProjectBudgetDto, CreateExpenditureDto, UpdateUnitPricingDto,
} from './dto/erp.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CurrentUser, Roles, Public } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'
import { UserRole, BookingStatus } from '@prisma/client'

@ApiTags('erp')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('erp')
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  // ─── Bookings ─────────────────────────────────────────────────────────────

  @Post('bookings')
  @Roles(UserRole.BUILDER, UserRole.ADMIN, UserRole.BROKER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a unit booking' })
  createBooking(@Body() dto: CreateBookingDto, @CurrentUser() user: RequestUser) {
    return this.erpService.createBooking(dto, user)
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings for org' })
  getBookings(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: BookingStatus,
    @Query('projectId') projectId?: string,
  ) {
    return this.erpService.getBookings(user.orgId!, { page, limit, status, projectId })
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get booking details with payment schedule' })
  getBooking(@Param('id', ParseUUIDPipe) id: string) {
    return this.erpService.getBookingById(id)
  }

  @Patch('bookings/:id/status')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update booking status (agreement, registration)' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.erpService.updateBookingStatus(id, dto)
  }

  @Post('bookings/:id/cancel')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking' })
  cancelBooking(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CancelBookingDto) {
    return this.erpService.cancelBooking(id, dto)
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  @Post('payments/order')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Razorpay payment order for a schedule item' })
  createPaymentOrder(@Body() dto: CreatePaymentOrderDto) {
    return this.erpService.createPaymentOrder(dto)
  }

  @Public()
  @Post('payments/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment signature after success' })
  verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.erpService.verifyPayment(dto)
  }

  @Post('payments/offline')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record an offline payment (cheque, NEFT, etc.)' })
  recordOffline(@Body() dto: RecordOfflinePaymentDto, @CurrentUser() user: RequestUser) {
    return this.erpService.recordOfflinePayment(dto, user)
  }

  @Get('payments/booking/:bookingId')
  @ApiOperation({ summary: 'Get payment history for a booking' })
  getPaymentHistory(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.erpService.getPaymentHistory(bookingId)
  }

  // ─── Demand Letters ───────────────────────────────────────────────────────

  @Post('demand-letters')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Issue a payment demand letter to buyer' })
  issueDemandLetter(@Body() dto: IssueDemandLetterDto) {
    return this.erpService.issueDemandLetter(dto)
  }

  // ─── Budget ───────────────────────────────────────────────────────────────

  @Post('projects/:projectId/budget')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create project budget with heads' })
  createBudget(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() dto: CreateProjectBudgetDto) {
    return this.erpService.createBudget(projectId, dto)
  }

  @Get('projects/:projectId/budget')
  @ApiOperation({ summary: 'Get project budget with variance analysis' })
  getBudget(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.erpService.getBudget(projectId)
  }

  @Post('projects/:projectId/expenditures')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record an expenditure against a budget head' })
  createExpenditure(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateExpenditureDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.erpService.createExpenditure(projectId, dto, user)
  }

  @Get('projects/:projectId/finance')
  @ApiOperation({ summary: 'Get project financial dashboard summary' })
  getFinanceSummary(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.erpService.getFinancialSummary(projectId)
  }

  // ─── Unit Pricing ─────────────────────────────────────────────────────────

  @Patch('units/:unitId/pricing')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update unit base price and premiums' })
  updatePricing(@Param('unitId', ParseUUIDPipe) unitId: string, @Body() dto: UpdateUnitPricingDto) {
    return this.erpService.updateUnitPricing(unitId, dto)
  }
}
