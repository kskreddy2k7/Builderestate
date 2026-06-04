import type { Metadata } from 'next'
import { Building2, Home, TrendingUp, HardHat, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { StatsCard, Section, ProgressBar, Badge } from '@/components/shared/data-display'

export const metadata: Metadata = { title: 'Project Overview' }

interface Props { params: { id: string } }

// In production: fetch project data server-side using cookies for auth
export default function ProjectOverviewPage({ params }: Props) {
  // Mock data — replaced with real API fetch in module build
  const project = {
    name: 'Prestige Lakeside Residences',
    status: 'UNDER_CONSTRUCTION',
    progress: 62,
    expectedCompletionDate: '2026-12-31',
    reraNumber: 'PRM/KA/RERA/1251/310',
    city: 'Bengaluru',
  }

  const milestones = [
    { name: 'Foundation & basement', status: 'COMPLETED', progress: 100, dueDate: '2024-03-31' },
    { name: 'Ground floor slab', status: 'COMPLETED', progress: 100, dueDate: '2024-06-30' },
    { name: 'Structure — floors 1–10', status: 'COMPLETED', progress: 100, dueDate: '2024-12-31' },
    { name: 'Structure — floors 11–20', status: 'IN_PROGRESS', progress: 65, dueDate: '2025-06-30' },
    { name: 'Brick work & plastering', status: 'NOT_STARTED', progress: 0, dueDate: '2025-09-30' },
    { name: 'Flooring & finishing', status: 'NOT_STARTED', progress: 0, dueDate: '2026-03-31' },
    { name: 'Electrical & plumbing', status: 'NOT_STARTED', progress: 0, dueDate: '2026-06-30' },
    { name: 'Handover & possession', status: 'NOT_STARTED', progress: 0, dueDate: '2026-12-31' },
  ]

  const msStatusConfig: Record<string, { label: string; variant: any; icon: any; color: string }> = {
    COMPLETED: { label: 'Done', variant: 'success', icon: CheckCircle2, color: 'text-success-600' },
    IN_PROGRESS: { label: 'In progress', variant: 'warning', icon: Clock, color: 'text-warning-600' },
    NOT_STARTED: { label: 'Not started', variant: 'default', icon: AlertCircle, color: 'text-muted-foreground' },
    DELAYED: { label: 'Delayed', variant: 'danger', icon: AlertCircle, color: 'text-danger-500' },
  }

  return (
    <>
      {/* Project header */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{project.city} · RERA: {project.reraNumber}</p>
          </div>
          <Badge variant="warning">Under construction</Badge>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall progress</span>
            <span className="font-semibold">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} size="lg" variant="default" />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Target completion: {new Date(project.expectedCompletionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard title="Total units" value="240" description="3 towers" icon={Building2} />
        <StatsCard title="Booked" value="189" description="78.75% sold" icon={Home} trend={{ value: 8, label: 'this month' }} />
        <StatsCard title="Collection (YTD)" value="₹31.2 Cr" description="64.5% of demand" icon={TrendingUp} />
        <StatsCard title="Labour today" value="312" description="Across all towers" icon={HardHat} />
      </div>

      {/* Milestones timeline */}
      <Section title="Construction milestones" description="Planned vs actual progress">
        <div className="space-y-4">
          {milestones.map((ms) => {
            const sc = msStatusConfig[ms.status] ?? msStatusConfig['NOT_STARTED']
            const Icon = sc.icon
            return (
              <div key={ms.name} className="flex items-center gap-4">
                <Icon className={cn('h-5 w-5 shrink-0', sc.color)} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-sm font-medium">{ms.name}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {new Date(ms.dueDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                      <Badge variant={sc.variant as any}>{sc.label}</Badge>
                    </div>
                  </div>
                  {ms.progress > 0 && (
                    <ProgressBar
                      value={ms.progress}
                      size="sm"
                      variant={ms.status === 'COMPLETED' ? 'success' : ms.status === 'IN_PROGRESS' ? 'default' : 'warning'}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </>
  )
}

// cn helper (imported from utils in real implementation)
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
