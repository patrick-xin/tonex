'use client'

import { NavTabs } from '@/features/nav-tabs'
import { mdNavConfig } from './_nav-config'

// why: NavConfig carries lucide forwardRef icons which are not serializable
// across the RSC boundary. The layout (Server Component) renders this client
// wrapper instead of `<NavTabs config={mdNavConfig}/>` directly, so the config
// is read inside the client tree and never crosses the boundary.
export function MdNavTabs() {
  return <NavTabs config={mdNavConfig} />
}
