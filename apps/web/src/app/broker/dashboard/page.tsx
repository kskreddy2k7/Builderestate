import type { Metadata } from 'next'
import { Target, TrendingUp, Calendar, IndianRupee, Plus } from 'lucide-react'
import { PageHeader, StatsCard, Section, Badge, EmptyState } from '@/components/shared/data-display'

export const metadata: Metadata = { title: 'Broker Dashboard' }

const stats = [
  { title: 'Active leads', value: '47', description: '12 need follow-up today', icon: Target, trend: { value: 18, label: 'vs last month' } },
  { title: 'Site visits (MTD)', value: '23', description: '8 scheduled this week', icon: Calendar, trend: { value: 5, label: 'vs last month' } },
  { title: 'Bookings (MTD)', value: '6', description: '₹4.2 Cr value', icon: TrendingUp, trend: { value: 20, label: 'vs last month' } },
  { title: 'Commission earned', value: '₹8.4 L', description: '₹3.1 L pending payout', icon: IndianRupee, trend: { value: 15, label: 'vs last month' } },
]

const pipelineStages = [
  { stage: 'New', count: 14, color: 'bg-muted' },
  { stage: 'Contacted', count: 11, color: 'bg-brand-400' },
  { stage: 'Interested', count: 9, color: 'bg-brand-500' },
  { stage: 'Site visit', count: 7, color: 'bg-warning-500' },
  { stage: 'Negotiation', count: 4, color: 'bg-construction-500' },
  { stage: 'Booked', count: 2, color: 'bg-success-500' },
]

const hotLeads = [
  { name: 'Priya Verma', phone: '98765 43210', interest: '3BHK in Koramangala', budget: '₹1.2–1.5 Cr', lastContact: '1 day ago', score: 87 },
  { name: 'Rajesh Iyer', phone: '87654 32109', interest: '2BHK in Whitefield', budget: '₹65–80 L', lastContact: '2 days ago', score: 74 },
  { name: 'Deepika Sharma', phone: '76543 21098', interest: '4BHK Villa, Sarjapur', budget: '₹2–2.5 Cr', lastContact: '3 days ago', score: 68 },
]

const upcomingVisits = [
  { client: 'Vikram Malhotra', project: 'Prestige Lakeside', time: 'Today, 11:00 AM', status: 'CONFIRMED' },
  { client: 'Sonal Mehta', project: 'Skyline Heights', time: 'Today, 3:30 PM', status: 'CONFIRMED' },
  { client: 'Arjun Kapoor', project: 'Green Valley Villas', time: 'Tomorrow, 10:00 AM', status: 'SCHEDULED' },
]

export default function BrokerDashboardPage() {
  return (
    <>
      <PageHeader
        title="CRM Dashboard"
        description="Your leads, pipeline, and commission overview"
        actions={
          <a
            href="/broker/leads?new=1"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add lead
          </a>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline funnel */}
        <Section
          title="Lead pipeline"
          className="lg:col-span-1"
          actions={<a href="/broker/leads" className="text-xs text-primary hover:underline">View all</a>}
        >
          <div className="space-y-2">
            {pipelineStages.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">{s.stage}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-secondary h-6 relative">
                  <div
                    className={`h-full rounded-full transition-all ${s.color}`}
                    style={{ width: `${(s.count / 14) * 100}%`, minWidth: s.count > 0 ? '1.5rem' : 0 }}
                  />
                  <span className="absolute inset-0 flex items-center pl-2 text-xs font-medium">
                    {s.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Hot leads */}
        <Section
          title="Hot leads"
          description="High-score leads needing attention"
          className="lg:col-span-2"
          actions={<a href="/broker/leads" className="text-xs text-primary hover:underline">All leads</a>}
        >
          <div className="space-y-3">
            {hotLeads.map((lead) => (
              <div key={lead.name} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.interest}</p>
                  <p className="text-xs text-muted-foreground">Budget: {lead.budget}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="mb-1 flex items-center justify-end gap-1">
                    <div className={`h-2 w-2 rounded-full ${lead.score > 80 ? 'bg-success-500' : 'bg-warning-500'}`} />
                    <span className="text-xs font-medium">{lead.score}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{lead.lastContact}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Upcoming visits */}
        <Section
          title="Upcoming site visits"
          description="Scheduled visits for next 48 hours"
          className="lg:col-span-3"
          actions={<a href="/broker/calendar" className="text-xs text-primary hover:underline">View calendar</a>}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {upcomingVisits.map((visit) => (
              <div key={visit.client} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-start justify-between">
                  <p className="text-sm font-medium">{visit.client}</p>
                  <Badge variant={visit.status === 'CONFIRMED' ? 'success' : 'info'}>
                    {visit.status === 'CONFIRMED' ? 'Confirmed' : 'Scheduled'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{visit.project}</p>
                <p className="mt-1 text-xs font-medium">{visit.time}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  )
}
