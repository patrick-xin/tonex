import { BarChart3, Cuboid, LayoutGrid, Palette, PanelLeft } from 'lucide-react'
import type { NavConfig } from '@/lib/nav-config'

// why: route-colocated per ADR-0022 commitment 2 (locate-test).
export const shadcnNavConfig: NavConfig = {
  layer: 'shadcn',
  tabs: [
    { label: 'Components', href: '/theme/shadcn', icon: LayoutGrid },
    { label: 'Blocks', href: '/theme/shadcn/blocks', icon: Cuboid },
    { label: 'Dashboard', href: '/theme/shadcn/dashboard', icon: PanelLeft },
    { label: 'Charts', href: '/theme/shadcn/charts', icon: BarChart3 },
    { label: 'Palettes', href: '/theme/shadcn/palettes', icon: Palette },
  ],
  // why: ADR-0021 commitment 8 — shadcn routes pass a single tab.
  exportTabs: ['shadcn'],
  crossLink: { label: 'MD3', href: '/theme' },
}
