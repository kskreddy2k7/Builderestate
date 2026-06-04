import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFiles, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { ConstructionService } from './construction.service'
import {
  CreateProjectDto, UpdateProjectDto, CreateTowerDto, CreateUnitDto,
  CreateMilestoneDto, UpdateMilestoneDto, CreateProgressUpdateDto,
  CreateDSRDto, ApproveDSRDto, CreateQualityCheckDto,
} from './dto/construction.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CurrentUser, Roles } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'
import { UserRole, ProjectStatus } from '@prisma/client'

@ApiTags('construction')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('construction')
export class ConstructionController {
  constructor(private readonly constructionService: ConstructionService) {}

  // ─── Projects ─────────────────────────────────────────────────────────────

  @Post('projects')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new project' })
  createProject(@Body() dto: CreateProjectDto, @CurrentUser() user: RequestUser) {
    return this.constructionService.createProject(dto, user)
  }

  @Get('projects')
  @ApiOperation({ summary: 'Get all projects for current org' })
  getProjects(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ProjectStatus,
  ) {
    return this.constructionService.getProjects(user.orgId!, page, limit, status)
  }

  @Get('projects/:id/summary')
  @ApiOperation({ summary: 'Get project dashboard summary' })
  getProjectSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.constructionService.getProjectSummary(id)
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get full project details' })
  getProject(@Param('id', ParseUUIDPipe) id: string) {
    return this.constructionService.getProjectById(id)
  }

  @Patch('projects/:id')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update project details' })
  updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.constructionService.updateProject(id, dto, user)
  }

  // ─── Towers & Units ───────────────────────────────────────────────────────

  @Post('projects/:id/towers')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Add a tower to project (auto-creates floors)' })
  createTower(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTowerDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.constructionService.createTower(id, dto, user)
  }

  @Post('floors/:floorId/units')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Add a unit to a floor' })
  createUnit(@Param('floorId', ParseUUIDPipe) floorId: string, @Body() dto: CreateUnitDto) {
    return this.constructionService.createUnit(floorId, dto)
  }

  @Get('projects/:id/inventory')
  @ApiOperation({ summary: 'Get unit inventory with tower/floor breakdown' })
  getInventory(@Param('id', ParseUUIDPipe) id: string) {
    return this.constructionService.getUnitInventory(id)
  }

  // ─── Milestones ───────────────────────────────────────────────────────────

  @Post('projects/:id/milestones')
  @Roles(UserRole.BUILDER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a project milestone' })
  createMilestone(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateMilestoneDto) {
    return this.constructionService.createMilestone(id, dto)
  }

  @Get('projects/:id/milestones')
  @ApiOperation({ summary: 'Get all project milestones' })
  getMilestones(@Param('id', ParseUUIDPipe) id: string) {
    return this.constructionService.getMilestones(id)
  }

  @Patch('milestones/:id')
  @ApiOperation({ summary: 'Update milestone status and progress' })
  updateMilestone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMilestoneDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.constructionService.updateMilestone(id, dto, user)
  }

  // ─── Progress Updates ──────────────────────────────────────────────────────

  @Post('projects/:id/progress')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('media', 20))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Post a construction progress update with photos' })
  createProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProgressUpdateDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: RequestUser,
  ) {
    return this.constructionService.createProgressUpdate(id, dto, files, user)
  }

  @Get('projects/:id/progress')
  @ApiOperation({ summary: 'Get progress update feed for a project' })
  getProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: number,
  ) {
    return this.constructionService.getProgressUpdates(id, page)
  }

  // ─── Daily Site Reports ────────────────────────────────────────────────────

  @Post('projects/:id/dsr')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('media', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit a Daily Site Report' })
  createDSR(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateDSRDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: RequestUser,
  ) {
    return this.constructionService.createDSR(id, dto, files, user)
  }

  @Get('projects/:id/dsr')
  @ApiOperation({ summary: 'Get DSR list for a project' })
  getDSRs(@Param('id', ParseUUIDPipe) id: string, @Query('page') page?: number) {
    return this.constructionService.getDSRs(id, page)
  }

  @Patch('dsr/:id/approve')
  @Roles(UserRole.BUILDER, UserRole.SITE_ENGINEER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Approve or reject a DSR' })
  approveDSR(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveDSRDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.constructionService.approveDSR(id, dto, user)
  }

  // ─── Quality Checks ────────────────────────────────────────────────────────

  @Post('projects/:id/quality-checks')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('media', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a quality check record' })
  createQualityCheck(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateQualityCheckDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: RequestUser,
  ) {
    return this.constructionService.createQualityCheck(id, dto, files, user)
  }

  @Get('projects/:id/quality-checks')
  @ApiOperation({ summary: 'Get quality checks for a project' })
  getQualityChecks(@Param('id', ParseUUIDPipe) id: string, @Query('page') page?: number) {
    return this.constructionService.getQualityChecks(id, page)
  }
}
