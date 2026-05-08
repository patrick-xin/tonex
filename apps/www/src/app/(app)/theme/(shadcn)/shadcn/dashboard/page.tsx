import type { Metadata } from 'next'
import { ShadcnDashboardLoader } from './_components'

export const metadata: Metadata = {
  title: 'Dashboard | Tonex',
  description: 'Shadcn dashboard',
}

export default function ShadcnDashboardPage() {
  return <ShadcnDashboardLoader />
}
