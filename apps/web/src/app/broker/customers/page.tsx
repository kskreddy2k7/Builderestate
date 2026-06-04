'use client'
import { useState } from 'react'
import { useCustomers, useCreateCustomer } from '@/hooks/use-crm'
import { PageHeader, Badge, Skeleton, EmptyState } from '@/components/shared/data-display'
import { Plus, Search, Users } from 'lucide-react'
import { initials, formatTimeAgo } from '@buildestate/utils'

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const { data, isLoading } = useCustomers(search ? { search } : {})
  const customers = data?.items ?? []

  return (
    <>
      <PageHeader title="Customers" description={`${data?.meta?.total ?? 0} customers`}
        actions={<button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" />Add customer</button>} />
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="search" placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>
      {isLoading ? <Skeleton className="h-64 w-full rounded-xl" /> : customers.length === 0 ? (
        <EmptyState icon={<Users />} title="No customers found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c: any) => (
            <div key={c.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors cursor-pointer">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(c.name)}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.phone}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                {c.tags?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
