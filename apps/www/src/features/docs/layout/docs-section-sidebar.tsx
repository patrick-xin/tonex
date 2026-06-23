'use client'

import { usePathname } from 'next/navigation'
import { getDocSections, pickActiveTabKey } from '../utils/doc-sections'
import { source } from '../utils/source'
import { DocsSidebarTree } from './docs-sidebar-tree'

// why: pinned groups (Get Started / Concepts / Reference) always render; the
// active tab's section drops in at its original position because groups keep
// meta.json order. On a pinned page no tab is active, so no section shows below.
export function DocsSectionSidebar() {
  const pathname = usePathname()
  const { groups, tabs } = getDocSections(source.pageTree)
  const activeKey = pickActiveTabKey(pathname, tabs)
  const children = groups
    .filter((group) => group.pinned || group.slug === activeKey)
    .flatMap((group) => group.nodes)

  return <DocsSidebarTree tree={{ ...source.pageTree, children }} />
}
