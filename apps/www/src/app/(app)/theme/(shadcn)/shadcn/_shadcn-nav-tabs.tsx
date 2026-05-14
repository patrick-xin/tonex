'use client'

import { NavTabs } from '@/features/nav-tabs'
import { shadcnNavConfig } from './_nav-config'

// why: NavConfig carries lucide forwardRef icons which are not serializable
// across the RSC boundary. The layout (Server Component) renders this client
// wrapper instead of `<NavTabs config={shadcnNavConfig}/>` directly, so the
// config is read inside the client tree and never crosses the boundary.
//
// ContrastChecker is route-colocated here (not at the layout) so the shadcn
// route group hosts its own `layer="shadcn"` instance — md pairs are noise
// for shadcn users and vice versa.
export function ShadcnNavTabs() {
  return <NavTabs config={shadcnNavConfig} />
}
