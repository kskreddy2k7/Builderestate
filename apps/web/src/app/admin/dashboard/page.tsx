import type { Metadata } from 'next'
import { Building2, IndianRupee, ShieldCheck, Users } from 'lucide-react'
import { PageHeader, StatsCard, Section, EmptyState } from '@/components/shared/data-display'

export const metadata: Metadata = { title: 'Admin Dashboard' }

const stats = [
  { title: 'Total Users', value: '1,247', icon: Users }
  { title: 'Pending Verifications', value: '8', icon: ShieldCheck }
  { title: 'Active Projects', value: '31', icon: Building2 }
  { title: 'Platform GMV (MTD)', value: '₹4.8 Cr', icon: IndianRupee },
]

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Admin Dashboard" description="Platform health and pending verifications" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>
      <Section title="Getting started">
        <EmptyState
          title="Module implementation in progress"
          description="This dashboard will be fully built in the module-by-module implementation phase."
        />
      </Section>
    </>
  )
}
