import Link from 'next/link'
import { Button } from '@/components/ui/button'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    blurb: 'Everything you need while tonex is in preview.',
    cta: 'Open the editor',
  },
] as const

export function Plans() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className="flex flex-col rounded-2xl border border-outline-variant/80 bg-surface-container p-6"
          >
            <h2 className="text-lg font-medium text-on-surface">{plan.name}</h2>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{plan.price}</p>
            <p className="mt-3 text-sm text-on-surface-variant">{plan.blurb}</p>
            <div className="mt-6">
              <Button variant="primary" nativeButton={false} render={<Link href="/theme" />}>
                {plan.cta}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
