import type { Metadata } from 'next'
import { BlocksDemo } from './_components'

export const metadata: Metadata = {
  title: 'Blocks',
  description: 'Shadcn blocks',
}

// why: BlocksDemo is `min-w-max` — intentionally wider than the viewport. The
// horizontal scroll has to live on this section, not the page, otherwise the
// whole document gets a horizontal scrollbar.
export default function ShadcnBlocksPage() {
  return (
    <div className="overflow-x-auto">
      <BlocksDemo />
    </div>
  )
}
