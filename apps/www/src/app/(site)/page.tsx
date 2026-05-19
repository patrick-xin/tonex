import { SiteHeader } from './_components/site-header'
import { FeaturesSection } from './_features-section'
import { Hero } from './_hero'

export default function LandingPage() {
  return (
    <>
      <SiteHeader layer="md" />
      <Hero />
      <FeaturesSection />
    </>
  )
}
