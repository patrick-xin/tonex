import { SiteFooter } from './_components/site-footer'
import { SiteHeader } from './_components/site-header'
import { ExportSection } from './landing/export/export-section'
import { Features } from './landing/features/features'
import { FinalCta } from './landing/final-cta/final-cta'
import { ShaderHero } from './landing/hero/shader-hero'
import { IntergrationSection } from './landing/intergration/intergration'
import { PreviewSection } from './landing/preview/preview'
import { ProductSection } from './landing/product/product'
import { SeedSection } from './landing/seed/seed-section'

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <ShaderHero />
      <SeedSection />
      <IntergrationSection />
      <PreviewSection />
      <ProductSection />
      <ExportSection />
      <Features />
      <FinalCta />
      <SiteFooter />
    </>
  )
}
