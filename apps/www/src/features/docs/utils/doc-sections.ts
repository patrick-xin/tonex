import type * as PageTree from 'fumadocs-core/page-tree'
import { BotIcon, type LucideIcon, PanelsTopLeftIcon, SquareTerminalIcon } from 'lucide-react'

// why: the three deep-dive sections become header tabs that swap the sidebar's
// lower half; everything else (Get Started, Concepts, Reference) is pinned. This
// is the single source both the header tabs and the sidebar read, so the two
// surfaces can't drift — keyed by folder slug, the stable join with the routes.
const TAB_SLUGS = ['web-app', 'cli', 'agent-skills'] as const
type TabSlug = (typeof TAB_SLUGS)[number]

const TAB_LABELS: Record<TabSlug, string> = {
  'web-app': 'Web App',
  cli: 'CLI',
  'agent-skills': 'Agent Skills',
}

const TAB_ICONS: Record<TabSlug, LucideIcon> = {
  'web-app': PanelsTopLeftIcon,
  cli: SquareTerminalIcon,
  'agent-skills': BotIcon,
}

export interface DocSectionGroup {
  nodes: PageTree.Node[]
  slug: string | null
  pinned: boolean
}

export interface DocTab {
  key: TabSlug
  label: string
  href: string
  icon: LucideIcon
}

function firstUrl(node: PageTree.Node): string | undefined {
  if (node.type === 'page') return node.url
  if (node.type === 'folder') {
    if (node.index) return node.index.url
    for (const child of node.children) {
      const url = firstUrl(child)
      if (url) return url
    }
  }
  return undefined
}

function groupUrl(nodes: PageTree.Node[]): string | undefined {
  for (const node of nodes) {
    const url = firstUrl(node)
    if (url) return url
  }
  return undefined
}

// /docs/<slug>/... -> <slug>; baseUrl segment ('docs') is index 0 after filtering.
function slugOf(url: string | undefined): string | null {
  if (!url) return null
  return url.split('/').filter(Boolean)[1] ?? null
}

// A group is a separator and the nodes that follow it until the next separator —
// i.e. one sidebar heading and its items. Splitting on separators keeps original
// meta.json order, so filtering groups in place preserves the visual ordering.
function splitGroups(children: PageTree.Node[]): PageTree.Node[][] {
  const groups: PageTree.Node[][] = []
  for (const node of children) {
    if (node.type === 'separator' || groups.length === 0) groups.push([node])
    else groups[groups.length - 1].push(node)
  }
  return groups
}

export function getDocSections(tree: PageTree.Root): {
  groups: DocSectionGroup[]
  tabs: DocTab[]
} {
  const groups = splitGroups(tree.children).map((nodes) => {
    const slug = slugOf(groupUrl(nodes))
    const pinned = !slug || !TAB_SLUGS.includes(slug as TabSlug)
    return { nodes, slug, pinned }
  })

  const tabs: DocTab[] = []
  for (const slug of TAB_SLUGS) {
    const href = groupUrl(groups.find((g) => g.slug === slug)?.nodes ?? [])
    if (href) tabs.push({ key: slug, label: TAB_LABELS[slug], href, icon: TAB_ICONS[slug] })
  }
  return { groups, tabs }
}

// Longest-prefix match so a section route lights exactly one tab; null when the
// current page is pinned (Get Started / Concepts / Reference) — no tab active.
export function pickActiveTabKey(pathname: string, tabs: DocTab[]): TabSlug | null {
  let match: TabSlug | null = null
  let matchLen = -1
  for (const tab of tabs) {
    const base = `/docs/${tab.key}`
    if ((pathname === base || pathname.startsWith(`${base}/`)) && base.length > matchLen) {
      match = tab.key
      matchLen = base.length
    }
  }
  return match
}
