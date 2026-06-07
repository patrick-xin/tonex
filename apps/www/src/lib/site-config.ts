// why: single source of truth for site-level identity + navigation. Nav links
// used to be duplicated across the command menu (_links.ts), the footer, and the
// mobile drawer — adding/renaming a route meant editing three files and the
// social URLs lived inline in the link components. Everything site-wide now
// derives from here; surfaces attach their own presentation (icons, casing).
//
// NOT to be confused with lib/nav-config.ts, which describes the per-route
// *builder* tabs (MD / shadcn editing surfaces) and their export tabs.

export type SiteRoute = {
  /** stable key — React key + command-menu search value */
  value: string
  label: string
  href: string
}

export const SITE_CONFIG = {
  brand: 'Tonex',
  social: {
    github: 'https://github.com/patrick-xin/tonex',
    x: 'https://x.com/alpesdream',
  },
}

// Canonical site routes — the one place a label/href lives. Keyed for named
// access (footer picks specific entries); spread into NAV_LINKS for the ordered
// surfaces (drawer, command menu).
export const ROUTES = {
  home: { value: 'home', label: 'Home', href: '/' },
  materialTheme: { value: 'material-theme', label: 'Material Theme', href: '/theme' },
  shadcn: { value: 'shadcn', label: 'Shadcn', href: '/theme/shadcn' },
  about: { value: 'about', label: 'About', href: '/about' },
  roadmap: { value: 'roadmap', label: 'Roadmap', href: '/roadmap' },
} satisfies Record<string, SiteRoute>

// Ordered primary navigation — consumed by the mobile drawer and command menu.
export const NAV_LINKS: readonly SiteRoute[] = [
  ROUTES.home,
  ROUTES.materialTheme,
  ROUTES.shadcn,
  ROUTES.about,
  ROUTES.roadmap,
]

// External reference links surfaced in the command menu's Resources group.
export const RESOURCE_LINKS: readonly SiteRoute[] = [
  { value: 'material-design', label: 'Material Design', href: 'https://m3.material.io/' },
  { value: 'shadcn-docs', label: 'Shadcn', href: 'https://ui.shadcn.com/' },
  { value: 'tailwind-css', label: 'Tailwind CSS', href: 'https://tailwindcss.com/' },
]
