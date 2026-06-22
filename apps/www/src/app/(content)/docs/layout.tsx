import type { ReactNode } from 'react'
import { DocsHeader, DocsLayout, DocsSidebar, DocsSidebarTree, source } from '@/features/docs'

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
