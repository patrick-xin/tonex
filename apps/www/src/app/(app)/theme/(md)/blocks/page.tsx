import type { Metadata } from 'next'
import {
  ContributionHistory,
  Faq,
  PayoutThreshold,
  Preferences,
  ProjectQuoteForm,
  ReleaseCatalog,
} from './_components'

export const metadata: Metadata = {
  title: 'Blocks | Tonex',
  description: 'Component blocks',
}

export default function BlocksPage() {
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
