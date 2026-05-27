import type { Metadata } from 'next'
import { Plans } from './_plans'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'tonex is free while in preview.',
}

export default function PricingPage() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mt-4 text-on-surface-variant">Free while in preview.</p>
      </section>
      <Plans />
    </>
  )
}
