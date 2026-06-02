import type { Metadata } from 'next'
import { AboutHero } from './_about-hero'

export const metadata: Metadata = {
  title: 'About',
  description:
    'A theming workbench for designers who ship to both Material Design and shadcn surfaces.',
}

export default function AboutPage() {
  return <AboutHero />
}
