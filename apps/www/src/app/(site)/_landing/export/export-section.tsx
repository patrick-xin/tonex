import { SectionHeader } from '../section-header'
import { ExportTabs } from './export-tabs'

export function ExportSection() {
  return (
    <section className="relative flex flex-col mx-auto py-12 sm:py-24">
      <SectionHeader
        heading="Exports that drop straight into your stack."
        description="Export in the format your stack already speaks, paste it in, and there's nothing left to re-theme."
      />
      <ExportTabs />
    </section>
  )
}
