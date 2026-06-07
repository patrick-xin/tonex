import type { Metadata } from 'next'
import { BlocksDemo } from './_components'

export const metadata: Metadata = {
  title: 'Blocks',
  description: 'Component blocks',
}

export default function BlocksPage() {
  return (
    <div className="overflow-x-auto">
      <BlocksDemo />
    </div>
  )
}
