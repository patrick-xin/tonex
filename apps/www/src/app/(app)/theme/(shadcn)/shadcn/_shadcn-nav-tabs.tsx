'use client'

import { NavTabs } from '@/features/nav-tabs'
import { shadcnNavConfig } from './_nav-config'

// why: NavConfig carries lucide forwardRef icons which are not serializable
// across the RSC boundary. The layout (Server Component) renders this client
// wrapper instead of `<NavTabs config={shadcnNavConfig}/>` directly, so the
// config is read inside the client tree and never crosses the boundary.
export function ShadcnNavTabs() {
  return <NavTabs config={shadcnNavConfig} />
}
