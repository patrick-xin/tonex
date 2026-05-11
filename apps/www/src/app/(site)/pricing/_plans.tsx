import Link from 'next/link'
import { Button } from '@/components/ui/button'

const PLANS = [
  {
    name: 'Free forever',
    price: '$0',
    blurb: 'Everything you need to design and export themes. No credit card.',
    cta: 'Open the editor',
    href: '/theme',
  },
  {
    name: 'Pro',
    price: '$8/mo',
    blurb: 'For teams who want shared palettes, history, and priority support.',
    cta: 'Coming soon',
    href: '/theme',
  },
] as const

export function Plans() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-20">
      <div className="grid gap-6 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className="flex flex-col rounded-2xl border border-outline-variant/80 bg-surface-container p-6"
          >
            <h2 className="text-lg font-medium text-on-surface">{plan.name}</h2>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{plan.price}</p>
            <p className="mt-3 text-sm text-on-surface-variant">{plan.blurb}</p>
            <div className="mt-6">
              <Button variant="primary" nativeButton={false} render={<Link href={plan.href} />}>
                {plan.cta}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
