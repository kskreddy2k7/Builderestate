'use client'

import { PageHeader, Section } from '@/components/shared/data-display'

export default function BuyerUpdatesPage() {
  return (
    <>
      <PageHeader title="Construction Updates" description="Latest progress from your project sites" />

      <Section>
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-sm">No recent construction updates available.</p>
        </div>
      </Section>
    </>
  )
}
