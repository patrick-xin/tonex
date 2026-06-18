import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionContent, SectionHeader } from '../section-header'
import { ShaderDots } from '../shader-dot'

export function FinalCta() {
  return (
    <section className="mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 pt-12 md:pt-0 min-h-[70vh]">
      <ShaderDots className="md:h-full w-full h-100" />
      <div className="row-start-1 md:col-start-2">
        <SectionHeader
          heading="Your colors, reimagined."
          headingClassName="font-display"
          description="No signup, open source"
        />
        <SectionContent>
          <div className="w-full flex justify-center gap-4 mx-auto">
            <Button size="lg" nativeButton={false} render={<Link href="/theme" />}>
              Start now
            </Button>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/docs/introduction" />}
              variant="ghost"
            >
              Read docs
            </Button>
          </div>
        </SectionContent>
      </div>
    </section>
  )
}
