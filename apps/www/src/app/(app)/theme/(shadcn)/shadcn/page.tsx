import type { Metadata } from 'next'
import { ShadcnComponentsDemo } from './_components'

export const metadata: Metadata = {
  title: 'Shadcn',
  description: 'Shadcn',
}

export default function ShadcnPage() {
  return <ShadcnComponentsDemo />
}
