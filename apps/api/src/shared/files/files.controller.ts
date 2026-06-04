import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { FilesService } from './files.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'

@ApiTags('files')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('signed-url')
  @ApiOperation({ summary: 'Get a signed URL for a private file' })
  async getSignedUrl(@Query('key') key: string): Promise<{ url: string }> {
    const url = await this.filesService.getSignedUrl(key)
    return { url }
  }
}
