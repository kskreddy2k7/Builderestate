'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin, BedDouble, Bath, Maximize2, Shield, Bookmark } from 'lucide-react'
import { cn, formatCurrency, formatArea } from '@buildestate/utils'
import { Badge } from '@/components/shared/data-display'
import { useToggleSave } from '@/hooks/use-properties'
import { useAuth } from '@/hooks/use-auth'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    slug: string
    type: string
    transactionType: string
    price: number
    area: number
    pricePerSqft?: number
    bhkType?: string
    bathrooms?: number
    city: string
    state: string
    facing?: string
    furnishingStatus?: string
    reraStatus?: string
    verificationStatus: string
    isFeatured?: boolean
    media?: { url: string; isPrimary: boolean }[]
    listedBy?: { name: string; avatar?: string }
    org?: { name: string; logo?: string }
  }
  variant?: 'grid' | 'list'
  className?: string
}

export function PropertyCard({ property, variant = 'grid', className }: PropertyCardProps) {
  const { isAuthenticated } = useAuth()
  const { mutate: toggleSave } = useToggleSave()

  const primaryImage = property.media?.find((m) => m.isPrimary)?.url
    ?? property.media?.[0]?.url

  const typeLabels: Record<string, string> = {
    APARTMENT: 'Apartment', HOUSE: 'House', LAND: 'Land',
    VILLA: 'Villa', PLOT: 'Plot', COMMERCIAL: 'Commercial',
  }

  const txnLabels: Record<string, { label: string; variant: 'info' | 'success' | 'warning' }> = {
    NEW_BOOKING: { label: 'New launch', variant: 'info' },
    RESALE: { label: 'Resale', variant: 'warning' },
    RENTAL: { label: 'Rental', variant: 'success' },
  }

  const txn = txnLabels[property.transactionType] ?? { label: property.transactionType, variant: 'default' }

  if (variant === 'list') {
    return (
      <Link href={`/marketplace/${property.slug}`} className={cn(
        'group flex gap-4 rounded-2xl border border-border/50 glass-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]',
        className,
      )}>
        {/* Image */}
        <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg bg-muted">
          {primaryImage ? (
            <Image src={primaryImage} alt={property.title} fill className="object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Maximize2 className="h-8 w-8" />
            </div>
          )}
          <div className="absolute left-2 top-2">
            <Badge variant={txn.variant as any}>{txn.label}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
              <span className="shrink-0 text-lg font-semibold text-primary">
                {formatCurrency(property.price, { compact: true })}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />{property.city}, {property.state}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            {property.bhkType && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{property.bhkType}</span>}
            {property.bathrooms && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.bathrooms} Bath</span>}
            <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{formatArea(Number(property.area))}</span>
            {property.pricePerSqft && <span>{formatCurrency(Number(property.pricePerSqft))}/sqft</span>}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border border-border/50 glass-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
      className,
    )}>
      {/* Image */}
      <Link href={`/marketplace/${property.slug}`}>
        <div className="relative h-48 overflow-hidden bg-muted">
          {primaryImage ? (
            <Image src={primaryImage} alt={property.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Maximize2 className="h-10 w-10" />
            </div>
          )}
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
          <div className="absolute inset-x-3 top-3 flex items-center justify-between z-10">
            <Badge variant={txn.variant as any} className="backdrop-blur-md bg-background/80 shadow-sm border-white/20">{txn.label}</Badge>
            {property.reraStatus === 'VERIFIED' && (
              <div className="flex items-center gap-1 rounded-full bg-success-500/20 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold tracking-wide text-success-700 dark:text-success-400 border border-success-500/30 shadow-sm">
                <Shield className="h-3 w-3" />RERA
              </div>
            )}
          </div>
          {property.isFeatured && (
            <div className="absolute bottom-3 left-3 rounded-full bg-gradient-to-r from-accent to-accent/80 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-accent-foreground shadow-md z-10">
              FEATURED
            </div>
          )}
        </div>
      </Link>

      {/* Save button */}
      {isAuthenticated && (
        <button
          onClick={(e) => { e.preventDefault(); toggleSave(property.id) }}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 hover:bg-white hover:scale-110 hover:text-danger-500 text-muted-foreground"
          aria-label="Save property"
        >
          <Heart className="h-4 w-4" />
        </button>
      )}

      {/* Content */}
      <Link href={`/marketplace/${property.slug}`} className="block p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {property.title}
          </h3>
        </div>

        <p className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {property.city}, {property.state}
        </p>

        {/* Specs */}
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {property.bhkType && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3" />{property.bhkType}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" />{property.bathrooms} Bath
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />{formatArea(Number(property.area))}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(property.price, { compact: true })}
            </p>
            {property.pricePerSqft && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Number(property.pricePerSqft))}/sqft
              </p>
            )}
          </div>
          {property.org && (
            <p className="max-w-[120px] truncate text-xs text-muted-foreground">
              {property.org.name}
            </p>
          )}
        </div>
      </Link>
    </div>
  )
}
