import type { ExportTab } from '@/features/export'
import type { Layer } from './layer-context'

// why: NavTabs and SiteCommandMenu both need to know the per-layer page list.
// Sharing this shape (one config per route layout) keeps the two surfaces in
// lockstep — they can't drift the way the prior usePathname-branching did.

export type NavTab = {
  label: string
  href: string
  icon: React.ElementType
}

export type NavConfig = {
  layer: Layer
  tabs: NavTab[]
  exportTabs: readonly ExportTab[]
  crossLink: { label: string; href: string }
}
