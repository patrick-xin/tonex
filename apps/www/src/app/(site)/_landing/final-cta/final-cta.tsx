import { SectionContent, SectionHeader } from '../section-header'
import { ShaderDots } from '../shader-dot'
import { SubscribeSection } from '../subscribe-section'

export function FinalCta() {
  return (
    <section className="mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 pt-12 md:pt-0 min-h-[70vh]">
      <ShaderDots className="md:h-full w-full h-100" />
      <div className="row-start-1 md:col-start-2">
        <SectionHeader
          heading="Your colors, reimagined."
          headingClassName="font-display"
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
