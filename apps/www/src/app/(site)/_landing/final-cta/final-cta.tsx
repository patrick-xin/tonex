import { SectionContent, SectionHeader } from '../section-header'
import { ShaderDots } from '../shader-dot'
import { SubscribeSection } from '../subscribe-section'

export function FinalCta() {
  return (
    <section className="mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-6 py-12 sm:py-24 min-h-[80vh]">
      <ShaderDots className="sm:h-full w-full h-100" />
      <div>
        <SectionHeader
          heading="Your colors, reimagined."
          headingClassName="font-display text-4xl xl:text-6xl"
          description="Get product updates."
        />
        <SectionContent>
          <div className="w-full max-w-xs mx-auto">
            <SubscribeSection />
          </div>
        </SectionContent>
      </div>
    </section>
  )
}
