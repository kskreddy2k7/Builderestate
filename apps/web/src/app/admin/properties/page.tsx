'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, X, Check, Eye, MapPin, Home } from 'lucide-react'
import { get, post } from '@/lib/api/client'
import { toast } from 'sonner'
import { PageHeader, Badge, Skeleton, EmptyState } from '@/components/shared/data-display'
import { formatCurrency, formatTimeAgo } from '@buildestate/utils'

export default function AdminPropertiesPage() {
  const [selected, setSelected] = useState<any | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'verification-queue'],
    queryFn: () => get<any>('/admin/verification-queue?type=property'),
    staleTime: 60 * 1000,
  })

  const { mutate: verify } = useMutation({
    mutationFn: ({ id, decision, reason }: { id: string; decision: string; reason?: string }) =>
      post<any>(`/marketplace/${id}/verify`, { decision, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verification-queue'] })
      toast.success('Property decision recorded')
      setSelected(null)
    },
  })

  const properties = data?.properties?.items ?? []

  return (
    <>
      <PageHeader
        title="Property Verification"
        description={`${data?.properties?.meta?.total ?? 0} listings pending review`}
        breadcrumb={[{ label: 'Admin' }, { label: 'Properties' }]}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState icon={<Shield />} title="All clear!" description="No properties pending verification." />
      ) : (
        <div className="space-y-3">
          {properties.map((property: any) => (
            <div key={property.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {property.media?.[0] ? (
                    <img src={property.media[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Home className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold line-clamp-1">{property.title}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />{property.city}, {property.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge>{property.type}</Badge>
                      <Badge variant="warning">Pending review</Badge>
                    </div>
                  </div>
                  <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">{formatCurrency(Number(property.price), { compact: true })}</span>
                    <span>{Number(property.area).toLocaleString()} sqft</span>
                    {property.bhkType && <span>{property.bhkType}</span>}
                    {property.reraNumber && <span>RERA: {property.reraNumber}</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Listed by {property.listedBy?.name} · {formatTimeAgo(property.updatedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  <a
                    href={`/marketplace/${property.slug}`}
                    target="_blank"
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs hover:bg-accent"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </a>
                  <button
                    onClick={() => setSelected({ ...property, action: 'reject' })}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-3 text-xs text-danger-700 hover:bg-danger-100 dark:bg-danger-950/50 dark:text-danger-400"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => verify({ id: property.id, decision: 'VERIFIED' })}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-success-500 px-3 text-xs font-medium text-white hover:bg-success-600"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-elevated">
            <h3 className="mb-1 font-semibold">Reject listing</h3>
            <p className="mb-4 text-sm text-muted-foreground">"{selected.title}"</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (required — sent to lister)"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 h-10 rounded-lg border border-border text-sm hover:bg-accent">
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim()}
                onClick={() => verify({ id: selected.id, decision: 'REJECTED', reason: rejectReason })}
                className="flex-1 h-10 rounded-lg bg-danger-500 text-sm font-medium text-white hover:bg-danger-600 disabled:opacity-50"
              >
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
