import type { Metadata } from 'next'
import { MenuColorPicker } from '@/features/color-picker/custom/menu-color-picker'
import { SiteFooter } from '../_components/site-footer'
import { SiteHeader } from '../_components/site-header'
import { FinalCta } from '../landing/final-cta/final-cta'
import { ChangelogHero } from './_components/changelog-hero'
import { Releases } from './_components/releases'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'A simple archive for tracking Tonex changes and documenting what evolves.',
}

export default function ChangelogPage() {
  return (
    <>
      <SiteHeader />
      <ChangelogHero />
      <section className="max-w-6xl mx-auto py-12 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Releases />
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
