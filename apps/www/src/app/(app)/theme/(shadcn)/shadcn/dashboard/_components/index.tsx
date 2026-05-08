'use client'

import dynamic from 'next/dynamic'
import { DemoLoader } from '@/components/shared/demo-loader'

const ShadcnDashboard = dynamic(() => import('./dashboard'), {
  loading: () => <DemoLoader />,
  ssr: false,
})

export const ShadcnDashboardLoader = () => {
  return <ShadcnDashboard />
}
