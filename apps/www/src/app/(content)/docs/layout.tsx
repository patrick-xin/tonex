import type { ReactNode } from 'react'
import { DocsHeader, DocsLayout, DocsSectionSidebar, DocsSidebar } from '@/features/docs/layout'

export default function ContentLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      header={<DocsHeader />}
      sidebar={
        <DocsSidebar>
          <DocsSectionSidebar />
        </DocsSidebar>
      }
    >
      {children}
    </DocsLayout>
  )
}
