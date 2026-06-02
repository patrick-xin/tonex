import { SiteFooter } from './_components/site-footer'
import { SiteHeader } from './_components/site-header'
import { BellaSection } from './_landing/bella-poster'
import { ShadcnShowcaseSection } from './_landing/shadcn-showcase'
import { ShaderHero } from './_landing/shader-hero'
import { SubscribeSection } from './_landing/subscribe-section'

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <ShaderHero />
      <ShadcnShowcaseSection />
      <BellaSection />
      <SubscribeSection />
      <SiteFooter />
    </>
  )
}
