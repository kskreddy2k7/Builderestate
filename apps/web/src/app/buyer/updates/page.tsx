'use client'

import { HardHat } from 'lucide-react'
import { PageHeader, Section, EmptyState } from '@/components/shared/data-display'

export default function BuyerUpdatesPage() {
  return (
    <>
      <PageHeader title="Construction Updates" description="Latest progress from your project sites" />

      <Section>
        <EmptyState
          icon={<HardHat className="h-12 w-12 text-primary/30" />}
          title="No construction updates yet"
          description="Once your builder posts progress updates, site photos, or milestone achievements, they will appear here."
        />
      </Section>
    </>
  )
}
