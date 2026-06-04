'use client'
import { useCommissions } from '@/hooks/use-crm'
import { PageHeader, Badge, Skeleton, EmptyState, Section } from '@/components/shared/data-display'
import { formatCurrency, formatDate } from '@buildestate/utils'
import { IndianRupee } from 'lucide-react'

const STATUS_VARIANT: Record<string, any> = {
  PENDING: 'warning', APPROVED: 'info', INVOICED: 'info',
  PAID: 'success', ON_HOLD: 'default', CANCELLED: 'danger',
}

export default function CommissionsPage() {
  const { data, isLoading } = useCommissions()
  const commissions = data?.items ?? []
  const summary = data?.summary ?? {}

  return (
    <>
      <PageHeader title="Commissions" description="Your commission earnings and payout status" />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {[
          { label: 'Total earned', value: formatCurrency(summary.total ?? 0, { compact: true }) },
          { label: 'Net payable', value: formatCurrency(summary.netPayable ?? 0, { compact: true }) },
          { label: 'Total bookings', value: summary.count ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-primary">{s.value}</p>
          </div>
        ))}
      </div>
      <Section title="Commission records">
        {isLoading ? <Skeleton className="h-64 w-full" /> : commissions.length === 0 ? (
          <EmptyState icon={<IndianRupee />} title="No commissions yet" description="Commissions are created when a booking is made." />
        ) : (
          <div className="space-y-3">
            {commissions.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Unit {c.booking?.unit?.unitNumber} — {c.booking?.unit?.bhkType}</p>
                  <p className="text-xs text-muted-foreground">Buyer: {c.booking?.buyer?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(Number(c.netPayable), { compact: true })}</p>
                  <p className="text-xs text-muted-foreground">{c.percentage}% · GST incl.</p>
                  <Badge variant={STATUS_VARIANT[c.status] ?? 'default'}>{c.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  )
}
