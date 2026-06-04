'use client'
import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api/client'
import { PageHeader, StatsCard, Section, Badge, Skeleton } from '@/components/shared/data-display'
import { Package, ShoppingCart, Truck, Star } from 'lucide-react'
import { formatCurrency } from '@buildestate/utils'

export default function SupplierDashboardPage() {
  const { data: pos } = useQuery({
    queryKey: ['supplier', 'pos'],
    queryFn: () => get<any>('/materials/purchase-orders'),
    staleTime: 2 * 60 * 1000,
  })

  const orders = pos?.items ?? []
  const activeOrders = orders.filter((o: any) => !['COMPLETED', 'CANCELLED'].includes(o.status))

  return (
    <>
      <PageHeader title="Supplier Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard title="Active orders" value={activeOrders.length} icon={ShoppingCart} />
        <StatsCard title="Total orders" value={orders.length} icon={Package} />
        <StatsCard title="Deliveries" value={orders.filter((o: any) => o.status === 'DELIVERED').length} icon={Truck} />
        <StatsCard title="Rating" value="4.7 / 5" icon={Star} />
      </div>
      <Section title="Recent orders">
        <div className="space-y-3">
          {orders.slice(0, 5).map((po: any) => (
            <div key={po.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">{po.poNumber}</p>
                <p className="text-xs text-muted-foreground">{po.supplier?.companyName}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-primary">{formatCurrency(Number(po.finalAmount), { compact: true })}</p>
                <Badge>{po.status.replace('_', ' ')}</Badge>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No orders yet</p>}
        </div>
      </Section>
    </>
  )
}
