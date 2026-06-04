import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFiles, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { EngineerService } from './engineer.service'
import {
  CreateInspectionDto, CompleteInspectionDto, CreateNCRDto, UpdateNCRDto,
  CreateTestResultDto, CreateApprovalDto, ProcessApprovalDto,
} from './dto/engineer.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CurrentUser, Roles } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'
import { UserRole } from '@prisma/client'

@ApiTags('engineer')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('engineer')
export class EngineerController {
  constructor(private readonly engineerService: EngineerService) {}

  @Get('dashboard')
  @Roles(UserRole.SITE_ENGINEER, UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Today's inspections, open NCRs, pending approvals" })
  getDashboard(@CurrentUser() user: RequestUser) {
    return this.engineerService.getDashboard(user.id)
  }

  @Post('inspections')
  @Roles(UserRole.SITE_ENGINEER, UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule an inspection' })
  createInspection(@Body() dto: CreateInspectionDto, @CurrentUser() user: RequestUser) {
    return this.engineerService.createInspection(dto, user)
  }

  @Get('projects/:projectId/inspections')
  @ApiOperation({ summary: 'Get all inspections for a project' })
  getInspections(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('page') page?: number,
    @Query('status') status?: string,
  ) {
    return this.engineerService.getInspections(projectId, page, 20, status)
  }

  @Get('inspections/:id')
  @ApiOperation({ summary: 'Get inspection details' })
  getInspection(@Param('id', ParseUUIDPipe) id: string) {
    return this.engineerService.getInspectionById(id)
  }

  @Post('inspections/:id/complete')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('media', 20))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit inspection results with photos' })
  completeInspection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteInspectionDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: RequestUser,
  ) {
    return this.engineerService.completeInspection(id, dto, files, user)
  }

  @Post('ncr')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('before', 10))
  @ApiConsumes('multipart/form-data')
  @Roles(UserRole.SITE_ENGINEER, UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Raise a Non-Conformance Report' })
  createNCR(
    @Body() dto: CreateNCRDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: RequestUser,
  ) {
    return this.engineerService.createNCR(dto, files, user)
  }

  @Get('projects/:projectId/ncr')
  @ApiOperation({ summary: 'Get NCRs for a project' })
  getNCRs(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('page') page?: number,
    @Query('status') status?: string,
  ) {
    return this.engineerService.getNCRs(projectId, page, 20, status)
  }

  @Patch('ncr/:id')
  @UseInterceptors(FilesInterceptor('after', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update NCR status / add rectification evidence' })
  updateNCR(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNCRDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.engineerService.updateNCR(id, dto, files)
  }

  @Post('test-results')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log a material or structural test result' })
  createTestResult(@Body() dto: CreateTestResultDto) {
    return this.engineerService.createTestResult(dto)
  }

  @Get('projects/:projectId/test-results')
  @ApiOperation({ summary: 'Get test results for a project' })
  getTestResults(@Param('projectId', ParseUUIDPipe) projectId: string, @Query('page') page?: number) {
    return this.engineerService.getTestResults(projectId, page)
  }

  @Post('approvals')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('media', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Request an approval (pour card, slab, waterproofing)' })
  createApproval(
    @Body() dto: CreateApprovalDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: RequestUser,
  ) {
    return this.engineerService.createApproval(dto, files, user)
  }

  @Patch('approvals/:id')
  @Roles(UserRole.SITE_ENGINEER, UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Approve or reject an approval request' })
  processApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessApprovalDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.engineerService.processApproval(id, dto, user)
  }

  @Get('projects/:projectId/approvals')
  @ApiOperation({ summary: 'Get approvals for a project' })
  getApprovals(@Param('projectId', ParseUUIDPipe) projectId: string, @Query('page') page?: number) {
    return this.engineerService.getApprovals(projectId, page)
  }
}
