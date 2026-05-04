'use client'

import { useResolvedTokens } from '@tonex/core'
import { useActiveMode } from './use-active-mode'

export function MdSwatches() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  if (!theme || !mode) return null
  const md = theme.md[mode]
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-medium">md scope ({mode})</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary text-on-primary p-6 rounded-lg">
          <div className="font-medium">primary / on-primary</div>
          <div className="text-xs opacity-80 mt-1 font-mono">
            {md['--color-primary']} / {md['--color-on-primary']}
          </div>
          <div className="text-xs opacity-80 mt-1">utilities: bg-primary text-on-primary</div>
        </div>
        <div className="bg-primary-container text-on-primary-container p-6 rounded-lg">
          <div className="font-medium">primary-container / on-primary-container</div>
          <div className="text-xs opacity-80 mt-1 font-mono">
            {md['--color-primary-container']} / {md['--color-on-primary-container']}
          </div>
          <div className="text-xs opacity-80 mt-1">
            utilities: bg-primary-container text-on-primary-container
          </div>
        </div>
      </div>
    </section>
  )
}
