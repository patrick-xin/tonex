'use client'

import { DownloadSimpleIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface ExportControlsProps {
  exportContent: string
  ext: string
}

// why: Safari (macOS) ignores the `download` filename and derives the extension
// from the blob MIME, so a hardcoded `text/css` silently saved JSON/Dart as `.css`.
const MIME_BY_EXT: Record<string, string> = {
  css: 'text/css',
  json: 'application/json',
  dart: 'text/x-dart',
  md: 'text/markdown',
}

export function ExportControls({ exportContent, ext }: ExportControlsProps) {
  const handleDownload = () => {
    const blob = new Blob([exportContent], { type: MIME_BY_EXT[ext] ?? 'text/plain' })
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
    <div className="p-2 flex gap-2 items-center justify-end border-t border-outline-variant/40">
      <Button size="sm" onClick={handleDownload} variant="ghost">
        <DownloadSimpleIcon weight="bold" />
        Download
      </Button>
    </div>
  )
}
