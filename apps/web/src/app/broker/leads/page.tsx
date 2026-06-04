'use client'

import { useState } from 'react'
import { Plus, Phone, Mail, Clock, Star, Search, Filter } from 'lucide-react'
import { useLeads, useUpdateLead, useCreateLead } from '@/hooks/use-crm'
import { PageHeader, Badge, EmptyState, Skeleton } from '@/components/shared/data-display'
import { cn, formatRelative } from '@buildestate/utils'

const STAGES = [
  { key: 'NEW', label: 'New', color: 'bg-muted border-border' },
  { key: 'CONTACTED', label: 'Contacted', color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' },
  { key: 'INTERESTED', label: 'Interested', color: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800' },
  { key: 'SITE_VISIT_SCHEDULED', label: 'Visit sched.', color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' },
  { key: 'SITE_VISIT_DONE', label: 'Visit done', color: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800' },
  { key: 'BOOKED', label: 'Booked', color: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' },
  { key: 'LOST', label: 'Lost', color: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' },
]

const SOURCE_LABELS: Record<string, string> = {
  PORTAL: 'Portal', REFERRAL: 'Referral', WALK_IN: 'Walk-in',
  SOCIAL_MEDIA: 'Social', CAMPAIGN: 'Campaign', COLD_CALL: 'Cold call',
  CHANNEL_PARTNER: 'Partner', NEWSPAPER: 'Newspaper', OTHER: 'Other',
}

export default function LeadsPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [search, setSearch] = useState('')
  const [activeStages, setActiveStages] = useState<string[]>([])
  const { mutate: updateLead } = useUpdateLead()

  const { data, isLoading } = useLeads(
    search ? { search } : {},
  )

  const leads = data?.items ?? []

  const getLeadsByStage = (stage: string) =>
    leads.filter((l: any) => l.stage === stage)

  const scoreColor = (score: number) =>
    score >= 70 ? 'text-success-600' : score >= 40 ? 'text-warning-600' : 'text-muted-foreground'

  if (isLoading) {
    return (
      <>
        <PageHeader title="Leads" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-full rounded-lg" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${data?.meta?.total ?? 0} total leads in pipeline`}
        actions={
          <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Add lead
          </button>
        }
      />

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center rounded-lg border border-border">
          {(['kanban', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                v === 'kanban' ? 'rounded-l-lg' : 'rounded-r-lg',
                view === v ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3" style={{ minWidth: `${STAGES.length * 220}px` }}>
            {STAGES.map((stage) => {
              const stageLeads = getLeadsByStage(stage.key)
              return (
                <div key={stage.key} className="w-52 shrink-0">
                  {/* Stage header */}
                  <div className={cn('mb-2 flex items-center justify-between rounded-lg border px-3 py-2', stage.color)}>
                    <span className="text-xs font-semibold">{stage.label}</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-xs font-medium">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Lead cards */}
                  <div className="space-y-2">
                    {stageLeads.map((lead: any) => (
                      <div
                        key={lead.id}
                        className="group cursor-pointer rounded-xl border border-border bg-card p-3 shadow-card transition-all hover:border-primary/40 hover:shadow-card-hover"
                        onClick={() => window.location.href = `/broker/leads/${lead.id}`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-1">
                          <p className="text-xs font-semibold line-clamp-1">{lead.name}</p>
                          <span className={cn('shrink-0 text-xs font-bold', scoreColor(lead.score))}>
                            {lead.score}
                          </span>
                        </div>

                        <p className="mb-1 text-xs text-muted-foreground">{lead.phone}</p>

                        {(lead.budgetMin || lead.budgetMax) && (
                          <p className="mb-1 text-xs text-muted-foreground">
                            {lead.budgetMin ? `₹${(lead.budgetMin / 100000).toFixed(0)}L` : ''}
                            {lead.budgetMin && lead.budgetMax ? ' – ' : ''}
                            {lead.budgetMax ? `₹${(lead.budgetMax / 100000).toFixed(0)}L` : ''}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <Badge variant="default" className="text-xs">
                            {SOURCE_LABELS[lead.source] ?? lead.source}
                          </Badge>
                          {lead.nextFollowUpDate && (
                            <span className={cn(
                              'text-xs flex items-center gap-0.5',
                              new Date(lead.nextFollowUpDate) < new Date() ? 'text-danger-500' : 'text-muted-foreground',
                            )}>
                              <Clock className="h-3 w-3" />
                              {formatRelative(lead.nextFollowUpDate)}
                            </span>
                          )}
                        </div>

                        {lead.assignedTo && (
                          <p className="mt-1 text-xs text-muted-foreground">{lead.assignedTo.name}</p>
                        )}
                      </div>
                    ))}

                    {stageLeads.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {leads.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No leads found" description="Add your first lead to get started." />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  {['Name', 'Phone', 'Source', 'Stage', 'Budget', 'Score', 'Follow-up', 'Assigned'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead: any) => (
                  <tr
                    key={lead.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => window.location.href = `/broker/leads/${lead.id}`}
                  >
                    <td className="px-4 py-3 font-medium">{lead.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.phone}</td>
                    <td className="px-4 py-3">
                      <Badge>{SOURCE_LABELS[lead.source] ?? lead.source}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={lead.stage === 'BOOKED' ? 'success' : lead.stage === 'LOST' ? 'danger' : 'info'}>
                        {lead.stage.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {lead.budgetMax ? `₹${(lead.budgetMax / 100000).toFixed(0)}L` : '—'}
                    </td>
                    <td className={cn('px-4 py-3 font-bold text-xs', scoreColor(lead.score))}>
                      {lead.score}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {lead.nextFollowUpDate ? formatRelative(lead.nextFollowUpDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {lead.assignedTo?.name ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  )
}
