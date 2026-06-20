import type { Metadata } from 'next'
import { BlocksDemo } from './_components'

export const metadata: Metadata = {
  title: 'Blocks',
  description: 'Shadcn blocks',
}

export default function ShadcnBlocksPage() {
  return (
    <div className="relative overflow-x-auto">
      <BlocksDemo />
    </div>
  )
}
