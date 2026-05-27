import { ShieldCheck } from 'lucide-react'
import { SubscribeForm } from '@/features/subscribe'

export function SubscribeSection() {
  return (
    <section>
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Hear when tonex ships something new
        </h2>
        <p className="mt-5 text-balance text-on-surface-variant">
          One email when a meaningful feature lands — and a quick line welcoming you in.
        </p>
        <div className="mx-auto mt-8 max-w-sm">
          <SubscribeForm />
          <div className="text-xs text-on-surface-variant mt-3 items-center inline-flex gap-1 text-center">
            <ShieldCheck className="size-3.5" />
            <p>We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
