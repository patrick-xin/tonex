'use client'

import { ScrollArea } from '@/components/ui/scroll-area'

interface ExportContentDisplayProps {
  content: string
}

export function ExportContentDisplay({ content }: ExportContentDisplayProps) {
  return (
    <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0 h-full">
      <pre className="font-mono m-2 p-4 text-[11px] text-on-surface-variant bg-surface-container-low whitespace-pre">
        {content}
      </pre>
    </ScrollArea>
  )
}
