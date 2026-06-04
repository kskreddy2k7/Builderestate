'use client'

import { useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from 'lucide-react'
import { useProperties } from '@/hooks/use-properties'
import { PropertyCard } from '@/components/marketplace/property-card'
import { Skeleton, EmptyState, Badge } from '@/components/shared/data-display'
import { cn, formatCurrency } from '@buildestate/utils'

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'PLOT', 'LAND', 'COMMERCIAL']
const BHK_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK', '5+BHK']
const PRICE_RANGES = [
  { label: 'Under ₹50L', min: 0, max: 5000000 },
  { label: '₹50L–1Cr', min: 5000000, max: 10000000 },
  { label: '₹1Cr–2Cr', min: 10000000, max: 20000000 },
  { label: '₹2Cr–5Cr', min: 20000000, max: 50000000 },
  { label: 'Above ₹5Cr', min: 50000000, max: undefined },
]

export default function PropertiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const params = {
    search: searchParams.get('search') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    transactionType: searchParams.get('transactionType') ?? undefined,
    city: searchParams.get('city') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    bhkType: searchParams.get('bhkType') ?? undefined,
    reraVerified: searchParams.get('reraVerified') === 'true',
    page: Number(searchParams.get('page') ?? 1),
    sortBy: searchParams.get('sortBy') ?? 'createdAt',
    sortOrder: (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc',
  }

  const { data, isLoading } = useProperties(params)

  const updateParam = useCallback((key: string, value: string | undefined) => {
    const current = new URLSearchParams(searchParams.toString())
    if (value) { current.set(key, value); current.delete('page') }
    else current.delete(key)
    router.push(`/marketplace/properties?${current.toString()}`)
  }, [searchParams, router])

  const activeFilters = [
    params.type && { key: 'type', label: params.type },
    params.city && { key: 'city', label: params.city },
    params.bhkType && { key: 'bhkType', label: params.bhkType },
    params.reraVerified && { key: 'reraVerified', label: 'RERA verified' },
    (params.minPrice || params.maxPrice) && { key: 'price', label: `₹${params.minPrice ? formatCurrency(params.minPrice, { compact: true }) : '0'}–${params.maxPrice ? formatCurrency(params.maxPrice, { compact: true }) : '∞'}` },
  ].filter(Boolean) as { key: string; label: string }[]

  return (
    <div className="min-h-screen bg-background">
      {/* Search bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur px-4 py-3">
        <div className="container mx-auto flex items-center gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              defaultValue={params.search}
              placeholder="Search city, locality, project…"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value || undefined)
              }}
            />
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors',
              showFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent',
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeFilters.length}
              </span>
            )}
          </button>

          <div className="flex items-center rounded-lg border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('flex h-10 w-10 items-center justify-center rounded-l-lg transition-colors', viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('flex h-10 w-10 items-center justify-center rounded-r-lg transition-colors', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="container mx-auto mt-3 flex flex-wrap gap-3">
            {/* Property type */}
            <div className="flex flex-wrap gap-1.5">
              <span className="self-center text-xs font-medium text-muted-foreground">Type:</span>
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => updateParam('type', params.type === type ? undefined : type)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    params.type === type ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary',
                  )}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* BHK */}
            <div className="flex flex-wrap gap-1.5">
              <span className="self-center text-xs font-medium text-muted-foreground">BHK:</span>
              {BHK_TYPES.map((bhk) => (
                <button
                  key={bhk}
                  onClick={() => updateParam('bhkType', params.bhkType === bhk ? undefined : bhk)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    params.bhkType === bhk ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary',
                  )}
                >
                  {bhk}
                </button>
              ))}
            </div>

            {/* RERA */}
            <button
              onClick={() => updateParam('reraVerified', params.reraVerified ? undefined : 'true')}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                params.reraVerified ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary',
              )}
            >
              RERA verified only
            </button>
          </div>
        )}

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="container mx-auto mt-2 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => {
                  if (filter.key === 'price') { updateParam('minPrice', undefined); updateParam('maxPrice', undefined) }
                  else updateParam(filter.key, undefined)
                }}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {filter.label} <X className="h-3 w-3" />
              </button>
            ))}
            <button
              onClick={() => router.push('/marketplace/properties')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {/* Sort bar */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? '…' : `${data?.meta?.total?.toLocaleString('en-IN') ?? 0} properties found`}
          </p>
          <select
            value={`${params.sortBy}-${params.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              updateParam('sortBy', sortBy)
              updateParam('sortOrder', sortOrder)
            }}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="area-desc">Area: largest first</option>
            <option value="viewCount-desc">Most popular</option>
          </select>
        </div>

        {/* Grid / List */}
        {isLoading ? (
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1',
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.items?.length === 0 ? (
          <EmptyState
            title="No properties found"
            description="Try adjusting your filters or search for a different location."
            action={
              <button onClick={() => router.push('/marketplace/properties')} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                Clear filters
              </button>
            }
          />
        ) : (
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1',
          )}>
            {data?.items?.map((property: any) => (
              <PropertyCard key={property.id} property={property} variant={viewMode} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              disabled={!data.meta.hasPreviousPage}
              onClick={() => updateParam('page', String(params.page - 1))}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40 hover:bg-accent"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {data.meta.page} of {data.meta.totalPages}
            </span>
            <button
              disabled={!data.meta.hasNextPage}
              onClick={() => updateParam('page', String(params.page + 1))}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40 hover:bg-accent"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
