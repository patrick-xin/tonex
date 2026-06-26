import type { Metadata } from 'next'
import {
  SectionBeliefs,
  SectionCapability,
  SectionHero,
  SectionManifesto,
  SectionStrategy,
  SectionWork,
} from './_components'

export const metadata: Metadata = {
  title: 'Editorial',
  description: 'Editorial',
}

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
