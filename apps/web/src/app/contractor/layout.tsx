import { ClipboardList, LayoutDashboard, Package, Receipt, Users } from 'lucide-react'
import { DashboardShell } from '@/components/shared/layout/dashboard-shell'
import type { NavItem } from '@/components/shared/layout/dashboard-shell'

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/contractor/dashboard', icon: <LayoutDashboard /> },
  { label: 'Work Orders', href: '/contractor/work-orders', icon: <ClipboardList /> },
  { label: 'Labour Attendance', href: '/contractor/attendance', icon: <Users /> },
  { label: 'Material Indents', href: '/contractor/materials', icon: <Package /> },
  { label: 'RA Bills', href: '/contractor/bills', icon: <Receipt /> },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} title="Contractor Portal">
      {children}
    </DashboardShell>
  )
}
