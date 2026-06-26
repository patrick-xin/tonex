import type { Metadata } from 'next'
import { Capabilities, Hero, Moves, Pitch, Process, Stats } from './_components'

export const metadata: Metadata = {
  title: 'Studio',
  description: 'Studio',
}

export default function StudioPage() {
  return (
    <div className="mx-auto space-y-20">
      <Hero />
      <Stats />
      <Moves />
      <Capabilities />
      <Process />
      <Pitch />
    </div>
  )
}
