'use client'

import { deriveTheme } from '@tonex/core'
import { oklchString } from '@tonex/core/oklch'
import type { PortableTheme } from '@tonex/core/schema'
import type { VariantName } from '@tonex/core/variants'
import { selectPortable, useSource } from '@tonex/core-react'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

// why: the wrapper is `display:contents`, so it adds no layout box but its
// scoped custom properties still cascade in. Both light and dark blocks are
// emitted so the subtree flips correctly with `.dark`.
//
// why: the module cache holds one derived result per knob set, keyed against a
// signature of the live source — a seed change recomputes that entry in place
// (replaced, never appended, so a live-dragging landing page can't grow the cache).

type Overrides = Partial<PortableTheme>

const cache = new Map<string, { sig: string; css: string }>()

function declarations(tokens: Record<string, number>): string {
  return Object.entries(tokens)
    .map(([name, argb]) => `${name}:${oklchString(argb)}`)
    .join(';')
}

// Stable, order-independent serialization of a knob set.
function canonical(overrides: Overrides): string {
  const sorted = Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b))
  return JSON.stringify(Object.fromEntries(sorted))
}

// Short deterministic hash → a valid, collision-resistant scope token.
function hash(input: string): string {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

function scopedCss(source: PortableTheme, overrides: Overrides, scope: string): string {
  const sig = JSON.stringify(source)
  const hit = cache.get(scope)
  if (hit && hit.sig === sig) return hit.css

  const theme = deriveTheme({ ...source, ...overrides })
  const light = { ...theme.md.light, ...theme.md.lightExtended }
  const dark = { ...theme.md.dark, ...theme.md.darkExtended }
  const sel = `[data-tonex-scope="${scope}"]`
  const css = `${sel}{${declarations(light)}}html.dark ${sel}{${declarations(dark)}}`
  cache.set(scope, { sig, css })
  return css
}

export function ScopedTheme({
  overrides,
  children,
}: {
  overrides: Overrides
  children: React.ReactNode
}) {
  const source = useSource(useShallow(selectPortable))
  // A readable prefix (the variant, when present) plus a hash of the full knob
  // set — siblings with identical knobs share the scope, so they share the cache.
  const scope = useMemo(() => {
    const key = canonical(overrides)
    return `${overrides.variant ? `${overrides.variant}-` : ''}${hash(key)}`
  }, [overrides])
  const css = useMemo(() => scopedCss(source, overrides, scope), [source, overrides, scope])

  return (
    <div data-tonex-scope={scope} className="contents">
      <style>{css}</style>
      {children}
    </div>
  )
}

/** Convenience wrapper for the common case: scope a subtree to one variant. */
export function ScopedVariant({
  variant,
  children,
}: {
  variant: VariantName
  children: React.ReactNode
}) {
  const overrides = useMemo<Overrides>(() => ({ variant }), [variant])
  return <ScopedTheme overrides={overrides}>{children}</ScopedTheme>
}
