import type { ReactNode } from 'react'
import { DocsHeader, DocsLayout, DocsSidebar, DocsSidebarTree } from '@/features/docs/layout'
import { source } from '@/features/docs/utils/source'

export default function ContentLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      header={<DocsHeader />}
      sidebar={
        <DocsSidebar>
          <DocsSidebarTree tree={source.pageTree} />
        </DocsSidebar>
      }
    >
      {children}
    </DocsLayout>
  )
}
