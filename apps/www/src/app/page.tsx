'use client'

import { formatLayer, useResolvedTokens, useSource } from '@tonex/core'
import { Preview } from '@/features/preview'

// why: slice 2 spike. Verifies (1) Tailwind utilities (bg-primary,
// text-on-primary, bg-primary-container, text-on-primary-container) resolve
// against md scope-set --color-* tokens; (2) shadcn primary mapping reads
// the same hex as md primary-container at the export-text layer; (3) any
// drift between rendered swatch and printed export is visible side-by-side.
//
// Open-item #2 (push 'use client' down) is intentionally deferred — this
// page stays client-only until the spike confirms the mapping; refactoring
// the boundary happens in slice 2 proper.

export default function Page() {
  const seedHex = useSource((s) => s.seedHex)
  const setSeedHex = useSource((s) => s.setSeedHex)
  const hydrated = useSource((s) => s._hydrated)

  return (
    <main className="grid gap-6 p-6 max-w-[960px]">
      <header>
        <h1 className="text-2xl font-semibold">tonex</h1>
        <p className="opacity-70 text-sm">slice 2 spike — md primary family + shadcn mapping</p>
      </header>

      <label className="flex gap-3 items-center">
        <span>seed</span>
        <input
          type="color"
          value={seedHex}
          onChange={(e) => setSeedHex(e.target.value)}
          aria-label="seed color picker"
        />
        <input
          type="text"
          value={seedHex}
          onChange={(e) => setSeedHex(e.target.value)}
          className="font-mono w-28 px-2 py-1 border rounded"
          aria-label="seed hex"
        />
        {!hydrated && <span className="opacity-50">(hydrating…)</span>}
      </label>

      <section className="grid grid-cols-2 gap-4">
        <div className="grid gap-3">
          <h2 className="text-lg font-medium">md scope</h2>
          <div className="bg-primary text-on-primary p-6 rounded-lg">
            <div className="font-medium">primary / on-primary</div>
            <div className="text-xs opacity-80 mt-1">utilities: bg-primary text-on-primary</div>
          </div>
          <div className="bg-primary-container text-on-primary-container p-6 rounded-lg">
            <div className="font-medium">primary-container / on-primary-container</div>
            <div className="text-xs opacity-80 mt-1">
              utilities: bg-primary-container text-on-primary-container
            </div>
          </div>
        </div>
        <Preview />
      </section>

      <ExportPanels />
    </main>
  )
}

function ExportPanels() {
  const theme = useResolvedTokens()
  if (!theme) return null
  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <h3 className="text-sm font-medium opacity-70">md export</h3>
        <pre className="text-xs p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 overflow-x-auto">
          <code>{formatLayer(theme, 'md')}</code>
        </pre>
      </div>
      <div className="grid gap-2">
        <h3 className="text-sm font-medium opacity-70">shadcn export</h3>
        <pre className="text-xs p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 overflow-x-auto">
          <code>{formatLayer(theme, 'shadcn')}</code>
        </pre>
      </div>
    </section>
  )
}
