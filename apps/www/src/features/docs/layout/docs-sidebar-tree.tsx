'use client'

import type * as PageTree from 'fumadocs-core/page-tree'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type * as React from 'react'
import { cn } from 'tailwind-variants'
import { buttonStyles } from '@/components/ui/button'
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/components/ui/collapsible'

// why: the leaf-link element is the only drawer-coupled concern, so the consumer
// injects how it's wrapped (e.g. in a DrawerClose) instead of the tree knowing
// where it's rendered. Sidebar passes nothing → plain links.
type LinkWrapper = (link: React.ReactElement) => React.ReactElement

interface DocsSidebarTreeProps {
  tree: PageTree.Root
  className?: string
  linkWrapper?: LinkWrapper
}

export function DocsSidebarTree({ tree, className, linkWrapper }: DocsSidebarTreeProps) {
  return (
    <nav className={cn('flex flex-col gap-1 px-3 py-4', className)}>
      <TreeItems nodes={tree.children} linkWrapper={linkWrapper} />
    </nav>
  )
}

function TreeItems({
  nodes,
  depth = 0,
  linkWrapper,
}: {
  nodes: PageTree.Node[]
  depth?: number
  linkWrapper?: LinkWrapper
}) {
  // Separators only exist at the top level, where they head collapsible sections
  // (so the reader can fold away a section and stay in focus). Deeper levels are
  // plain item lists rendered inside a folder's own collapsible.
  if (depth === 0) {
    return (
      <>
        {toSections(nodes).map((section, i) => (
          <SidebarSection key={String(i)} section={section} index={i} linkWrapper={linkWrapper} />
        ))}
      </>
    )
  }

  return (
    <>
      {nodes.map((node, i) => (
        <NodeItem key={String(i)} node={node} depth={depth} linkWrapper={linkWrapper} />
      ))}
    </>
  )
}

interface Section {
  heading: React.ReactNode
  items: PageTree.Node[]
}

// A section is a separator and everything up to the next separator. A folder that
// leads the section is flattened (its children become the section's items, under
// the folder's name as the heading) — matching the original flat-tree behaviour.
function toSections(nodes: PageTree.Node[]): Section[] {
  const sections: Section[] = []
  for (let i = 0; i < nodes.length; ) {
    const node = nodes[i]
    if (node.type !== 'separator') {
      i++
      continue
    }
    const following: PageTree.Node[] = []
    let j = i + 1
    while (j < nodes.length && nodes[j].type !== 'separator') following.push(nodes[j++])
    const lead = following[0]
    const heading = lead?.type === 'folder' ? lead.name : node.name
    const items = lead?.type === 'folder' ? [...lead.children, ...following.slice(1)] : following
    sections.push({ heading, items })
    i = j
  }
  return sections
}

function SidebarSection({
  section,
  index,
  linkWrapper,
}: {
  section: Section
  index: number
  linkWrapper?: LinkWrapper
}) {
  return (
    <Collapsible defaultOpen className={cn(index === 0 ? 'mt-0' : 'mt-3')}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between pl-3 pr-1 mb-0.5 text-sm font-medium text-on-surface sidebar-group-header">
        <span>{section.heading}</span>
        <ChevronRightIcon className="size-3.5 text-on-surface-variant transition-transform duration-200 group-data-panel-open:rotate-90" />
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className="flex flex-col gap-0.5 pt-2">
          {section.items.map((node, i) => (
            <NodeItem key={String(i)} node={node} depth={0} linkWrapper={linkWrapper} />
          ))}
        </div>
      </CollapsiblePanel>
    </Collapsible>
  )
}

function NodeItem({
  node,
  depth,
  linkWrapper,
}: {
  node: PageTree.Node
  depth: number
  linkWrapper?: LinkWrapper
}) {
  if (node.type === 'folder')
    return <CollapsibleFolderItem node={node} depth={depth} linkWrapper={linkWrapper} />
  if (node.type === 'page') return <PageItem node={node} depth={depth} linkWrapper={linkWrapper} />
  return null
}

function PageItem({
  node,
  depth,
  linkWrapper,
}: {
  node: PageTree.Item
  depth: number
  linkWrapper?: LinkWrapper
}) {
  const pathname = usePathname()
  const isActive = pathname === node.url

  const link = (
    <Link
      href={node.url}
      data-active={isActive || undefined}
      className={cn(
        buttonStyles({
          variant: 'ghost',
          size: 'sm',
          className:
            'justify-start text-on-surface-variant hover:text-on-surface data-active:bg-primary/8 data-active:text-primary',
        }),
        depth > 0 && 'mt-0.5',
      )}
    >
      {node.icon && <span className="shrink-0 size-4">{node.icon}</span>}
      <span className={cn(depth > 0 && 'ml-2')}>{node.name}</span>
    </Link>
  )

  return linkWrapper ? linkWrapper(link) : link
}

function CollapsibleFolderItem({
  node,
  depth,
  linkWrapper,
}: {
  node: PageTree.Folder
  depth: number
  linkWrapper?: LinkWrapper
}) {
  const pathname = usePathname()
  const isAncestorActive = containsActivePage(node, pathname)

  return (
    <Collapsible defaultOpen={isAncestorActive || node.defaultOpen}>
      <CollapsibleTrigger
        className={cn(
          buttonStyles({
            variant: 'ghost',
            size: 'sm',
            className:
              'group w-full justify-between items-center text-on-surface-variant capitalize',
          }),
        )}
      >
        <span className="flex items-center gap-2">
          {node.icon && <span className="shrink-0 size-4">{node.icon}</span>}
          <span className={cn(depth > 0 ? 'ml-3' : 'ml-0.5')}>{node.name}</span>
        </span>
        <ChevronRightIcon className="size-3.5 text-on-surface-variant transition-transform duration-200 group-data-panel-open:rotate-90" />
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <div className="flex flex-col">
          <TreeItems nodes={node.children} depth={depth + 1} linkWrapper={linkWrapper} />
        </div>
      </CollapsiblePanel>
    </Collapsible>
  )
}

function containsActivePage(node: PageTree.Folder, pathname: string): boolean {
  for (const child of node.children) {
    if (child.type === 'page' && child.url === pathname) return true
    if (child.type === 'folder' && containsActivePage(child, pathname)) return true
  }
  return false
}
