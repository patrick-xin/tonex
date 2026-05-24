import { Cuboid, Layers, LayoutDashboard, Palette } from 'lucide-react'
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
    { label: 'Dashboard Preview', href: '/theme/dashboard-preview', icon: LayoutDashboard },
    { label: 'Blocks', href: '/theme/blocks', icon: Cuboid },
  ],
  // why: ADR-0021 commitment 8 — md routes pass these tabs. CSS is the
  // framework-agnostic native-CSS sibling of Tailwind (--md-sys-color-* +
  // light-dark()), so it sits next to it for the non-Tailwind audience.
  exportTabs: ['Tailwind', 'CSS', 'JSON', 'Dart'],
  crossLink: { label: 'Shadcn', href: '/theme/shadcn' },
}
