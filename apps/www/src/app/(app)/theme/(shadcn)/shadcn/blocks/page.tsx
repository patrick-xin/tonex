import type { Metadata } from 'next'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BlocksDemo } from './_components'

export const metadata: Metadata = {
  title: 'Blocks | Tonex',
  description: 'Shadcn blocks',
}

export default function ShadcnBlocksPage() {
  return (
    <ScrollArea noScrollBar gradientScrollFade className="p-1 overscroll-contain">
      <BlocksDemo />
    </ScrollArea>
  )
}
