import type { Metadata } from 'next'
import { Building2, TrendingUp, Home, HardHat, IndianRupee, AlertTriangle } from 'lucide-react'
import { PageHeader, StatsCard, Section, ProgressBar, Badge } from '@/components/shared/data-display'

export const metadata: Metadata = { title: 'Builder Dashboard' }

// In production these would come from server components / RSC fetch
const stats = [
  { title: 'Active Projects', value: '4', description: '2 under construction', icon: Building2, trend: { value: 0, label: 'vs last month' } },
  { title: 'Total Units', value: '892', description: '234 available', icon: Home, trend: { value: 12, label: 'vs last month' } },
  { title: 'Bookings (YTD)', value: '127', description: '₹48.3 Cr value', icon: TrendingUp, trend: { value: 8, label: 'vs last year' } },
  { title: 'Collection (YTD)', value: '₹31.2 Cr', description: '64.5% of demand', icon: IndianRupee, trend: { value: 5, label: 'vs last quarter' } },
]

const projects = [
  { name: 'Prestige Lakeside Residences', location: 'Bengaluru', status: 'UNDER_CONSTRUCTION', progress: 62, units: { total: 240, booked: 189, available: 51 }, phase: 'Structure' },
  { name: 'Skyline Heights Phase 2', location: 'Hyderabad', status: 'UNDER_CONSTRUCTION', progress: 38, units: { total: 320, booked: 210, available: 110 }, phase: 'Foundation' },
  { name: 'Green Valley Villas', location: 'Pune', status: 'PLANNING', progress: 5, units: { total: 80, booked: 12, available: 68 }, phase: 'Approvals' },
  { name: 'Riverside Apartments', location: 'Chennai', status: 'POSSESSION_STARTED', progress: 98, units: { total: 252, booked: 252, available: 0 }, phase: 'Possession' },
]

const recentActivity = [
  { type: 'BOOKING', message: 'New booking — Unit 704, Tower A, Lakeside Residences', time: '2 hours ago', color: 'success' },
  { type: 'PAYMENT', message: 'Payment received ₹8,50,000 — Anand Mehta', time: '4 hours ago', color: 'info' },
  { type: 'PROGRESS', message: 'Slab casting completed — Floor 14, Tower B', time: '6 hours ago', color: 'default' },
  { type: 'ALERT', message: 'Budget overrun detected — Civil works, Skyline Heights', time: '1 day ago', color: 'warning' },
  { type: 'NCR', message: 'NCR #047 raised — Waterproofing defect, Green Valley', time: '1 day ago', color: 'danger' },
]

const statusLabels: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'default' }> = {
  PLANNING: { label: 'Planning', variant: 'default' },
  UNDER_CONSTRUCTION: { label: 'Under construction', variant: 'warning' },
  POSSESSION_STARTED: { label: 'Possession started', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'success' },
}

const activityColors: Record<string, string> = {
  success: 'bg-success-500',
  info: 'bg-brand-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  default: 'bg-muted-foreground',
}

export default function BuilderDashboardPage() {
  return (
    <>
      <PageHeader
        title="Builder Dashboard"
        description="Overview of your projects, bookings, and collections"
        actions={
          <a
            href="/builder/projects/new"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Building2 className="h-4 w-4" />
            New project
          </a>
        }
      />

      {/* KPI cards */}
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
        {/* Project status */}
        <Section
          title="Active projects"
          description="Progress across all running projects"
          className="lg:col-span-2"
          actions={
            <a href="/builder/projects" className="text-xs text-primary hover:underline">View all</a>
          }
        >
          <div className="space-y-5">
            {projects.map((project) => {
              const statusInfo = statusLabels[project.status] ?? { label: project.status, variant: 'default' }
              return (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.location} · {project.phase}</p>
                    </div>
                    <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
                  </div>
                  <ProgressBar
                    value={project.progress}
                    showValue
                    size="sm"
                    variant={project.progress >= 90 ? 'success' : project.progress >= 50 ? 'default' : 'warning'}
                  />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="text-success-600 font-medium">{project.units.booked} booked</span>
                    <span>{project.units.available} available</span>
                    <span>{project.units.total} total</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Recent activity */}
        <Section
          title="Recent activity"
          description="Latest events across all projects"
        >
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="relative mt-1">
                  <div className={`h-2 w-2 rounded-full ${activityColors[item.color]}`} />
                  {i < recentActivity.length - 1 && (
                    <div className="absolute left-[3px] top-2 h-full w-px bg-border" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-xs leading-relaxed">{item.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  )
}
