import { RainbowButton } from '@/components/shared/rainbow-button'
import { SectionContent, SectionHeader } from '../section-header'

export function FinalCta() {
  return (
    <section className="mx-auto px-6 py-12 sm:py-24 max-w-5xl md:max-w-7xl">
      <SectionHeader
        heading="Your colors. Reimagined."
        headingClassName="font-display xl:text-7xl"
        description="Build your color system now."
      />
      <SectionContent>
        <div className="mx-auto w-24">
          <RainbowButton />
        </div>
      </SectionContent>
    </section>
  )
}
