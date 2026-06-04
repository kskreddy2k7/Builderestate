'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Shield, UserX, UserCheck } from 'lucide-react'
import { get, patch } from '@/lib/api/client'
import { toast } from 'sonner'
import { PageHeader, Badge, Skeleton } from '@/components/shared/data-display'
import { formatTimeAgo, initials } from '@buildestate/utils'

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'danger', ADMIN: 'danger', BUILDER: 'info',
  BROKER: 'success', BUYER: 'default', CONTRACTOR: 'warning',
  SITE_ENGINEER: 'warning', SUPPLIER: 'default', AGENT: 'success',
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, roleFilter, statusFilter],
    queryFn: () => get<any>('/admin/users', {
      page, limit: 20,
      ...(search && { search }),
      ...(roleFilter && { role: roleFilter }),
      ...(statusFilter && { status: statusFilter }),
    }),
    staleTime: 60 * 1000,
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      patch<any>(`/admin/users/${userId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User status updated')
    },
  })

  const users = data?.items ?? []

  return (
    <>
      <PageHeader
        title="User Management"
        description={`${data?.meta?.total ?? 0} total users`}
        breadcrumb={[{ label: 'Admin' }, { label: 'Users' }]}
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search" placeholder="Search name, email, phone…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none">
          <option value="">All roles</option>
          {['BUILDER', 'BROKER', 'BUYER', 'CONTRACTOR', 'SITE_ENGINEER', 'SUPPLIER', 'ADMIN'].map((r) => (
            <option key={r} value={r}>{r.replace('_', ' ')}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none">
          <option value="">All statuses</option>
          {['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  {['User', 'Roles', 'Organisation', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role: string) => (
                          <Badge key={role} variant={ROLE_COLORS[role] as any}>{role.replace('_', ' ')}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {user.orgMemberships?.[0]?.org?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : user.status === 'SUSPENDED' ? 'danger' : 'default'}>
                        {user.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatTimeAgo(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.status !== 'ACTIVE' && (
                          <button
                            onClick={() => updateStatus({ userId: user.id, status: 'ACTIVE' })}
                            className="flex items-center gap-1 rounded-md border border-success-200 bg-success-50 px-2 py-1 text-xs font-medium text-success-700 hover:bg-success-100 dark:bg-success-950 dark:text-success-400"
                          >
                            <UserCheck className="h-3 w-3" /> Activate
                          </button>
                        )}
                        {user.status === 'ACTIVE' && (
                          <button
                            onClick={() => updateStatus({ userId: user.id, status: 'SUSPENDED' })}
                            className="flex items-center gap-1 rounded-md border border-danger-200 bg-danger-50 px-2 py-1 text-xs font-medium text-danger-700 hover:bg-danger-100 dark:bg-danger-950 dark:text-danger-400"
                          >
                            <UserX className="h-3 w-3" /> Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.meta.total)} of {data.meta.total}
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="rounded-md border border-border px-3 py-1 text-xs disabled:opacity-40 hover:bg-accent">Previous</button>
              <button disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}
                className="rounded-md border border-border px-3 py-1 text-xs disabled:opacity-40 hover:bg-accent">Next</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
