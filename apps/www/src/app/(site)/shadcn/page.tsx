import type { Metadata } from 'next'
import { ShadcnHero } from './_hero'

export const metadata: Metadata = {
  title: 'shadcn',
  description:
    'Pro-grade color tools, finally for the web. Real HCT, five tonal families, MD3 and shadcn from the same source.',
}

export default function ShadcnLandingPage() {
  return <ShadcnHero />
}
