import { SectionHeader } from '../section-header'
import { ProductTabs } from './product-tabs'

export function ProductSection() {
  return (
    <section className="flex min-h-dvh w-full flex-col items-center bg-surface px-6 py-12">
      <SectionHeader
        heading="One identity, on every surface"
        description="Send the same theme to your products. No patchwork, no drift between channels, because none of it was built twice."
      />
      <ProductTabs />
    </section>
  )
}
