import { DashboardCard } from './dashboard'
import { FanDeckHover, type FanItem } from './fan-deck-hover'
import { MusicPlayerCard } from './music-player'
import { PlantCareCard } from './plant-care'

const APPS: FanItem[] = [
  {
    id: 'music',
    content: <MusicPlayerCard />,
  },
  {
    id: 'dashboard',
    content: <DashboardCard />,
  },
  {
    id: 'plants',
    content: <PlantCareCard />,
  },
]

export function AppFan() {
  return (
    <FanDeckHover
      items={APPS}
      geometry={{ spreadX: 150, dipY: 24, tilt: 10, stackX: 8, stackY: 5, stackTilt: 3 }}
      stageClassName="size-[50rem]"
    />
  )
}
