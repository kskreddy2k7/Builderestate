'use client'

import Link from 'next/link'
import { PageHeader, Section } from '@/components/shared/data-display'

export default function BuyerPropertiesPage() {
  return (
    <>
      <PageHeader title="My Properties" description="Manage your purchased properties and bookings" />

      <Section>
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-sm">You have no active properties yet.</p>
          <Link href="/marketplace" className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Browse marketplace
          </Link>
        </div>
      </Section>
    </>
  )
}
