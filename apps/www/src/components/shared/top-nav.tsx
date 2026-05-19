import type * as React from 'react'
import type { Layer } from '@/lib/layer-context'
import { SiteLogo } from './site-logo'

// why: ADR-0022 surface feature — mobile header chrome. Desktop uses the rail
// for chrome; on mobile the rail is replaced by a drawer, and this slot owns
// the persistent title bar above the nav tabs. Layouts inject the layer's
// drawer as children and pass `layer` so the logo routes to the matching
// marketing page.
export function TopNav({ layer, children }: { layer: Layer; children?: React.ReactNode }) {
  return (
    <header className="flex h-12 items-center justify-between gap-2 px-2 sm:hidden flex-none border-b border-b-outline-variant/80">
      <SiteLogo layer={layer} />
      {children}
    </header>
  )
}
