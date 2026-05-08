'use client'

import dynamic from 'next/dynamic'
import { DemoLoader } from '@/components/shared/demo-loader'

const ShadcnChartsShowcase = dynamic(() => import('./showcase'), {
  loading: () => <DemoLoader />,
  ssr: false,
})

export const ShadcnCharts = () => {
  return <ShadcnChartsShowcase />
}
