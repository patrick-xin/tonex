import { ShieldCheck } from 'lucide-react'
import { SubscribeForm } from '@/features/subscribe'
import { SectionContent, SectionHeader } from './section-header'

export function SubscribeSection() {
  return (
    <section className="shadcn relative flex flex-col mx-auto py-12 sm:py-24">
      <SectionHeader heading="Get occasional product updates." headingClassName="font-display" />

      <SectionContent>
        <SubscribeForm />
        <div className="text-xs text-on-surface-variant mt-3 items-center inline-flex gap-1 text-center">
          <ShieldCheck className="size-3.5" />
          <p>We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </SectionContent>
    </section>
  )
}
