import type { Metadata } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Suspense } from 'react'
import { DashboardContent } from './_components'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard',
}

export default function DashboardPreview() {
  return (
    <NuqsAdapter>
      <Suspense>
        <DashboardContent />
      </Suspense>
    </NuqsAdapter>
  )
}
