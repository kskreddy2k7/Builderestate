'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import { PageHeader, Section, EmptyState } from '@/components/shared/data-display'

export default function BuyerPropertiesPage() {
  return (
    <>
      <PageHeader title="My Properties" description="Manage your purchased properties and bookings" />

      <Section>
        <EmptyState
          icon={<Home className="h-12 w-12 text-primary/30" />}
          title="No active properties"
          description="You haven't purchased or booked any properties yet. Once you do, they will appear here."
          action={
            <Link href="/marketplace" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/30">
              Browse marketplace
            </Link>
          }
        />
      </Section>
    </>
  )
}
