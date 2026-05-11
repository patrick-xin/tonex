import type { Metadata } from 'next'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    <ScrollArea noScrollBar gradientScrollFade>
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
    </ScrollArea>
  )
}
