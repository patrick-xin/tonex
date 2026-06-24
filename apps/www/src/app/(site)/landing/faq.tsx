import { QA } from './qa'
import { SectionHeader } from './section-header'

export function FAQ() {
  return (
    <section className="relative flex flex-col mx-auto py-12 sm:py-24 px-4 isolate">
      <SectionHeader
        heading="Frequently asked questions"
        headingClassName="text-4xl font-medium sm:text-5xl lg:text-5xl"
      />
      <QA />
    </section>
  )
}
