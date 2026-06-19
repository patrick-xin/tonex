import SectionBeliefs from './_components/section-beliefs'
import SectionCapability from './_components/section-capability'
import SectionHero from './_components/section-hero'
import SectionManifesto from './_components/section-manifesto'
import SectionStrategy from './_components/section-strategy'
import SectionWork from './_components/section-work'

export default function EditorialPage() {
  return (
    <>
      <SectionHero />
      <SectionBeliefs />
      <SectionCapability />
      <SectionWork />
      <SectionStrategy />
      <SectionManifesto />
    </>
  )
}
