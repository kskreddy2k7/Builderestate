import { CreditCard, FileText, HardHat, Home, LayoutDashboard, MessageSquare } from 'lucide-react'
import { DashboardShell } from '@/components/shared/layout/dashboard-shell'
import type { NavItem } from '@/components/shared/layout/dashboard-shell'

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/buyer/dashboard', icon: <LayoutDashboard /> },
  { label: 'My Properties', href: '/buyer/properties', icon: <Home /> },
  { label: 'Payments', href: '/buyer/payments', icon: <CreditCard /> },
  { label: 'Documents', href: '/buyer/documents', icon: <FileText /> },
  { label: 'Construction Updates', href: '/buyer/updates', icon: <HardHat /> },
  { label: 'Complaints', href: '/buyer/complaints', icon: <MessageSquare /> },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} title="Buyer Portal">
      {children}
    </DashboardShell>
  )
}
