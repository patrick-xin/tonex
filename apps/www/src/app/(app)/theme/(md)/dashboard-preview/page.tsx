import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Suspense } from 'react'
import { DashboardContent } from './_components'

export default function DashboardPreview() {
  return (
    <NuqsAdapter>
      <Suspense>
        <DashboardContent />
      </Suspense>
    </NuqsAdapter>
  )
}
