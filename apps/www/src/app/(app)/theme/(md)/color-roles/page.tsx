import type { Metadata } from 'next'
import { ColorRolesList } from '@/features/color-roles-list'

export const metadata: Metadata = {
  title: 'Color Roles',
  description: 'Color roles',
}

export default function RolesPage() {
  return <ColorRolesList />
}
