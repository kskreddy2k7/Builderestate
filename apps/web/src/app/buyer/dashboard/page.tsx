'use client'

import Link from 'next/link'
import { Home, CreditCard, HardHat, MessageSquare, ChevronRight } from 'lucide-react'
import { useBuyerDashboard } from '@/hooks/use-buyer'
import { PageHeader, StatsCard, Section, ProgressBar, Badge, Skeleton } from '@/components/shared/data-display'
import { formatCurrency, formatDate, formatTimeAgo, cn } from '@buildestate/utils'

export default function BuyerDashboardPage() {
  const { data, isLoading } = useBuyerDashboard()

  if (isLoading) {
    return (
      <>
        <PageHeader title="My Dashboard" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </>
    )
  }

  const stats = data?.stats ?? {}
  const bookings = data?.bookings ?? []

  return (
    <>
      <PageHeader title="My Dashboard" description="Your property purchase and construction status" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard title="My bookings" value={stats.totalBookings ?? 0} icon={Home} description="Active properties" />
        <StatsCard title="Total paid" value={formatCurrency(stats.totalPaid ?? 0, { compact: true })} icon={CreditCard} />
        <StatsCard title="Pending payments" value={stats.pendingPayments ?? 0} icon={HardHat} />
        <StatsCard title="Open complaints" value={stats.openComplaints ?? 0} icon={MessageSquare} />
      </div>

      {bookings.length === 0 ? (
        <Section title="My properties">
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm">You have no active bookings yet.</p>
            <Link href="/marketplace" className="mt-4 inline-block text-sm text-primary hover:underline">Browse properties →</Link>
          </div>
        </Section>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => {
            const unit = booking.unit
            const project = unit?.floor?.tower?.project
            const milestones = project?.milestones ?? []
            const completed = milestones.filter((m: any) => m.status === 'COMPLETED').length
            const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0
            const nextPayment = booking.paymentSchedule?.[0]
            const isOverdue = nextPayment && new Date(nextPayment.dueDate) < new Date()
            return (
              <div key={booking.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                  <div>
                    <p className="font-semibold">{project?.name ?? 'Property'}</p>
                    <p className="text-sm text-muted-foreground">Unit {unit?.unitNumber} · {unit?.bhkType} · {unit?.area} sqft</p>
                  </div>
                  <Badge variant={booking.status === 'REGISTERED' ? 'success' : 'warning'}>
                    {booking.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-3">
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Construction progress</p>
                    <ProgressBar value={progress} showValue size="sm" />
                    <p className="mt-1 text-xs text-muted-foreground">{completed} of {milestones.length} milestones done</p>
                    <Link href={`/buyer/bookings/${booking.id}`} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      View timeline <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Next payment</p>
                    {nextPayment ? (
                      <>
                        <p className="text-lg font-bold text-primary">{formatCurrency(Number(nextPayment.amount))}</p>
                        <p className={cn('text-xs', isOverdue ? 'text-danger-500 font-medium' : 'text-muted-foreground')}>
                          {isOverdue ? 'Overdue · ' : 'Due '}{formatDate(nextPayment.dueDate)}
                        </p>
                        <Link href="/buyer/payments" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          Pay now <ChevronRight className="h-3 w-3" />
                        </Link>
                      </>
                    ) : (
                      <p className="text-xs text-success-600 font-medium">All payments complete</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Latest site update</p>
                    {project?.progressUpdates?.[0] ? (
                      <>
                        <p className="text-xs font-medium line-clamp-2">{project.progressUpdates[0].title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{formatTimeAgo(project.progressUpdates[0].createdAt)}</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No updates yet</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
