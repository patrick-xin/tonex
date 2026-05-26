import { SiteHeader } from './_components/site-header'
import { FeaturesSection } from './_features-section'
import { ShaderHero } from './_shader-hero'
// note: _hero.tsx (CSS-radial hero) + _hero-visual.tsx are kept on disk but no
// longer rendered — the hero is now the live MeshGradient shader (_shader-hero).
import { SubscribeSection } from './_subscribe-section'

export default function LandingPage() {
  return (
    <>
      <SiteHeader layer="md" />
      <ShaderHero />
      <FeaturesSection />
      <SubscribeSection />
    </>
  )
}
