'use client'

import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Users, Building2, CreditCard, ShieldCheck, AlertTriangle } from 'lucide-react'
import { PageHeader, StatsCard, Section, Badge, Skeleton } from '@/components/shared/data-display'
import { formatCurrency } from '@buildestate/utils'
import { get } from '@/lib/api/client'

const COLORS = ['#0c93ea', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

// Mock chart data for demo — replaced by real API in production
const collectionTrend = [
  { month: 'Jan', collected: 3200000, demand: 4500000 },
  { month: 'Feb', collected: 2800000, demand: 3800000 },
  { month: 'Mar', collected: 4100000, demand: 5200000 },
  { month: 'Apr', collected: 3600000, demand: 4800000 },
  { month: 'May', collected: 5200000, demand: 6100000 },
  { month: 'Jun', collected: 4800000, demand: 5900000 },
]

const userRoleData = [
  { name: 'Buyers', value: 412 },
  { name: 'Brokers', value: 89 },
  { name: 'Builders', value: 34 },
  { name: 'Engineers', value: 56 },
  { name: 'Contractors', value: 78 },
  { name: 'Suppliers', value: 43 },
]

const bookingsByCity = [
  { city: 'Bengaluru', bookings: 142, value: 156000000 },
  { city: 'Hyderabad', bookings: 98, value: 112000000 },
  { city: 'Pune', bookings: 76, value: 89000000 },
  { city: 'Mumbai', bookings: 64, value: 198000000 },
  { city: 'Chennai', bookings: 54, value: 72000000 },
]

const progressData = [
  { status: 'Planning', count: 8 },
  { status: 'Under construction', count: 23 },
  { status: 'Possession', count: 6 },
  { status: 'Completed', count: 12 },
]

function formatTooltipValue(value: number, name: string) {
  if (name === 'collected' || name === 'demand' || name === 'value') {
    return [formatCurrency(value, { compact: true }), name === 'collected' ? 'Collected' : name === 'demand' ? 'Demand' : 'Value']
  }
  return [value, name]
}

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => get<any>('/admin/stats'),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <>
      <PageHeader title="Platform Analytics" description="Real-time platform health and business metrics" />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total users"
          value={isLoading ? '…' : stats?.users?.total?.toLocaleString('en-IN') ?? '—'}
          description={`${stats?.users?.newThisMonth ?? 0} new this month`}
          icon={Users}
          loading={isLoading}
          trend={{ value: 12, label: 'vs last month' }}
        />
        <StatsCard
          title="GMV (all time)"
          value={isLoading ? '…' : formatCurrency(stats?.bookings?.totalValue ?? 0, { compact: true })}
          description={`${stats?.bookings?.thisMonth ?? 0} bookings this month`}
          icon={CreditCard}
          loading={isLoading}
          trend={{ value: 8, label: 'vs last month' }}
        />
        <StatsCard
          title="Total collected"
          value={isLoading ? '…' : formatCurrency(stats?.payments?.totalCollected ?? 0, { compact: true })}
          description={`${formatCurrency(stats?.payments?.thisMonth ?? 0, { compact: true })} this month`}
          icon={TrendingUp}
          loading={isLoading}
        />
        <StatsCard
          title="Pending verifications"
          value={isLoading ? '…' : stats?.properties?.pendingVerifications ?? '—'}
          description="Properties awaiting review"
          icon={ShieldCheck}
          loading={isLoading}
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Collection vs Demand */}
        <Section title="Collection vs Demand (monthly)" description="Last 6 months">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={collectionTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0c93ea" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0c93ea" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={formatTooltipValue} />
              <Legend />
              <Area type="monotone" dataKey="demand" stroke="#22c55e" fill="url(#colorDemand)" name="Demand" />
              <Area type="monotone" dataKey="collected" stroke="#0c93ea" fill="url(#colorCollected)" name="Collected" />
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        {/* User distribution */}
        <Section title="User distribution by role">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={userRoleData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {userRoleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Section>

        {/* Bookings by city */}
        <Section title="Bookings by city" description="Top 5 markets">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bookingsByCity} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="city" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={formatTooltipValue} />
              <Bar dataKey="bookings" fill="#0c93ea" radius={[4, 4, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* Project status */}
        <Section title="Projects by status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={progressData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Projects" />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Alerts */}
      <Section
        title="Platform alerts"
        description="Items requiring attention"
        actions={<Badge variant="danger">{(stats?.operations?.openComplaints ?? 0) + (stats?.operations?.openNCRs ?? 0)} open</Badge>}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <AlertTriangle className="h-5 w-5 text-warning-500 shrink-0" />
            <div>
              <p className="font-medium text-sm">{stats?.properties?.pendingVerifications ?? 0} properties pending verification</p>
              <p className="text-xs text-muted-foreground">Review and approve or reject listings</p>
            </div>
            <a href="/admin/properties" className="ml-auto text-xs text-primary hover:underline shrink-0">Review</a>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <AlertTriangle className="h-5 w-5 text-danger-500 shrink-0" />
            <div>
              <p className="font-medium text-sm">{stats?.operations?.openComplaints ?? 0} open buyer complaints</p>
              <p className="text-xs text-muted-foreground">Some may be approaching SLA deadline</p>
            </div>
            <a href="/admin/complaints" className="ml-auto text-xs text-primary hover:underline shrink-0">Review</a>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <ShieldCheck className="h-5 w-5 text-brand-500 shrink-0" />
            <div>
              <p className="font-medium text-sm">{stats?.operations?.openNCRs ?? 0} open NCR reports</p>
              <p className="text-xs text-muted-foreground">Non-conformances pending resolution</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <Users className="h-5 w-5 text-success-500 shrink-0" />
            <div>
              <p className="font-medium text-sm">{stats?.users?.active ?? 0} active users</p>
              <p className="text-xs text-muted-foreground">of {stats?.users?.total ?? 0} registered accounts</p>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
