import { Barcode, Cuboid, Layers, LayoutDashboard, Palette, SquareChartGantt } from 'lucide-react'
import type { NavConfig } from '@/lib/nav-config'

// why: route-colocated per ADR-0022 commitment 2 (locate-test). "What's in the
// md nav?" resolves to one file: this one. NavTabs and SiteCommandMenu both
// derive from it via the layout, so they can't drift.
export const mdNavConfig: NavConfig = {
  layer: 'md',
  tabs: [
    { label: 'Overview', href: '/theme', icon: LayoutDashboard },
    { label: 'Color Roles', href: '/theme/color-roles', icon: Layers },
    { label: 'Palettes', href: '/theme/palettes', icon: Palette },
    { label: 'Blocks', href: '/theme/blocks', icon: Cuboid },
    { label: 'Dashboard', href: '/theme/dashboard-preview', icon: LayoutDashboard },
    { label: 'Editorial', href: '/theme/templates/editorial', icon: Barcode },
    { label: 'Studio', href: '/theme/templates/studio', icon: SquareChartGantt },
  ],
  // why: ADR-0021 commitment 8 — md routes pass these tabs. CSS is the
  // framework-agnostic native-CSS sibling of Tailwind (--md-sys-color-* +
  // light-dark()), so it sits next to it for the non-Tailwind audience.
  // Design.md emits the md color surface as a @google/design.md `colors:`
  // block (md-only — the shadcn route keeps its single shadcn tab).
  exportTabs: ['Tailwind', 'CSS', 'JSON', 'Dart', 'DESIGN.md'],
  crossLink: { label: 'Shadcn', href: '/theme/shadcn' },
}
