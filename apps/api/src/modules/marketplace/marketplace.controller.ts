import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFiles, UploadedFile,
  HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common'
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { MarketplaceService } from './marketplace.service'
import {
  CreatePropertyDto, UpdatePropertyDto, PropertySearchDto,
  CreateEnquiryDto, VerifyPropertyDto, UpdatePropertyStatusDto,
} from './dto/marketplace.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CurrentUser, Public, Roles } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'
import { UserRole } from '@prisma/client'

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // ─── Public endpoints ─────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search and filter properties' })
  search(@Query() dto: PropertySearchDto) {
    return this.marketplaceService.search(dto)
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured properties for homepage' })
  getFeatured(@Query('limit') limit?: number) {
    return this.marketplaceService.getFeatured(limit ?? 6)
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get property by URL slug (public detail page)' })
  findBySlug(@Param('slug') slug: string) {
    return this.marketplaceService.findBySlug(slug)
  }

  @Public()
  @Post(':id/enquiry')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a property enquiry (no auth required)' })
  createEnquiry(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEnquiryDto,
  ) {
    return this.marketplaceService.createEnquiry(id, dto)
  }

  // ─── Authenticated user endpoints ─────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new property listing' })
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: RequestUser) {
    return this.marketplaceService.create(dto, user)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('my-listings')
  @ApiOperation({ summary: 'Get current user property listings' })
  getMyListings(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: any,
  ) {
    return this.marketplaceService.getMyListings(user.id, page, limit, status)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('saved')
  @ApiOperation({ summary: 'Get saved/bookmarked properties' })
  getSaved(
    @CurrentUser() user: RequestUser,
    @Query('page') page?: number,
  ) {
    return this.marketplaceService.getSavedProperties(user.id, page)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('stats')
  @ApiOperation({ summary: 'Get property statistics for current org' })
  getStats(@CurrentUser() user: RequestUser) {
    return this.marketplaceService.getStats(user.orgId)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID (authenticated, increments view)' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketplaceService.findById(id, true)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiOperation({ summary: 'Update property listing' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.marketplaceService.update(id, dto, user)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit property for admin review' })
  submitForReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.marketplaceService.submitForReview(id, user)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':id/media')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload property photos' })
  uploadMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: RequestUser,
  ) {
    return this.marketplaceService.uploadMedia(id, files, user)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':id/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle save/unsave property' })
  toggleSave(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.marketplaceService.toggleSave(id, user.id)
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a property listing' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.marketplaceService.remove(id, user)
  }

  // ─── Admin-only endpoints ─────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth('access-token')
  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Approve or reject a property listing' })
  verify(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyPropertyDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.marketplaceService.verify(id, dto, user.id)
  }
}
