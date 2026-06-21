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
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === 'separator') {
          const next = nodes[i + 1]
          const isSectionHeading = next?.type === 'folder'
          return (
            <h3
              key={String(i)}
              className={cn(
                'text-sm font-medium text-on-surface sidebar-group-header flex items-center mb-0.5 pl-3',
                i === 0 ? 'mt-0' : 'mt-6',
              )}
            >
              {isSectionHeading ? next.name : node.name}
            </h3>
          )
        }

        const prev = nodes[i - 1]
        if (node.type === 'folder' && prev?.type === 'separator') {
          return (
            <TreeItems
              key={String(i)}
              nodes={node.children}
              depth={depth}
              linkWrapper={linkWrapper}
            />
          )
        }

        if (node.type === 'folder') {
          return (
            <CollapsibleFolderItem
              key={String(i)}
              node={node}
              depth={depth}
              linkWrapper={linkWrapper}
            />
          )
        }

        return <PageItem key={String(i)} node={node} depth={depth} linkWrapper={linkWrapper} />
      })}
    </>
  )
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
        depth > 0 && 'mt-1',
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
