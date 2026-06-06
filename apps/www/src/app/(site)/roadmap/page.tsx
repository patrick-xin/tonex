import type { Metadata } from 'next'
import { SiteFooter } from '../_components/site-footer'
import { SiteHeader } from '../_components/site-header'
import { FinalCta } from '../_landing/final-cta/final-cta'
import { SectionHeader } from '../_landing/section-header'
import { AboutHero } from '../about/_components/about-hero'
import { Releases } from './_components/releases'

export const metadata: Metadata = {
  title: 'Roadmap',
  description: "What's shipped and what's next for tonex.",
}

export default function RoadmapPage() {
  return (
    <>
      <SiteHeader />
      <AboutHero />
      <div className="px-6 py-12 sm:py-24 space-y-20">
        <div className="space-y-12 pt-8">
          <SectionHeader heading="Roadmap" description=" Everything that already works today. " />
          <div className="max-w-3xl mx-auto">
            <Releases />
          </div>
        </div>
      </div>
      <FinalCta />
      <SiteFooter />
    </>
  )
}
