import type { Metadata } from 'next'
import { MenuColorPicker } from '@/features/color-picker/custom/menu-color-picker'
import { SiteFooter } from '../_components/site-footer'
import { SiteHeader } from '../_components/site-header'
import { FinalCta } from '../landing/final-cta/final-cta'
import { RoadmapHero } from './_components/roadmap-hero'
import { RoadmapTimeline } from './_components/roadmap-timeline'

export const metadata: Metadata = {
  title: 'Roadmap',
  description:
    'A clear path forward, outlining what’s next, what’s evolving, and where Tonex is headed.',
}

export default function RoadmapPage() {
  return (
    <>
      <SiteHeader />
      <RoadmapHero />
      <section className="max-w-7xl mx-auto py-12 sm:py-24 px-4">
        <RoadmapTimeline />
      </section>
      <div className="fixed bottom-6 right-6 z-30">
        <MenuColorPicker />
      </div>
      <FinalCta />
      <SiteFooter />
    </>
  )
}
