import type { Metadata } from 'next'
import { ColorRolesOverview } from './_color-roles-overview'

export const metadata: Metadata = {
  title: 'Overview',
  description: 'Color roles',
}

export default function MDPage() {
  return <ColorRolesOverview />
}
