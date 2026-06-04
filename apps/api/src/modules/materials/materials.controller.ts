import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { MaterialsService } from './materials.service'
import {
  CreateProductDto, CreateRFQDto, SubmitRFQResponseDto,
  CreatePurchaseOrderDto, UpdateDeliveryStatusDto, CreateGRNDto,
} from './dto/materials.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CurrentUser, Public, Roles } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'
import { UserRole } from '@prisma/client'

@ApiTags('materials')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Public() @Get('categories') @ApiOperation({ summary: 'Get product categories' })
  getCategories() { return this.materialsService.getCategories() }

  @Public() @Get('products') @ApiOperation({ summary: 'Search products' })
  getProducts(
    @Query('categoryId') categoryId?: string, @Query('supplierId') supplierId?: string,
    @Query('search') search?: string, @Query('page') page?: number,
  ) { return this.materialsService.getProducts({ categoryId, supplierId, search, page }) }

  @Roles(UserRole.SUPPLIER) @UseGuards(RolesGuard)
  @Post('products') @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Supplier: add product' })
  createProduct(@Body() dto: CreateProductDto, @CurrentUser() user: RequestUser) {
    return this.materialsService.createProduct(dto, user.id)
  }

  @Public() @Get('suppliers') @ApiOperation({ summary: 'Get verified suppliers' })
  getSuppliers(@Query('category') category?: string, @Query('page') page?: number) {
    return this.materialsService.getSuppliers(page, 20, category)
  }

  @Post('rfq') @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create RFQ request' })
  createRFQ(@Body() dto: CreateRFQDto, @CurrentUser() user: RequestUser) {
    return this.materialsService.createRFQ(dto, user)
  }

  @Get('rfq/project/:projectId') @ApiOperation({ summary: 'Get RFQs for project' })
  getRFQs(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.materialsService.getRFQs(projectId)
  }

  @Roles(UserRole.SUPPLIER) @UseGuards(RolesGuard)
  @Post('rfq/respond') @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Supplier: submit RFQ response' })
  respondRFQ(@Body() dto: SubmitRFQResponseDto, @CurrentUser() user: RequestUser) {
    return this.materialsService.submitRFQResponse(dto, user.id)
  }

  @Get('rfq/:rfqId/responses') @ApiOperation({ summary: 'Get RFQ responses for comparison' })
  getRFQResponses(@Param('rfqId', ParseUUIDPipe) rfqId: string) {
    return this.materialsService.getRFQResponses(rfqId)
  }

  @Post('purchase-orders') @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create purchase order' })
  createPO(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() user: RequestUser) {
    return this.materialsService.createPO(dto, user)
  }

  @Get('purchase-orders') @ApiOperation({ summary: 'List purchase orders' })
  getPOs(
    @Query('projectId') projectId?: string, @Query('supplierId') supplierId?: string,
    @Query('status') status?: string, @Query('page') page?: number,
  ) { return this.materialsService.getPOs({ projectId, supplierId, status }, page) }

  @Get('purchase-orders/:id') @ApiOperation({ summary: 'Get PO with items and deliveries' })
  getPO(@Param('id', ParseUUIDPipe) id: string) { return this.materialsService.getPOById(id) }

  @Post('purchase-orders/:id/delivery') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Update delivery status' })
  updateDelivery(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDeliveryStatusDto) {
    return this.materialsService.updateDelivery(id, dto)
  }

  @Post('grn') @HttpCode(HttpStatus.CREATED) @ApiOperation({ summary: 'Create Goods Receipt Note' })
  createGRN(@Body() dto: CreateGRNDto, @CurrentUser() user: RequestUser) {
    return this.materialsService.createGRN(dto, user)
  }
}
