'use client'

import { formatLayer, useResolvedTokens } from '@tonex/core'

export function ExportPanels() {
  const theme = useResolvedTokens()
  if (!theme) return null
  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <h3 className="text-sm font-medium opacity-70">md export</h3>
        <pre className="text-xs p-4 rounded-lg bg-surface-container overflow-x-auto">
          <code>{formatLayer(theme, 'md')}</code>
        </pre>
      </div>
      <div className="grid gap-2">
        <h3 className="text-sm font-medium opacity-70">shadcn export</h3>
        <pre className="text-xs p-4 rounded-lg bg-surface-container overflow-x-auto">
          <code>{formatLayer(theme, 'shadcn')}</code>
        </pre>
      </div>
    </section>
  )
}
