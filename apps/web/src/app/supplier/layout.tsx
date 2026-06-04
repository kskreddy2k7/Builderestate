import { FileQuestion, LayoutDashboard, Package, ShoppingCart, Truck } from 'lucide-react'
import { DashboardShell } from '@/components/shared/layout/dashboard-shell'
import type { NavItem } from '@/components/shared/layout/dashboard-shell'

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/supplier/dashboard', icon: <LayoutDashboard /> },
  { label: 'Products', href: '/supplier/products', icon: <Package /> },
  { label: 'Orders', href: '/supplier/orders', icon: <ShoppingCart /> },
  { label: 'RFQ Requests', href: '/supplier/rfq', icon: <FileQuestion /> },
  { label: 'Deliveries', href: '/supplier/deliveries', icon: <Truck /> },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} title="Supplier Portal">
      {children}
    </DashboardShell>
  )
}
