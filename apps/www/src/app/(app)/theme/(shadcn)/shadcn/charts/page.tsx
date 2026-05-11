import type { Metadata } from 'next'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShadcnCharts } from './_components'

export const metadata: Metadata = {
  title: 'Charts | Tonex',
  description: 'Shadcn charts',
}

export default function ShadcnChartsPage() {
  return (
    <ScrollArea noScrollBar gradientScrollFade>
      <ShadcnCharts />
    </ScrollArea>
  )
}
