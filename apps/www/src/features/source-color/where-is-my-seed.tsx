'use client'

import { selectSeedHex } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { useResolvedTokens, useSource } from '@tonex/core-react'
import { cn } from 'tailwind-variants'
import { useActiveMode } from '@/features/theme-mode'

// why: the "where's my seed?" explainer. A mid-tone seed lands on neither
// `primary` nor `primary-container` as the exact hex — the roles are re-toned for
// contrast (ADR-0032; the troubleshooting FAQ has the long answer), which
// surprises users who expect `primary` to BE their brand color. Rather than throw
// tone numbers at them, show it with swatches: the color you picked -> the
// `primary` it renders (same color, re-toned to stay legible) -> the brand
// override that pins the exact value when you truly need it. This is pure
// explanation over EXISTING state: it reads the seed and the derived primary,
// introduces no token machinery, and the "brand" swatch IS the seed (the override
// pins the literal value), which is the whole point — seed == brand, primary != seed.

function Step({
  color,
  label,
  pinned = false,
}: {
  color: string
  label: string
  pinned?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'size-7 rounded-md ring-1 ring-inset ring-outline-variant',
          pinned && 'ring-on-surface',
        )}
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] leading-none text-on-surface-variant">{label}</span>
    </div>
  )
}

export function WhereIsMySeed() {
  const seedHex = useSource(selectSeedHex)
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  // why: read the derived primary as an explicit hex (not a `var(--color-primary)`
  // that only resolves inside the preview scope) so the swatch is correct in the
  // rail too. Pre-hydration the theme is null — fall back to the seed so the row
  // still renders (it'll settle to the re-toned value once tokens resolve).
  const primaryArgb = theme && mode ? theme.md[mode]['--color-primary'] : undefined
  const primaryHex = primaryArgb === undefined ? seedHex : hexString(primaryArgb)

  return (
    <div className="space-y-2 px-2">
      <div className="flex items-end gap-2">
        <Step color={seedHex} label="you picked" />
        <span aria-hidden className="mb-3.5 text-on-surface-variant/60">
          →
        </span>
        <Step color={primaryHex} label="primary" />
        <span aria-hidden className="mb-3.5 text-on-surface-variant/60">
          →
        </span>
        <Step color={seedHex} label="brand" pinned />
      </div>
      <p className="text-xs leading-snug text-on-surface-variant">
        <code className="text-on-surface">primary</code> is your color re-toned to stay legible —
        not a different color. When you need the exact value, the{' '}
        <span className="text-on-surface">brand</span> override pins it.{' '}
        <a
          href="/docs/reference/troubleshooting#why-doesnt-primary-match-the-color-i-picked"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-on-surface"
        >
          Why?
        </a>
      </p>
    </div>
  )
}
