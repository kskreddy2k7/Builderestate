import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CurrentUser, Roles } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'
import { UserRole, UserStatus } from '@prisma/client'

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform-wide analytics dashboard' })
  getStats() { return this.adminService.getPlatformStats() }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with filters' })
  getUsers(
    @Query('page') page?: number, @Query('limit') limit?: number,
    @Query('search') search?: string, @Query('role') role?: string,
    @Query('status') status?: UserStatus,
  ) { return this.adminService.getUsers(page, limit, { search, role, status }) }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user detail' })
  getUser(@Param('id', ParseUUIDPipe) id: string) { return this.adminService.getUserById(id) }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activate, suspend, or deactivate a user' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: UserStatus; reason?: string },
  ) { return this.adminService.updateUserStatus(id, body.status, body.reason) }

  @Get('verification-queue')
  @ApiOperation({ summary: 'Properties and orgs pending verification' })
  getQueue(
    @Query('page') page?: number,
    @Query('type') type?: 'property' | 'project' | 'org',
  ) { return this.adminService.getVerificationQueue(page, 20, type) }

  @Post('organisations/:id/verify')
  @ApiOperation({ summary: 'Verify or reject an organisation' })
  verifyOrg(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { decision: 'VERIFIED' | 'REJECTED'; reason?: string },
    @CurrentUser() user: RequestUser,
  ) { return this.adminService.verifyOrganization(id, body.decision, user.id, body.reason) }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Platform audit log' })
  getAuditLogs(
    @Query('page') page?: number, @Query('userId') userId?: string,
    @Query('resource') resource?: string, @Query('from') from?: string, @Query('to') to?: string,
  ) { return this.adminService.getAuditLogs(page, 50, { userId, resource, from, to }) }
}
