import { CtaButtons } from '../cta-buttons'
import { SectionContent, SectionHeader } from '../section-header'

export function FinalCta() {
  return (
    <section className="mx-auto px-6 py-12 sm:py-24 max-w-5xl md:max-w-7xl">
      <SectionHeader heading="Build your color system now." headingClassName="font-display" />
      <SectionContent>
        <CtaButtons className="justify-center" />
      </SectionContent>
    </section>
  )
}
