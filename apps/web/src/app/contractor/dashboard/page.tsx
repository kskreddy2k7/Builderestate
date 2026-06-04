'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ClipboardList, Users, Receipt, Package } from 'lucide-react'
import { get } from '@/lib/api/client'
import { PageHeader, StatsCard, Section, Badge, Skeleton } from '@/components/shared/data-display'
import { formatCurrency, formatDate } from '@buildestate/utils'

export default function ContractorDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['contractor', 'dashboard'],
    queryFn: () => get<any>('/contractor/dashboard'),
    staleTime: 2 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </>
    )
  }

  const stats = data?.stats ?? {}
  const workOrders = data?.recentWorkOrders ?? []

  return (
    <>
      <PageHeader title="Contractor Dashboard" description={data?.contractor?.companyName ?? ''} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard title="Active work orders" value={stats.activeWorkOrders ?? 0} icon={ClipboardList} />
        <StatsCard title="Pending bills" value={stats.pendingBills ?? 0} icon={Receipt} />
        <StatsCard title="Open indents" value={stats.openIndents ?? 0} icon={Package} />
        <StatsCard title="Attendance today" value={stats.attendanceMarked ? 'Marked' : 'Pending'} icon={Users} />
      </div>
      <Section title="Recent work orders" actions={<Link href="/contractor/work-orders" className="text-xs text-primary hover:underline">View all</Link>}>
        <div className="space-y-3">
          {workOrders.map((wo: any) => (
            <Link key={wo.id} href={`/contractor/work-orders`}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 hover:border-primary/40 transition-colors">
              <div>
                <p className="font-medium text-sm">{wo.title}</p>
                <p className="text-xs text-muted-foreground">{wo.project?.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-primary">{formatCurrency(Number(wo.contractValue), { compact: true })}</p>
                <p className="text-xs text-muted-foreground">Due {formatDate(wo.endDate)}</p>
              </div>
            </Link>
          ))}
          {workOrders.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No work orders yet</p>}
        </div>
      </Section>
    </>
  )
}
