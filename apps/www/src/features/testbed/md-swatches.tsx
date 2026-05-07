'use client'

import type { TokenMap } from '@tonex/core'
import { useResolvedTokens } from '@tonex/core'
import { useActiveMode } from '../use-active-mode'

// why: sink is the dev surface for verifying that every md token deriveTheme
// emits actually resolves through the .md scope class. Grouped by family so
// regressions in any one group (e.g. fixed colors going stale, inverse tokens
// not flipping across modes) surface visually. The 'utilities' note on each
// row pins the tailwind class that would consume the token at the use site —
// if a class is missing from globals.css `@theme inline`, the swatch renders
// as transparent text-on-background and the gap is obvious.

interface SwatchRow {
  bg: string
  fg: string
  label: string
}

interface SwatchGroup {
  title: string
  rows: SwatchRow[]
}

const GROUPS: SwatchGroup[] = [
  {
    title: 'primary',
    rows: [
      { bg: '--color-primary', fg: '--color-on-primary', label: 'primary / on-primary' },
      {
        bg: '--color-primary-container',
        fg: '--color-on-primary-container',
        label: 'primary-container / on-primary-container',
      },
      {
        bg: '--color-primary-fixed',
        fg: '--color-on-primary-fixed',
        label: 'primary-fixed / on-primary-fixed',
      },
      {
        bg: '--color-primary-fixed-dim',
        fg: '--color-on-primary-fixed-variant',
        label: 'primary-fixed-dim / on-primary-fixed-variant',
      },
      { bg: '--color-primary-dim', fg: '--color-on-primary', label: 'primary-dim (cmf ≡ primary)' },
    ],
  },
  {
    title: 'secondary',
    rows: [
      { bg: '--color-secondary', fg: '--color-on-secondary', label: 'secondary / on-secondary' },
      {
        bg: '--color-secondary-container',
        fg: '--color-on-secondary-container',
        label: 'secondary-container / on-secondary-container',
      },
      {
        bg: '--color-secondary-fixed',
        fg: '--color-on-secondary-fixed',
        label: 'secondary-fixed / on-secondary-fixed',
      },
      {
        bg: '--color-secondary-fixed-dim',
        fg: '--color-on-secondary-fixed-variant',
        label: 'secondary-fixed-dim / on-secondary-fixed-variant',
      },
      {
        bg: '--color-secondary-dim',
        fg: '--color-on-secondary',
        label: 'secondary-dim (cmf ≡ secondary)',
      },
    ],
  },
  {
    title: 'tertiary',
    rows: [
      { bg: '--color-tertiary', fg: '--color-on-tertiary', label: 'tertiary / on-tertiary' },
      {
        bg: '--color-tertiary-container',
        fg: '--color-on-tertiary-container',
        label: 'tertiary-container / on-tertiary-container',
      },
      {
        bg: '--color-tertiary-fixed',
        fg: '--color-on-tertiary-fixed',
        label: 'tertiary-fixed / on-tertiary-fixed',
      },
      {
        bg: '--color-tertiary-fixed-dim',
        fg: '--color-on-tertiary-fixed-variant',
        label: 'tertiary-fixed-dim / on-tertiary-fixed-variant',
      },
      {
        bg: '--color-tertiary-dim',
        fg: '--color-on-tertiary',
        label: 'tertiary-dim (cmf ≡ tertiary)',
      },
    ],
  },
  {
    title: 'error',
    rows: [
      { bg: '--color-error', fg: '--color-on-error', label: 'error / on-error' },
      {
        bg: '--color-error-container',
        fg: '--color-on-error-container',
        label: 'error-container / on-error-container',
      },
      { bg: '--color-error-dim', fg: '--color-on-error', label: 'error-dim (cmf ≡ error)' },
    ],
  },
  {
    title: 'surface',
    rows: [
      { bg: '--color-surface', fg: '--color-on-surface', label: 'surface / on-surface' },
      {
        bg: '--color-surface-dim',
        fg: '--color-on-surface',
        label: 'surface-dim',
      },
      {
        bg: '--color-surface-bright',
        fg: '--color-on-surface',
        label: 'surface-bright',
      },
      {
        bg: '--color-surface-container-lowest',
        fg: '--color-on-surface',
        label: 'surface-container-lowest',
      },
      {
        bg: '--color-surface-container-low',
        fg: '--color-on-surface',
        label: 'surface-container-low',
      },
      {
        bg: '--color-surface-container',
        fg: '--color-on-surface',
        label: 'surface-container',
      },
      {
        bg: '--color-surface-container-high',
        fg: '--color-on-surface-variant',
        label: 'surface-container-high (on-surface-variant)',
      },
      {
        bg: '--color-surface-container-highest',
        fg: '--color-on-surface-variant',
        label: 'surface-container-highest',
      },
    ],
  },
  {
    title: 'inverse',
    rows: [
      {
        bg: '--color-inverse-surface',
        fg: '--color-inverse-on-surface',
        label: 'inverse-surface / inverse-on-surface',
      },
      {
        bg: '--color-inverse-surface',
        fg: '--color-inverse-primary',
        label: 'inverse-surface + inverse-primary text',
      },
    ],
  },
  {
    title: 'effects',
    rows: [
      {
        bg: '--color-surface-tint',
        fg: '--color-on-primary',
        label: 'surface-tint (= primary, drives elevation tinting)',
      },
      { bg: '--color-shadow', fg: '--color-on-primary', label: 'shadow (always #000)' },
      { bg: '--color-scrim', fg: '--color-on-primary', label: 'scrim (always #000)' },
    ],
  },
  {
    title: 'outline',
    rows: [
      { bg: '--color-outline', fg: '--color-on-surface', label: 'outline (border / input / ring)' },
      {
        bg: '--color-outline-variant',
        fg: '--color-on-surface',
        label: 'outline-variant (lower-emphasis dividers)',
      },
    ],
  },
]

function Swatch({ bg, fg, label, md }: SwatchRow & { md: TokenMap }) {
  const bgValue = md[bg]
  const fgValue = md[fg]
  return (
    <div
      className="p-3 rounded-md text-sm"
      style={{ backgroundColor: `var(${bg})`, color: `var(${fg})` }}
    >
      <div className="font-medium">{label}</div>
      <div className="text-[11px] opacity-80 mt-1 font-mono leading-tight">
        {bg}: {bgValue ?? '⚠ missing'}
        <br />
        {fg}: {fgValue ?? '⚠ missing'}
      </div>
    </div>
  )
}

export function MdSwatches() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  if (!theme || !mode) return null
  const md = theme.md[mode]
  return (
    <section className="grid gap-6">
      <header>
        <h2 className="text-lg font-medium">md scope ({mode})</h2>
        <p className="text-xs opacity-70">
          Every md token deriveTheme emits, grouped by family. Use this to verify new tokens resolve
          through the .md scope class and that fixed/dim/inverse families produce sensible values
          across variants.
        </p>
      </header>
      {GROUPS.map((group) => (
        <div key={group.title} className="grid gap-2">
          <h3 className="text-sm font-medium uppercase tracking-wide opacity-60">{group.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {group.rows.map((row) => (
              <Swatch key={row.label} {...row} md={md} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
