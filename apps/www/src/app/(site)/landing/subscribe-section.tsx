import { ShieldCheck } from 'lucide-react'
import { SubscribeForm } from '@/features/subscribe'

export function SubscribeSection() {
  return (
    <section className="flex flex-col">
      <SubscribeForm />
      <div className="text-xs text-on-surface-variant mt-3 items-center inline-flex gap-1 text-center">
        <ShieldCheck className="size-3.5" />
        <p>We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </section>
  )
}
