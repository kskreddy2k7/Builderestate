import {
  LayoutDashboard, Building2, Layers, BarChart3,
  FileText, HardHat, Wallet, Package, Users,
} from 'lucide-react'
import { DashboardShell } from '@/components/shared/layout/dashboard-shell'
import type { NavItem } from '@/components/shared/layout/dashboard-shell'

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/builder/dashboard', icon: <LayoutDashboard /> },
  {
    label: 'Projects',
    href: '/builder/projects',
    icon: <Building2 />,
    children: [
      { label: 'All Projects', href: '/builder/projects', icon: <Building2 /> },
      { label: 'New Project', href: '/builder/projects/new', icon: <Building2 /> },
    ],
  },
  { label: 'ERP — Towers & Units', href: '/builder/erp/towers', icon: <Layers /> },
  { label: 'Inventory', href: '/builder/erp/inventory', icon: <Package /> },
  { label: 'Finance', href: '/builder/erp/finance', icon: <Wallet /> },
  { label: 'Reports', href: '/builder/projects', icon: <FileText /> },
  { label: 'Contractors', href: '/builder/contractors', icon: <HardHat /> },
  { label: 'Analytics', href: '/builder/analytics', icon: <BarChart3 /> },
]

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} title="Builder Portal">
      {children}
    </DashboardShell>
  )
}
