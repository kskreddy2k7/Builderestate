import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import OpenAI from 'openai'
import type {
  CostEstimateRequestDto, PropertyValuationDto,
  DocumentAnalysisDto, RiskAnalysisDto, AIChatDto, ConstructionPlanDto,
} from './dto/ai.dto'

// Cost rates per sqft by city tier and specification (INR)
const COST_RATES: Record<string, Record<string, { min: number; max: number }>> = {
  TIER1: {
    ECONOMY: { min: 1800, max: 2400 },
    STANDARD: { min: 2400, max: 3200 },
    PREMIUM: { min: 3200, max: 4500 },
    LUXURY: { min: 4500, max: 7000 },
  },
  TIER2: {
    ECONOMY: { min: 1500, max: 2000 },
    STANDARD: { min: 2000, max: 2800 },
    PREMIUM: { min: 2800, max: 3800 },
    LUXURY: { min: 3800, max: 5500 },
  },
  TIER3: {
    ECONOMY: { min: 1200, max: 1600 },
    STANDARD: { min: 1600, max: 2200 },
    PREMIUM: { min: 2200, max: 3000 },
    LUXURY: { min: 3000, max: 4500 },
  },
}

const TIER1_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad']
const TIER2_CITIES = ['Jaipur', 'Lucknow', 'Surat', 'Bhopal', 'Indore', 'Coimbatore', 'Kochi', 'Visakhapatnam', 'Nagpur']

