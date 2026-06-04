import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { CrmService } from './crm.service'
import {
  CreateLeadDto, UpdateLeadDto, TransferLeadDto, CreateActivityDto,
  ScheduleSiteVisitDto, CompleteSiteVisitDto,
  CreateCommissionDto, UpdateCommissionStatusDto, RecordCommissionPaymentDto,
  CreateCustomerDto, UpdateCustomerDto, LeadFilterDto,
} from './dto/crm.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CurrentUser, Roles } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'
import { UserRole } from '@prisma/client'

@ApiTags('crm')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // ─── Leads ────────────────────────────────────────────────────────────────

  @Post('leads')
  @Roles(UserRole.BROKER, UserRole.AGENT, UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lead' })
  createLead(@Body() dto: CreateLeadDto, @CurrentUser() user: RequestUser) {
    return this.crmService.createLead(dto, user)
  }

  @Get('leads')
  @ApiOperation({ summary: 'Get leads with filters and pagination' })
  getLeads(@CurrentUser() user: RequestUser, @Query() dto: LeadFilterDto) {
    return this.crmService.getLeads(user, dto)
  }

  @Get('leads/pipeline')
  @ApiOperation({ summary: 'Get pipeline overview by stage' })
  getPipeline(@CurrentUser() user: RequestUser) {
    const isAdmin = user.roles.includes(UserRole.ADMIN)
    return this.crmService.getPipeline(user.orgId!, isAdmin ? undefined : user.id)
  }

  @Get('leads/:id')
  @ApiOperation({ summary: 'Get lead with full activity history' })
  getLead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.crmService.getLeadById(id, user)
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update lead details, stage, or score' })
  updateLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.crmService.updateLead(id, dto, user)
  }

  @Post('leads/:id/transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer lead to another broker/agent' })
  transferLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferLeadDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.crmService.transferLead(id, dto, user)
  }

  // ─── Activities ───────────────────────────────────────────────────────────

  @Post('leads/:id/activities')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log an activity on a lead (call, email, visit, note)' })
  addActivity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateActivityDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.crmService.addActivity(id, dto, user)
  }

  @Get('leads/:id/activities')
  @ApiOperation({ summary: 'Get lead activity timeline' })
  getActivities(@Param('id', ParseUUIDPipe) id: string, @Query('page') page?: number) {
    return this.crmService.getActivities(id, page)
  }

  // ─── Site Visits ──────────────────────────────────────────────────────────

  @Post('leads/:id/site-visits')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule a site visit for a lead' })
  scheduleSiteVisit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ScheduleSiteVisitDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.crmService.scheduleSiteVisit(id, dto, user)
  }

  @Patch('site-visits/:visitId/complete')
  @ApiOperation({ summary: 'Mark site visit as completed/cancelled/no-show' })
  completeSiteVisit(
    @Param('visitId', ParseUUIDPipe) visitId: string,
    @Body() dto: CompleteSiteVisitDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.crmService.completeSiteVisit(visitId, dto, user)
  }

  @Get('site-visits')
  @ApiOperation({ summary: 'Get site visits calendar (upcoming + past)' })
  getSiteVisits(
    @CurrentUser() user: RequestUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
  ) {
    return this.crmService.getSiteVisits({ orgId: user.orgId!, from, to, status })
  }

  // ─── Commissions ──────────────────────────────────────────────────────────

  @Post('commissions')
  @Roles(UserRole.BROKER, UserRole.AGENT, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create commission record on booking' })
  createCommission(@Body() dto: CreateCommissionDto, @CurrentUser() user: RequestUser) {
    return this.crmService.createCommission(dto, user)
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Get commissions with summary stats' })
  getCommissions(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: number,
    @Query('status') status?: string,
  ) {
    return this.crmService.getCommissions(user, page, 20, status)
  }

  @Patch('commissions/:id/status')
  @ApiOperation({ summary: 'Approve, hold, or cancel a commission' })
  updateCommissionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommissionStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.crmService.updateCommissionStatus(id, dto, user)
  }

  @Post('commissions/pay')
  @Roles(UserRole.ADMIN, UserRole.BUILDER)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Record commission payout to broker' })
  recordPayment(@Body() dto: RecordCommissionPaymentDto, @CurrentUser() user: RequestUser) {
    return this.crmService.recordCommissionPayment(dto, user)
  }

  // ─── Customers ────────────────────────────────────────────────────────────

  @Post('customers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a customer record' })
  createCustomer(@Body() dto: CreateCustomerDto, @CurrentUser() user: RequestUser) {
    return this.crmService.createCustomer(dto, user)
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get all customers' })
  getCustomers(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: number,
    @Query('search') search?: string,
  ) {
    return this.crmService.getCustomers(user.orgId!, page, 20, search)
  }

  @Get('customers/:id')
  @ApiOperation({ summary: 'Get customer with documents' })
  getCustomer(@Param('id', ParseUUIDPipe) id: string) {
    return this.crmService.getCustomerById(id)
  }

  @Patch('customers/:id')
  @ApiOperation({ summary: 'Update customer details' })
  updateCustomer(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCustomerDto) {
    return this.crmService.updateCustomer(id, dto)
  }
}
