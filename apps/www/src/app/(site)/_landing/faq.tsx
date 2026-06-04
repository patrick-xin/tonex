import { QA } from './qa'
import { SectionHeader } from './section-header'

export function FAQ() {
  return (
    <section className="relative flex flex-col mx-auto py-12 sm:py-24 isolate">
      <SectionHeader
        heading="Frequently asked questions"
        description="Export in the format your stack already speaks, paste it in, and there's nothing left to re-theme."
      />
      <QA />
    </section>
  )
}
