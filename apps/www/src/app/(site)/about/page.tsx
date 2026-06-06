import type { Metadata } from 'next'
import { SiteFooter } from '../_components/site-footer'
import { SiteHeader } from '../_components/site-header'
import { FinalCta } from '../_landing/final-cta/final-cta'
import { AboutHero } from './_components/about-hero'
import { Decoration } from './_components/decoration'
import { StoryGap } from './_components/story-gap'
import { StoryMoment } from './_components/story-moment'
import { StorySolution } from './_components/story-solution'

export const metadata: Metadata = {
  title: 'About',
  description:
    'A theming workbench for designers who ship to both Material Design and shadcn surfaces.',
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <AboutHero />
      <section className="max-w-6xl mx-auto py-12 sm:py-24 px-4">
        <h2 className="text-3xl font-medium sm:text-5xl mb-12 sm:mb-20 text-center">
          Story behind Tonex
        </h2>
        <div className="text-base sm:text-[1.2rem] relative">
          <StoryMoment />
          <StoryGap />
          <StorySolution />
          <Decoration />
        </div>
      </section>
      <FinalCta />
      <SiteFooter />
    </>
  )
}
