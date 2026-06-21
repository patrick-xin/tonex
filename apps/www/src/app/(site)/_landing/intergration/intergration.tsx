import { SectionHeader } from '../section-header'
import { Terminal } from './terminal'
import { transcript } from './transcript'

export function IntergrationSection() {
  return (
    <section className="relative flex flex-col mx-auto py-12 sm:py-24 overflow-hidden">
      <SectionHeader
        heading="Integrate with your agentic workflow"
        description="Run the CLI directly, or just talk to your agent — it sets up contrast-checked colors in your project."
      />
      <Terminal transcript={transcript} />
    </section>
  )
}
