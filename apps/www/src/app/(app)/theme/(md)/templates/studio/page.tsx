import { Capabilities } from './_components/capabilities'
import { Hero } from './_components/hero'
import { Moves } from './_components/moves'
import { Pitch } from './_components/pitch'
import { Process } from './_components/process'
import { Stats } from './_components/stats'

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
