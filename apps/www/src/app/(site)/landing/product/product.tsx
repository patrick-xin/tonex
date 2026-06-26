import { SectionHeader } from '../section-header'
import { ProductTabs } from './product-tabs'

export function ProductSection() {
  return (
    <section className="flex min-h-dvh w-full flex-col items-center px-4 md:px-12 lg:px-16 py-12 max-w-7xl mx-auto">
      <SectionHeader
        heading="One identity, on every surface"
        description="Send the same theme to your products. No drift between channels, because none of it was built twice."
      />
      <ProductTabs />
    </section>
  )
}
