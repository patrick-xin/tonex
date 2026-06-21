import { Capabilities, Hero, Moves, Pitch, Process, Stats } from './_components'

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
