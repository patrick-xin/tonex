'use client'

import { type DerivedTheme, type ExportLayer, exportCss, useResolvedTokens } from '@tonex/core'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ExportPanels() {
  const theme = useResolvedTokens()
  if (!theme) return null
  return (
    <section className="grid grid-cols-2 gap-4">
      <ExportPanel theme={theme} layer="md" />
      <ExportPanel theme={theme} layer="shadcn" />
    </section>
  )
}

function ExportPanel({ theme, layer }: { theme: DerivedTheme; layer: ExportLayer }) {
  const css = exportCss(theme, layer)
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium opacity-70">{layer} export</h3>
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? 'copied' : 'copy'}
        </Button>
      </div>
      <pre className="text-xs p-4 rounded-lg bg-surface-container overflow-x-auto">
        <code>{css}</code>
      </pre>
    </div>
  )
}
