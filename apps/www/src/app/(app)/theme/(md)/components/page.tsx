import type { Metadata } from 'next'
import { ContributionHistory } from '@/components/demos/blocks/contribution-history'
import { Faq } from '@/components/demos/blocks/faq'
import { ProjectQuoteForm } from '@/components/demos/blocks/form-integration'
import { PayoutThreshold } from '@/components/demos/blocks/payout-threshold'
import { Preferences } from '@/components/demos/blocks/preferences'
import { ReleaseCatalog } from '@/components/demos/blocks/release-catalog'

export const metadata: Metadata = {
  title: 'Color Roles | Tonex',
  description: 'Material Design 3 color roles',
}

export default function RolesPage() {
  return (
    <div className="overflow-auto p-4 sm:p-6 mask-[linear-gradient(to_bottom,transparent,black_1.6rem,black_calc(100%-1.2rem),transparent)] no-scrollbar">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <ContributionHistory />
          <PayoutThreshold />
          <Preferences />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <ReleaseCatalog className="col-span-2" />
          <Faq />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProjectQuoteForm />
        </div>
      </div>
    </div>
  )
}
