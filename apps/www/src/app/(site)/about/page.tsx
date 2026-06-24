import type { Metadata } from 'next'
import { MenuColorPicker } from '@/features/color-picker/custom/menu-color-picker'
import { SiteFooter } from '../_components/site-footer'
import { SiteHeader } from '../_components/site-header'
import { FinalCta } from '../landing/final-cta/final-cta'
import { AboutHero } from './_components/about-hero'
import { Decorations } from './_components/decorations'
import { StoryFuture } from './_components/story-future'
import { StoryGap } from './_components/story-gap'
import { StoryLandscape } from './_components/story-landscape'
import { StoryMoment } from './_components/story-moment'
import { StorySolution } from './_components/story-solution'

export const metadata: Metadata = {
  title: 'About',
  description:
    'A color-authoring engine: one seed becomes a coherent, contrast-checked, role-mapped system your app or agent can ship.',
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <AboutHero />
      <section className="max-w-6xl mx-auto py-12 sm:py-24 px-4">
        <div className="text-base sm:text-[1.2rem] relative">
          <StoryMoment />
          <StoryGap />
          <StorySolution />
          <StoryLandscape />
          <StoryFuture />
          <Decorations />
        </div>
      </section>
      <div className="fixed bottom-6 right-6 z-30">
        <MenuColorPicker />
      </div>
      <FinalCta />
      <SiteFooter />
    </>
  )
}
