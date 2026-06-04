import { BarChart3, Building2, HardHat, LayoutDashboard, Shield, Users } from 'lucide-react'
import { DashboardShell } from '@/components/shared/layout/dashboard-shell'
import type { NavItem } from '@/components/shared/layout/dashboard-shell'

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard /> },
  { label: 'Users', href: '/admin/users', icon: <Users /> },
  { label: 'Properties', href: '/admin/properties', icon: <Building2 /> },
  { label: 'Projects', href: '/admin/projects', icon: <HardHat /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 /> },
  { label: 'Audit Logs', href: '/admin/audit', icon: <Shield /> },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} title="Admin Portal">
      {children}
    </DashboardShell>
  )
}
