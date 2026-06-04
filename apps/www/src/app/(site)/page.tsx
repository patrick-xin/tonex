import { SiteFooter } from './_components/site-footer'
import { SiteHeader } from './_components/site-header'
import { ExportSection } from './_landing/export/export-section'
import { Features } from './_landing/features/features'
import { FinalCta } from './_landing/final-cta/final-cta'
import { ShaderHero } from './_landing/hero/shader-hero'
import { PreviewSection } from './_landing/preview/preview'
import { ProductSection } from './_landing/product/product'
import { SeedSection } from './_landing/seed/seed-section'

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <ShaderHero />
      <SeedSection />
      <PreviewSection />
      <ProductSection />
      <ExportSection />
      <Features />
      <FinalCta />
      <SiteFooter />
    </>
  )
}
