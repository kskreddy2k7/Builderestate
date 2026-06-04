'use client'

import { useQuery } from '@tanstack/react-query'
import { CheckSquare, AlertTriangle, ShieldCheck, TestTube } from 'lucide-react'
import { get } from '@/lib/api/client'
import { PageHeader, StatsCard, Section, Badge, Skeleton, EmptyState } from '@/components/shared/data-display'
import { formatDate } from '@buildestate/utils'

export default function EngineerDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['engineer', 'dashboard'],
    queryFn: () => get<any>('/engineer/dashboard'),
    staleTime: 2 * 60 * 1000,
  })

  const todayInspections = data?.todayInspections ?? []

  return (
    <>
      <PageHeader title="Site Engineer Dashboard" />
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard title="Inspections today" value={data?.stats?.todayCount ?? 0} icon={CheckSquare} />
            <StatsCard title="Open NCRs" value={data?.openNCRs ?? 0} icon={AlertTriangle} />
            <StatsCard title="Pending approvals" value={data?.pendingApprovals ?? 0} icon={ShieldCheck} />
            <StatsCard title="Recent tests" value={data?.recentTests?.length ?? 0} icon={TestTube} />
          </div>
          <Section title={`Inspections — ${formatDate(new Date())}`}>
            {todayInspections.length === 0 ? (
              <EmptyState icon={<CheckSquare />} title="No inspections scheduled today" />
            ) : (
              <div className="space-y-3">
                {todayInspections.map((ins: any) => (
                  <div key={ins.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{ins.activity}</p>
                      <p className="text-xs text-muted-foreground">{ins.location} · {ins.project?.name}</p>
                    </div>
                    <Badge variant={ins.status === 'PASS' ? 'success' : ins.status === 'FAIL' ? 'danger' : 'warning'}>
                      {ins.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </>
  )
}
