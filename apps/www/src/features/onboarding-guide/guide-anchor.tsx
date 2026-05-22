'use client'

import * as React from 'react'
import { useGuideOptional } from './guide-context'

// why: lets a server-rendered control opt into the tour registry without
// becoming a client component itself — wrap the section, pass the key the step
// references. Registers on mount via a ref callback, deregisters on unmount.
// Optional context: outside a GuideProvider it's an inert passthrough.
export function GuideAnchor({
  anchorKey,
  className,
  children,
}: {
  anchorKey: string
  className?: string
  children: React.ReactNode
}) {
  const guide = useGuideOptional()

  const ref = React.useCallback(
    (el: HTMLElement | null) => {
      guide?.registerAnchor(anchorKey, el)
    },
    [guide, anchorKey],
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
