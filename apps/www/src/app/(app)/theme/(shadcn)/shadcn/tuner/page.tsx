import type { Metadata } from 'next'
import { ShadcnDashboardLoader } from '../dashboard/_components'

export const metadata: Metadata = {
  title: 'Tuner',
  description: 'Dev surface for shadcn preset curation',
}

// why: dev-only sink for preset curation. The layout's rail switcher mounts
// the tuner rail on this path; the page itself just renders a visual
// showcase (dashboard) so binding changes propagate live as the curator
// tunes. Showcase choice is provisional — design pass deferred.
export default function ShadcnTunerPage() {
  return <ShadcnDashboardLoader />
}
