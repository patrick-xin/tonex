import { SectionHeader } from '../section-header'
import SeedSwatches from './seed-swatches'
import { SeedTrigger } from './seed-trigger'

export function SeedSection() {
  return (
    <section className="mx-auto py-12 sm:py-24 overflow-x-hidden">
      <SectionHeader
        heading="One color becomes a complete system"
        description="Pick a color, you get back a finished, accessible system. One decision instead of many."
      />
      <div className="mx-auto flex justify-center -mt-6 mb-6">
        <SeedTrigger />
      </div>
      <SeedSwatches />
    </section>
  )
}
