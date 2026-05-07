'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'

interface ExportControlsProps {
  exportContent: string
  ext: string
}

export function ExportControls({ exportContent, ext }: ExportControlsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(exportContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [exportContent])

  const handleDownload = useCallback(() => {
    const blob = new Blob([exportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `theme.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [exportContent, ext])

  return (
    <div className="p-2 flex gap-2 items-center justify-end">
      <Button size="sm" onClick={handleCopy} variant={copied ? 'primary' : 'outline'}>
        {copied ? 'Copied!' : 'Copy'}
      </Button>
      <Button size="sm" onClick={handleDownload} variant="outline">
        Download
      </Button>
    </div>
  )
}
