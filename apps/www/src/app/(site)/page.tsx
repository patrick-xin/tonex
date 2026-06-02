import { SiteFooter } from './_components/site-footer'
import { SiteHeader } from './_components/site-header'
import { FinalCta } from './_landing/final-cta/final-cta'
import { PreviewSection } from './_landing/preview/preview'
import { BellaSection } from './_landing/product/bella-poster'
import { SeedSection } from './_landing/seed/seed-section'
import { ShaderDots } from './_landing/shader-dot'
import { ShaderHero } from './_landing/shader-hero'
import { SubscribeSection } from './_landing/subscribe-section'

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <ShaderHero />
      <SeedSection />
      <PreviewSection />
      <BellaSection />
      <SubscribeSection />
      <ShaderDots />
      <FinalCta />
      <SiteFooter />
    </>
  )
}
