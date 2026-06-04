import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AiService } from './ai.service'
import {
  CostEstimateRequestDto, PropertyValuationDto,
  DocumentAnalysisDto, RiskAnalysisDto, AIChatDto,
} from './dto/ai.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators'
import type { RequestUser } from '@/common/decorators'

@ApiTags('ai')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('cost-estimate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI construction cost estimator by city, area, and specs' })
  estimateCost(@Body() dto: CostEstimateRequestDto, @CurrentUser() user: RequestUser) {
    return this.aiService.estimateCost(dto, user.id)
  }

  @Post('valuation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI property valuation using comparable transactions' })
  valuate(@Body() dto: PropertyValuationDto, @CurrentUser() user: RequestUser) {
    return this.aiService.valuateProperty(dto, user.id)
  }

  @Post('risk-analysis')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detect budget overruns, delays, and quality risks for a project' })
  analyzeRisks(@Body() dto: RiskAnalysisDto, @CurrentUser() user: RequestUser) {
    return this.aiService.detectProjectRisks(dto, user.id)
  }

  @Post('score-lead')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI lead scoring based on engagement signals' })
  scoreLead(@Body() body: { leadId: string }, @CurrentUser() user: RequestUser) {
    return this.aiService.scoreLead(body.leadId, user.id)
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chat with BuildEstate AI (GPT-4o powered)' })
  chat(@Body() dto: AIChatDto, @CurrentUser() user: RequestUser) {
    return this.aiService.chat(dto, user.id)
  }

  @Get('risk-flags/:projectId')
  @ApiOperation({ summary: 'Get active risk flags for a project' })
  getRiskFlags(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.aiService.getRiskFlags(projectId)
  }

  @Get('history')
  @ApiOperation({ summary: 'Get AI request history for current user' })
  getHistory(@CurrentUser() user: RequestUser, @Query('page') page?: number) {
    return this.aiService.getHistory(user.id, page)
  }
}
