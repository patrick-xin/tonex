import type { Metadata } from 'next'
import { ShadcnCharts } from './_components'

export const metadata: Metadata = {
  title: 'Charts',
  description: 'Shadcn charts',
}

export default function ShadcnChartsPage() {
  return <ShadcnCharts />
}
