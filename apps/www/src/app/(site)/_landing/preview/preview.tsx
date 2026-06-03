import { SectionHeader } from '../section-header'
import { PreviewTabs } from './preview-tabs'

export function PreviewSection() {
  return (
    <section className="shadcn relative flex h-dvh flex-col mx-auto py-12 sm:py-24 overflow-hidden">
      <SectionHeader
        heading="See your theme on product UI"
        description="Drop your palette onto the components you build with every day. What you preview is what your users get."
      />
      <PreviewTabs />
    </section>
  )
}
