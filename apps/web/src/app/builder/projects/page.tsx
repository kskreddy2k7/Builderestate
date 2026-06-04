import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Building2 } from 'lucide-react'
import { PageHeader, EmptyState, Badge, ProgressBar } from '@/components/shared/data-display'

export const metadata: Metadata = { title: 'Projects' }

// Server component — in production fetches from API server-side
export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage all your real estate projects"
        breadcrumb={[{ label: 'Builder', href: '/builder/dashboard' }, { label: 'Projects' }]}
        actions={
          <Link
            href="/builder/projects/new"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        }
      />

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        {['All', 'Under construction', 'Planning', 'Completed'].map((tab) => (
          <button
            key={tab}
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-colors first:bg-background first:shadow-sm"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Projects list - data fetched client-side in module implementation */}
      <ProjectsClient />
    </>
  )
}

function ProjectsClient() {
  // Placeholder — full React Query implementation during module build
  const mockProjects = [
    {
      id: '1', name: 'Prestige Lakeside Residences', city: 'Bengaluru',
      status: 'UNDER_CONSTRUCTION', progress: 62, numberOfUnits: 240, numberOfTowers: 3,
      startDate: '2023-06-01', expectedCompletionDate: '2026-12-31',
      reraNumber: 'PRM/KA/RERA/1251/310',
      stats: { available: 51, booked: 189, total: 240 },
    },
    {
      id: '2', name: 'Skyline Heights Phase 2', city: 'Hyderabad',
      status: 'UNDER_CONSTRUCTION', progress: 38, numberOfUnits: 320, numberOfTowers: 4,
      startDate: '2023-11-01', expectedCompletionDate: '2027-06-30',
      reraNumber: 'P02400001234',
      stats: { available: 110, booked: 210, total: 320 },
    },
    {
      id: '3', name: 'Green Valley Villas', city: 'Pune',
      status: 'PLANNING', progress: 5, numberOfUnits: 80, numberOfTowers: 0,
      startDate: '2024-04-01', expectedCompletionDate: '2027-03-31',
      reraNumber: null,
      stats: { available: 68, booked: 12, total: 80 },
    },
  ]

  const statusConfig: Record<string, { label: string; variant: any }> = {
    PLANNING: { label: 'Planning', variant: 'default' },
    UNDER_CONSTRUCTION: { label: 'Under construction', variant: 'warning' },
    COMPLETED: { label: 'Completed', variant: 'success' },
    POSSESSION_STARTED: { label: 'Possession', variant: 'info' },
  }

  return (
    <div className="grid gap-4">
      {mockProjects.map((project) => {
        const sc = statusConfig[project.status] ?? { label: project.status, variant: 'default' }
        return (
          <Link
            key={project.id}
            href={`/builder/projects/${project.id}/overview`}
            className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-card-hover"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold group-hover:text-primary transition-colors">{project.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.city} · {project.numberOfTowers} towers · {project.numberOfUnits} units
                  </p>
                  {project.reraNumber && (
                    <p className="text-xs text-muted-foreground">RERA: {project.reraNumber}</p>
                  )}
                </div>
              </div>
              <Badge variant={sc.variant}>{sc.label}</Badge>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Construction progress</p>
                <ProgressBar value={project.progress} showValue size="sm" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Unit sales</p>
                <div className="flex gap-3 text-xs">
                  <span className="text-success-600 font-medium">{project.stats.booked} booked</span>
                  <span className="text-muted-foreground">{project.stats.available} available</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-success-500 transition-all"
                    style={{ width: `${(project.stats.booked / project.stats.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Start: {new Date(project.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                <p>Target: {new Date(project.expectedCompletionDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
