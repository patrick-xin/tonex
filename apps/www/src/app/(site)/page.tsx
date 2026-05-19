import { SiteHeader } from './_components/site-header'
import { FeaturesSection } from './_features-section'
import { Hero } from './_hero'
import { SubscribeSection } from './_subscribe-section'

export default function LandingPage() {
  return (
    <>
      <SiteHeader layer="md" />
      <Hero />
      <FeaturesSection />
      <SubscribeSection />
    </>
  )
}
