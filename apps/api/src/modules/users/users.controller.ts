import {
  Controller, Get, Patch, Post, Body, UseGuards,
  UseInterceptors, UploadedFile, HttpCode, HttpStatus, Query,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getProfile(user.id)
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile name / phone' })
  updateMe(@CurrentUser() user: RequestUser, @Body() body: { name?: string; phone?: string }) {
    return this.usersService.updateProfile(user.id, body)
  }

  @Post('me/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile avatar' })
  uploadAvatar(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadAvatar(user.id, file)
  }

  @Get('me/organisation')
  @ApiOperation({ summary: 'Get my organisation with members' })
  getOrg(@CurrentUser() user: RequestUser) {
    return this.usersService.getOrganisation(user.orgId!)
  }

  @Get('me/notifications')
  @ApiOperation({ summary: 'Get my notifications' })
  getNotifications(@CurrentUser() user: RequestUser, @Query('page') page?: number) {
    return this.usersService.getNotifications(user.id, page)
  }
}
