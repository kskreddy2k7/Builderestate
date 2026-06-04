import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ContractorService } from './contractor.service'
import {
  CreateWorkOrderDto, UpdateWorkOrderDto, CreateLaborAttendanceDto,
  CreateRABillDto, ProcessRABillDto, CreateMaterialIndentDto, ProcessMaterialIndentDto,
} from './dto/contractor.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CurrentUser, Roles } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'
import { UserRole } from '@prisma/client'

@ApiTags('contractor')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('contractor')
export class ContractorController {
  constructor(private readonly contractorService: ContractorService) {}

  @Get('dashboard') @ApiOperation({ summary: 'Contractor dashboard' })
  getDashboard(@CurrentUser() user: RequestUser) {
    return this.contractorService.getDashboard(user.id)
  }

  @Post('work-orders') @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.BUILDER, UserRole.ADMIN) @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create work order' })
  createWO(@Body() dto: CreateWorkOrderDto) { return this.contractorService.createWorkOrder(dto) }

  @Get('work-orders') @ApiOperation({ summary: 'List work orders' })
  getWOs(
    @CurrentUser() user: RequestUser,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
  ) {
    return this.contractorService.getWorkOrders({ projectId, userId: user.id, status }, page)
  }

  @Get('work-orders/:id') @ApiOperation({ summary: 'Get work order detail' })
  getWO(@Param('id', ParseUUIDPipe) id: string) { return this.contractorService.getWorkOrderById(id) }

  @Patch('work-orders/:id') @ApiOperation({ summary: 'Update work order' })
  updateWO(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.contractorService.updateWorkOrder(id, dto)
  }

  @Post('work-orders/:id/issue') @HttpCode(HttpStatus.OK)
  @Roles(UserRole.BUILDER, UserRole.ADMIN) @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Issue a work order to contractor' })
  issueWO(@Param('id', ParseUUIDPipe) id: string) { return this.contractorService.issueWorkOrder(id) }

  @Post('work-orders/:id/accept') @HttpCode(HttpStatus.OK)
  @Roles(UserRole.CONTRACTOR) @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Contractor accepts a work order' })
  acceptWO(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.contractorService.acceptWorkOrder(id, user.id)
  }

  @Post('attendance') @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Mark labour attendance' })
  markAttendance(@Body() dto: CreateLaborAttendanceDto, @CurrentUser() user: RequestUser) {
    return this.contractorService.markAttendance(dto, user.id)
  }

  @Get('attendance') @ApiOperation({ summary: 'Get attendance records' })
  getAttendance(
    @Query('projectId') projectId: string, @Query('contractorId') contractorId?: string,
    @Query('from') from?: string, @Query('to') to?: string,
  ) { return this.contractorService.getAttendance(projectId, contractorId, from, to) }

  @Get('projects/:projectId/attendance-summary') @ApiOperation({ summary: '30-day attendance chart data' })
  getAttendanceSummary(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.contractorService.getAttendanceSummary(projectId)
  }

  @Post('ra-bills') @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Submit RA bill' })
  submitBill(@Body() dto: CreateRABillDto, @CurrentUser() user: RequestUser) {
    return this.contractorService.submitRABill(dto, user.id)
  }

  @Patch('ra-bills/:id/process')
  @Roles(UserRole.BUILDER, UserRole.ADMIN) @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Certify or reject RA bill' })
  processBill(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ProcessRABillDto, @CurrentUser() user: RequestUser) {
    return this.contractorService.processRABill(id, dto, user.id)
  }

  @Post('ra-bills/:id/pay') @HttpCode(HttpStatus.OK)
  @Roles(UserRole.BUILDER, UserRole.ADMIN) @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Mark RA bill as paid' })
  payBill(@Param('id', ParseUUIDPipe) id: string) { return this.contractorService.payRABill(id) }

  @Post('material-indents') @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Request materials' })
  createIndent(@Body() dto: CreateMaterialIndentDto, @CurrentUser() user: RequestUser) {
    return this.contractorService.createMaterialIndent(dto, user.id)
  }

  @Get('material-indents') @ApiOperation({ summary: 'Get material indent requests' })
  getIndents(@Query('projectId') projectId?: string, @Query('status') status?: string, @CurrentUser() user?: RequestUser) {
    return this.contractorService.getMaterialIndents({ projectId, status })
  }

  @Patch('material-indents/:id') @ApiOperation({ summary: 'Approve/reject material indent' })
  processIndent(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ProcessMaterialIndentDto, @CurrentUser() user: RequestUser) {
    return this.contractorService.processMaterialIndent(id, dto, user.id)
  }
}
