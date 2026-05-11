'use client'

import { createContext, useContext } from 'react'

// why: ADR-0019 amendment 2026-05-08 + ADR-0022 commitment 3 — workflow
// features read which layer they operate on from a route-provided context,
// never via path-sniffing. Carries data ('md' | 'shadcn'), not primitive
// identity — runtime primitive switching stays banned (ADR-0019 commitment 4).
export type Layer = 'md' | 'shadcn'

const LayerContext = createContext<Layer | null>(null)

export function LayerProvider({ value, children }: { value: Layer; children: React.ReactNode }) {
  return (
    <LayerContext.Provider value={value}>
      <div className="flex min-h-screen size-full overflow-hidden relative">{children}</div>
    </LayerContext.Provider>
  )
}

export function useLayer(): Layer {
  const layer = useContext(LayerContext)
  if (layer === null) {
    throw new Error('useLayer must be used within a LayerProvider')
  }
  return layer
}
