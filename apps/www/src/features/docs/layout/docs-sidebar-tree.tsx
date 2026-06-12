'use client'

import type * as PageTree from 'fumadocs-core/page-tree'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from 'tailwind-variants'
import { buttonStyles } from '@/components/ui/button'
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/components/ui/collapsible'

interface DocsSidebarTreeProps {
  tree: PageTree.Root
}

export function DocsSidebarTree({ tree }: DocsSidebarTreeProps) {
  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      <TreeItems nodes={tree.children} />
    </nav>
  )
}

function TreeItems({ nodes, depth = 0 }: { nodes: PageTree.Node[]; depth?: number }) {
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
          return <TreeItems key={String(i)} nodes={node.children} depth={depth} />
        }

        if (node.type === 'folder') {
          return <CollapsibleFolderItem key={String(i)} node={node} depth={depth} />
        }

        return <PageItem key={String(i)} node={node} depth={depth} />
      })}
    </>
  )
}

function PageItem({ node, depth }: { node: PageTree.Item; depth: number }) {
  const pathname = usePathname()
  const isActive = pathname === node.url

  return (
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
}

function CollapsibleFolderItem({ node, depth }: { node: PageTree.Folder; depth: number }) {
  const pathname = usePathname()
  const isAncestorActive = containsActivePage(node, pathname)

  return (
    <Collapsible defaultOpen={isAncestorActive || node.defaultOpen}>
      <CollapsibleTrigger
        className={cn(
          buttonStyles({
            variant: 'ghost',
            size: 'sm',
            className: 'group w-full justify-between items-center text-on-surface-variant',
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
          <TreeItems nodes={node.children} depth={depth + 1} />
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
