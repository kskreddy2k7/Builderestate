import { AlertTriangle, CheckSquare, FileBarChart, LayoutDashboard, ShieldCheck, TestTube } from 'lucide-react'
import { DashboardShell } from '@/components/shared/layout/dashboard-shell'
import type { NavItem } from '@/components/shared/layout/dashboard-shell'

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/engineer/dashboard', icon: <LayoutDashboard /> },
  { label: 'Inspections', href: '/engineer/inspections', icon: <CheckSquare /> },
  { label: 'NCR Reports', href: '/engineer/ncr', icon: <AlertTriangle /> },
  { label: 'Approvals', href: '/engineer/approvals', icon: <ShieldCheck /> },
  { label: 'Test Results', href: '/engineer/tests', icon: <TestTube /> },
  { label: 'Reports', href: '/engineer/reports', icon: <FileBarChart /> },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} title="Site Engineer Portal">
      {children}
    </DashboardShell>
  )
}
