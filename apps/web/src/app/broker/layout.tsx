import { LayoutDashboard, Users, UserCheck, Calendar, IndianRupee, BarChart3, MessageSquare, Target } from 'lucide-react'
import { DashboardShell } from '@/components/shared/layout/dashboard-shell'
import type { NavItem } from '@/components/shared/layout/dashboard-shell'

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/broker/dashboard', icon: <LayoutDashboard /> },
  { label: 'Leads', href: '/broker/leads', icon: <Target />, badge: 12 },
  { label: 'Customers', href: '/broker/customers', icon: <UserCheck /> },
  { label: 'Site Visits', href: '/broker/calendar', icon: <Calendar /> },
  { label: 'Commissions', href: '/broker/commissions', icon: <IndianRupee /> },
  { label: 'Team', href: '/broker/team', icon: <Users /> },
  { label: 'Analytics', href: '/broker/analytics', icon: <BarChart3 /> },
]

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell navItems={navItems} title="Broker CRM">
      {children}
    </DashboardShell>
  )
}