const BUDGET_BREAKDOWN = [
  { head: 'Civil / Structure', percentage: 40 },
  { head: 'Finishing & interiors', percentage: 20 },
  { head: 'Electrical', percentage: 8 },
  { head: 'Plumbing', percentage: 7 },
  { head: 'External development', percentage: 7 },
  { head: 'Architect & consulting', percentage: 4 },
  { head: 'Admin & overheads', percentage: 5 },
  { head: 'Contingency (10%)', percentage: 9 },
]

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private openai: OpenAI | null = null

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY')
    if (apiKey && apiKey !== 'your-openai-api-key') {
      this.openai = new OpenAI({ apiKey })
    } else {
      this.logger.warn('OpenAI API key not configured — AI features will return mock data')
    }
  }

  // ─── Cost Estimator ───────────────────────────────────────────────────────

  async estimateCost(dto: CostEstimateRequestDto, userId: string) {
    const cacheKey = this.redis.key('ai:cost', JSON.stringify({ city: dto.city, area: dto.area, specs: dto.specifications }))
    const cached = await this.redis.get(cacheKey)
    if (cached) return cached

    const cityNorm = dto.city.trim()
    let tier = 'TIER3'
    if (TIER1_CITIES.some((c) => cityNorm.toLowerCase().includes(c.toLowerCase()))) tier = 'TIER1'
    else if (TIER2_CITIES.some((c) => cityNorm.toLowerCase().includes(c.toLowerCase()))) tier = 'TIER2'

    const rates = COST_RATES[tier]![dto.specifications]!
    let multiplier = 1
    if (dto.floors > 10) multiplier += 0.05 * Math.floor((dto.floors - 10) / 5)
    if (dto.basementRequired) multiplier += 0.08
    if (dto.parkingRequired) multiplier += 0.05
    if (dto.buildingType === 'COMMERCIAL') multiplier += 0.10

    const totalArea = dto.area * dto.floors
    const minCost = Math.round(rates.min * totalArea * multiplier)
    const maxCost = Math.round(rates.max * totalArea * multiplier)
    const avgCost = Math.round((minCost + maxCost) / 2)

    const breakdown = BUDGET_BREAKDOWN.map((b) => ({
      head: b.head,
      percentage: b.percentage,
      amount: Math.round(avgCost * b.percentage / 100),
    }))

    const result = {
      input: dto,
      minCost, maxCost, avgCost,
      costPerSqft: { min: rates.min * multiplier, max: rates.max * multiplier },
      breakdown,
      cityTier: tier,
      confidence: tier === 'TIER1' ? 82 : tier === 'TIER2' ? 75 : 68,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      disclaimer: 'Estimates are indicative based on market data. Actual costs may vary by ±15–20% depending on soil conditions, design complexity, and market fluctuations.',
    }

    await this.prisma.aiRequest.create({
      data: {
        userId, type: 'COST_ESTIMATE', input: dto as object,
        output: result as object, model: 'buildestate-cost-model-v1',
        status: 'COMPLETED', completedAt: new Date(),
      },
    })

    await this.redis.set(cacheKey, result, 3600)
    return result
  }

  // ─── Property Valuation ───────────────────────────────────────────────────

  async valuateProperty(dto: PropertyValuationDto, userId: string) {
    // Fetch comparable recent transactions from DB
    const comparables = await this.prisma.property.findMany({
      where: {
        city: { contains: dto.city, mode: 'insensitive' },
        status: 'SOLD',
        type: dto.type as any,
        area: { gte: dto.area * 0.7, lte: dto.area * 1.3 },
      },
      select: { price: true, area: true, addressLine1: true, city: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    })

    const avgPricePerSqft = comparables.length > 0
      ? comparables.reduce((sum, c) => sum + Number(c.price) / Number(c.area), 0) / comparables.length
      : this.getDefaultRateForCity(dto.city)

    // Adjust for property specifics
    const adjustmentFactor = 1 + (Math.random() * 0.1 - 0.05) // ±5% variation
    const estimatedPricePerSqft = Math.round(avgPricePerSqft * adjustmentFactor)
    const estimatedValue = Math.round(estimatedPricePerSqft * dto.area)

    const result = {
      address: dto.address, area: dto.area, type: dto.type,
      estimatedValue, pricePerSqft: estimatedPricePerSqft,
      comparables: comparables.map((c) => ({
        address: c.addressLine1,
        price: Number(c.price), area: Number(c.area),
        pricePerSqft: Math.round(Number(c.price) / Number(c.area)),
      })),
      marketTrend: 'STABLE' as const,
      confidence: comparables.length >= 3 ? 78 : comparables.length >= 1 ? 65 : 50,
      validAt: new Date().toISOString(),
    }

    await this.prisma.aiRequest.create({
      data: {
        userId, type: 'VALUATION', input: dto as object,
        output: result as object, model: 'buildestate-valuation-v1',
        status: 'COMPLETED', completedAt: new Date(),
      },
    })

    return result
  }

  // ─── Risk Detection ───────────────────────────────────────────────────────

  async detectProjectRisks(dto: RiskAnalysisDto, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        milestones: { where: { status: { in: ['DELAYED', 'NOT_STARTED'] } } },
        budget: { include: { heads: true } },
        _count: { select: { dailyReports: true } },
      },
    })
    if (!project) return { risks: [] }

    const risks: {
      type: string; severity: string; title: string; description: string; detectedAt: string
    }[] = []

    // Schedule delay detection
    const delayedMilestones = project.milestones.filter((m) => {
      return m.status === 'NOT_STARTED' && new Date(m.plannedStartDate) < new Date()
    })
    if (delayedMilestones.length > 0) {
      risks.push({
        type: 'SCHEDULE_DELAY', severity: delayedMilestones.length >= 3 ? 'HIGH' : 'MEDIUM',
        title: `${delayedMilestones.length} milestone(s) delayed`,
        description: `Milestones not started past planned dates: ${delayedMilestones.map((m) => m.name).join(', ')}`,
        detectedAt: new Date().toISOString(),
      })
    }

    // Budget overrun detection
    if (project.budget) {
      const overrunHeads = project.budget.heads.filter(
        (h) => Number(h.spentAmount) > Number(h.allocatedAmount) * 0.9,
      )
      if (overrunHeads.length > 0) {
        risks.push({
          type: 'BUDGET_OVERRUN', severity: 'HIGH',
          title: `Budget overrun in ${overrunHeads.length} head(s)`,
          description: `${overrunHeads.map((h) => h.name).join(', ')} approaching or exceeding budget.`,
          detectedAt: new Date().toISOString(),
        })
      }
    }

    // Low reporting frequency
    const recentReports = await this.prisma.dailySiteReport.count({
      where: { projectId: dto.projectId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    })
    if (recentReports < 3 && project.status === 'UNDER_CONSTRUCTION') {
      risks.push({
        type: 'QUALITY_FAILURE', severity: 'LOW',
        title: 'Low site reporting frequency',
        description: `Only ${recentReports} daily reports submitted in the last 7 days. Consistent reporting ensures quality control.`,
        detectedAt: new Date().toISOString(),
      })
    }

    // Save risks to DB
    if (risks.length > 0) {
      await this.prisma.riskFlag.createMany({
        data: risks.map((r) => ({
          projectId: dto.projectId, type: r.type, severity: r.severity,
          title: r.title, description: r.description,
        })),
        skipDuplicates: false,
      })
    }

    return { projectId: dto.projectId, risks, analyzedAt: new Date().toISOString() }
  }

  // ─── Lead Scoring ─────────────────────────────────────────────────────────

  async scoreLead(leadId: string, userId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        activities: { orderBy: { doneAt: 'desc' }, take: 20 },
        siteVisits: true,
      },
    })
    if (!lead) return { score: 0, factors: [] }

    let score = lead.score ?? 20
    const factors: { factor: string; impact: number; description: string }[] = []

    // Activity scoring
    const hasCallActivity = lead.activities.some((a) => a.type === 'CALL')
    const hasSiteVisit = lead.siteVisits.some((v) => v.status === 'COMPLETED')
    const daysSinceCreation = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)

    if (hasCallActivity) { factors.push({ factor: 'Call made', impact: 10, description: 'Lead has been contacted by phone' }); score += 10 }
    if (hasSiteVisit) { factors.push({ factor: 'Site visited', impact: 20, description: 'Completed site visit indicates strong intent' }); score += 20 }
    if (lead.budgetMin && lead.budgetMax) { factors.push({ factor: 'Budget defined', impact: 10, description: 'Has clear budget range' }); score += 10 }
    if (lead.email) { factors.push({ factor: 'Email provided', impact: 5, description: 'Contact completeness' }); score += 5 }
    if (lead.preferredLocations?.length) { factors.push({ factor: 'Location preference', impact: 5, description: 'Has specific location preferences' }); score += 5 }
    if (lead.source === 'REFERRAL') { factors.push({ factor: 'Referral source', impact: 15, description: 'Referral leads close 3x more often' }); score += 15 }
    if (daysSinceCreation > 30 && lead.stage === 'NEW') { factors.push({ factor: 'Stale lead', impact: -10, description: 'No activity in 30+ days' }); score -= 10 }

    score = Math.max(0, Math.min(100, score))

    await this.prisma.lead.update({ where: { id: leadId }, data: { score } })

    return {
      leadId, previousScore: lead.score, newScore: score,
      factors, recommendation: score >= 70 ? 'Hot — schedule site visit immediately' : score >= 40 ? 'Warm — schedule follow-up call' : 'Cold — nurture with content',
    }
  }

  // ─── AI Chat ──────────────────────────────────────────────────────────────

  async chat(dto: AIChatDto, userId: string) {
    const requestId = await this.prisma.aiRequest.create({
      data: {
        userId, type: 'DOC_ANALYSIS', input: { message: dto.message } as object,
        model: 'gpt-4o', status: 'PROCESSING',
      },
    })

    if (!this.openai) {
      return {
        reply: `I'm BuildEstate's AI assistant. I can help with cost estimation, property valuation, construction planning, and risk analysis. OpenAI integration is not yet configured — please add your API key to enable full AI capabilities.\n\nYour question: "${dto.message}"`,
        requestId: requestId.id,
      }
    }

    try {
      const systemPrompt = `You are BuildEstate AI, an expert assistant for the Indian real estate and construction industry.
You help builders, brokers, buyers, contractors, and site engineers with:
- Construction cost estimation and budgeting
- Property valuation and market analysis  
- Construction planning and scheduling
- Risk identification and mitigation
- Legal document analysis (agreements, RERA, title deeds)
- Lead qualification and scoring

Context: ${dto.context ?? 'General BuildEstate platform query'}
Always respond in the context of Indian real estate. Mention INR for currencies.`

      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...(dto.history ?? []).map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        { role: 'user', content: dto.message },
      ]

      const response = await this.openai.chat.completions.create({
        model: this.config.get('OPENAI_MODEL', 'gpt-4o'),
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      })

      const reply = response.choices[0]?.message.content ?? ''

      await this.prisma.aiRequest.update({
        where: { id: requestId.id },
        data: {
          output: { reply } as object,
          tokensUsed: response.usage?.total_tokens,
          status: 'COMPLETED', completedAt: new Date(),
        },
      })

      return { reply, requestId: requestId.id }
    } catch (err) {
      await this.prisma.aiRequest.update({
        where: { id: requestId.id },
        data: { status: 'FAILED', error: String(err) },
      })
      throw new ServiceUnavailableException('AI service temporarily unavailable')
    }
  }

  // ─── History ──────────────────────────────────────────────────────────────

  async getHistory(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.aiRequest.findMany({
        where: { userId, status: 'COMPLETED' },
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, type: true, createdAt: true, tokensUsed: true },
      }),
      this.prisma.aiRequest.count({ where: { userId, status: 'COMPLETED' } }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getRiskFlags(projectId: string) {
    return this.prisma.riskFlag.findMany({
      where: { projectId, status: { in: ['ACTIVE', 'ACKNOWLEDGED'] } },
      orderBy: [{ severity: 'desc' }, { detectedAt: 'desc' }],
    })
  }

  private getDefaultRateForCity(city: string): number {
    const cityNorm = city.toLowerCase()
    if (TIER1_CITIES.some((c) => cityNorm.includes(c.toLowerCase()))) return 7500
    if (TIER2_CITIES.some((c) => cityNorm.includes(c.toLowerCase()))) return 5500
    return 4000
  }
}
