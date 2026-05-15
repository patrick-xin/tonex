'use client'

import { DownloadSimpleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface ExportControlsProps {
  exportContent: string
  ext: string
}

export function ExportControls({ exportContent, ext }: ExportControlsProps) {
  const handleDownload = () => {
    const blob = new Blob([exportContent], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // why: CSS tabs (Tailwind / shadcn) save as `globals.css` — the canonical
    // shadcn-cli / Tailwind v4 filename — so the file drops straight in.
    // Stub formatters (TS/JSON/Dart) fall back to `theme.<ext>`.
    a.download = ext === 'css' ? 'globals.css' : `theme.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-2 flex gap-2 items-center justify-end border-t border-outline-variant">
      <Button size="sm" onClick={handleDownload} variant="ghost">
        <DownloadSimpleIcon weight="bold" />
        Download
      </Button>
    </div>
  )
}
