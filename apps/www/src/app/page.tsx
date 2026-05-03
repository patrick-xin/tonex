'use client'

import { useSource } from '@tonex/core'
import { Preview } from '@/features/preview'

// why: slice 1 tracer. Verifies the seam end-to-end — change hex in the
// input, both the md element (--color-primary on .md) and the shadcn
// element (--primary on .shadcn) update from one source change.
//
// Inline styles + a raw color input are deliberate. Real seed-picker UX
// is a feature for slice 9+; here we want the minimum that proves wiring.

export default function Page() {
  const seedHex = useSource((s) => s.seedHex)
  const setSeedHex = useSource((s) => s.setSeedHex)
  const hydrated = useSource((s) => s._hydrated)

  return (
    <main style={{ padding: 24, display: 'grid', gap: 24, maxWidth: 720 }}>
      <header>
        <h1>tonex</h1>
        <p style={{ opacity: 0.7 }}>slice 1 tracer — md + shadcn from one source</p>
      </header>

      <label style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
          style={{ fontFamily: 'monospace', width: 110 }}
          aria-label="seed hex"
        />
        {!hydrated && <span style={{ opacity: 0.5 }}>(hydrating…)</span>}
      </label>

      <section style={{ display: 'grid', gap: 12 }}>
        <h2>md element</h2>
        <div
          style={{
            padding: 24,
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: 8,
          }}
        >
          md element — reads <code>var(--color-primary)</code>
        </div>
      </section>

      <Preview />
    </main>
  )
}
