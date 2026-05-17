'use client'

import { useResolvedTokens } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { toast } from '@/components/ui/toast'
import { useActiveMode } from '@/features/theme-mode'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

type RoleSuffix = string

interface Pair {
  bg: RoleSuffix
  fg: RoleSuffix
}

type Item = Pair | RoleSuffix

interface Group {
  label: string
  core?: ReadonlyArray<Item>
  extended?: ReadonlyArray<Item>
}

const GROUPS: ReadonlyArray<Group> = [
  {
    label: 'Primary',
    core: [
      { bg: 'primary', fg: 'on-primary' },
      { bg: 'primary-container', fg: 'on-primary-container' },
    ],
    extended: [
      { bg: 'primary-fixed', fg: 'on-primary-fixed' },
      { bg: 'primary-fixed-dim', fg: 'on-primary-fixed-variant' },
      'primary-dim',
    ],
  },
  {
    label: 'Secondary',
    core: [
      { bg: 'secondary', fg: 'on-secondary' },
      { bg: 'secondary-container', fg: 'on-secondary-container' },
    ],
    extended: [
      { bg: 'secondary-fixed', fg: 'on-secondary-fixed' },
      { bg: 'secondary-fixed-dim', fg: 'on-secondary-fixed-variant' },
      'secondary-dim',
    ],
  },
  {
    label: 'Tertiary',
    core: [
      { bg: 'tertiary', fg: 'on-tertiary' },
      { bg: 'tertiary-container', fg: 'on-tertiary-container' },
    ],
    extended: [
      { bg: 'tertiary-fixed', fg: 'on-tertiary-fixed' },
      { bg: 'tertiary-fixed-dim', fg: 'on-tertiary-fixed-variant' },
      'tertiary-dim',
    ],
  },
  {
    label: 'Error',
    core: [
      { bg: 'error', fg: 'on-error' },
      { bg: 'error-container', fg: 'on-error-container' },
    ],
    extended: ['error-dim'],
  },
  {
    label: 'Surface',
    core: [
      { bg: 'surface', fg: 'on-surface' },
      { bg: 'surface-container-highest', fg: 'on-surface-variant' },
      'surface-dim',
      'surface-bright',
      'surface-container-lowest',
      'surface-container-low',
      'surface-container',
      'surface-container-high',
    ],
    extended: ['surface-tint'],
  },
  {
    label: 'Outline',
    core: ['outline', 'outline-variant'],
  },
  {
    label: 'Inverse',
    extended: [{ bg: 'inverse-surface', fg: 'inverse-on-surface' }, 'inverse-primary'],
  },
  {
    label: 'Utility',
    extended: ['shadow', 'scrim'],
  },
]

function isPair(item: Item): item is Pair {
  return typeof item !== 'string'
}

function HexButton({ hex, className }: { hex: string; className?: string }) {
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => toast.success({ description: `${hex} has been copied to the clipboard` }),
  })
  return (
    <button
      type="button"
      onClick={() => copyToClipboard(hex)}
      className={cn(
        'text-xs font-mono uppercase cursor-pointer rounded-md px-1',
        focusVisiblePrimaryRing,
        className,
      )}
    >
      {hex}
    </button>
  )
}

function PairTile({ bg, fg, bgHex, fgHex }: Pair & { bgHex: string; fgHex: string }) {
  return (
    <div className="h-32 w-60 rounded-md overflow-hidden flex flex-col border border-outline-variant/40">
      <div
        className="h-2/3 p-3 text-sm font-medium leading-tight capitalize flex flex-col justify-end relative"
        style={{ backgroundColor: bgHex, color: fgHex }}
      >
        <HexButton hex={bgHex} className="absolute top-3 right-3" />
        {bg.replace(/-/g, ' ')}
      </div>
      <div
        className="h-1/3 px-3 py-2 text-sm font-medium leading-tight capitalize flex items-center justify-between"
        style={{ backgroundColor: fgHex, color: bgHex }}
      >
        <span>{fg.replace(/-/g, ' ')}</span>
        <HexButton hex={fgHex} />
      </div>
    </div>
  )
}

function SoloTile({ token, hex }: { token: RoleSuffix; hex: string }) {
  return (
    <div className="h-32 w-60 rounded-md overflow-hidden flex flex-col border border-outline-variant/40">
      <div
        className="h-2/3 p-3 flex flex-col justify-end rounded-md rounded-b-none border-outline-variant/40 relative"
        style={{ backgroundColor: hex }}
      >
        <HexButton hex={hex} className="absolute top-3 right-3" />
      </div>
      <div className="h-1/3 p-3 text-sm font-medium leading-tight capitalize flex flex-col justify-end border-t border-outline-variant/40 rounded-b-md">
        {token.replace(/-/g, ' ')}
      </div>
    </div>
  )
}

export function ColorRolesOverview() {
  const showExtended = useUiPrefs((s) => s.showExtended)
  const theme = useResolvedTokens()
  const mode = useActiveMode()

  if (theme === null || mode === null) return null
  const mdLayer = { ...theme.md[mode], ...theme.md[`${mode}Extended`] }
  const hexOf = (suffix: RoleSuffix): string => {
    const value = mdLayer[`--color-${suffix}` as keyof typeof mdLayer]
    return value === undefined ? '#000000' : hexString(value)
  }

  return (
    <div className="space-y-8 mx-auto">
      {GROUPS.map((group) => {
        const items = [...(group.core ?? []), ...(showExtended ? (group.extended ?? []) : [])]
        if (items.length === 0) return null
        return (
          <section key={group.label} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xl tracking-tight">{group.label}</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {items.map((item, i) =>
                isPair(item) ? (
                  <PairTile
                    key={`${group.label}-${String(i)}`}
                    {...item}
                    bgHex={hexOf(item.bg)}
                    fgHex={hexOf(item.fg)}
                  />
                ) : (
                  <SoloTile key={`${group.label}-${String(i)}`} token={item} hex={hexOf(item)} />
                ),
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
