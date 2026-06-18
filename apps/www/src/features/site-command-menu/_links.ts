import { GithubLogoIcon, XLogoIcon } from '@phosphor-icons/react'
import { BookIcon, Info, LandPlot } from 'lucide-react'
import { TonexLogo } from '@/components/icons/logo'
import { MdIcon } from '@/components/icons/md'
import { ShadcnIcon } from '@/components/icons/shadcn'
import { TailwindCSSIcon } from '@/components/icons/tailwind'
import { NAV_LINKS, RESOURCE_LINKS, SITE_CONFIG } from '@/lib/site-config'
import type { Item } from './_shortcuts'

// why: routes/social/resources come from lib/site-config (single source of
// truth); the command menu owns the *presentation* — it maps each route's stable
// `value` to an icon here so site-config stays framework-light (no icon imports).
const NAV_ICONS: Record<string, Item['icon']> = {
  home: TonexLogo,
  'material-theme': MdIcon,
  shadcn: ShadcnIcon,
  docs: BookIcon,
  about: Info,
  roadmap: LandPlot,
}

const RESOURCE_ICONS: Record<string, Item['icon']> = {
  'material-design': MdIcon,
  'shadcn-docs': ShadcnIcon,
  'tailwind-css': TailwindCSSIcon,
}

export const links: Item[] = NAV_LINKS.map((route) => ({
  icon: NAV_ICONS[route.value],
  label: route.label,
  value: route.value,
  href: route.href,
}))

export const community: Item[] = [
  { icon: GithubLogoIcon, label: 'GitHub', value: 'github', href: SITE_CONFIG.social.github },
  { icon: XLogoIcon, label: 'X', value: 'x', href: SITE_CONFIG.social.x },
]

export const resources: Item[] = RESOURCE_LINKS.map((route) => ({
  icon: RESOURCE_ICONS[route.value],
  label: route.label,
  value: route.value,
  href: route.href,
}))
