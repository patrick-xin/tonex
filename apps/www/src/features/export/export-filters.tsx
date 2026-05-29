'use client'

import type { ExportOptions, Mode } from '@tonex/core'
import { useEffect, useState } from 'react'
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { ExportTab } from './use-export-content'

type IncludeKey =
  | 'includeExtended'
  | 'includePalette'
  | 'includeChart'
  | 'includeContrastVariants'
  | 'includeHeader'
  | 'mdSysPrefix'

interface OptionMeta {
  key: IncludeKey
  label: string
  description: string
  defaultOn?: boolean
}

const OPTION_META: Record<IncludeKey, OptionMeta> = {
  includeExtended: {
    key: 'includeExtended',
    label: 'Extended roles',
    description: 'Surface tints and fixed color roles beyond the core set.',
  },
  includePalette: {
    key: 'includePalette',
    label: 'Tonal palettes',
    description: 'The full 0–100 tone ramp for each key color.',
  },
  includeChart: {
    key: 'includeChart',
    label: 'Chart colors',
    description: 'Color slots for data-visualization and charts.',
  },
  includeContrastVariants: {
    key: 'includeContrastVariants',
    label: 'Contrast tiers',
    description: 'Medium and high-contrast variants alongside the default.',
  },
  includeHeader: {
    key: 'includeHeader',
    label: 'Project bootstrap',
    description: 'Include @import and @theme header for a fresh project.',
  },
  mdSysPrefix: {
    key: 'mdSysPrefix',
    label: 'Spec prefix',
    description: 'Emit --md-sys-color-* names (off = bare --color-*).',
    defaultOn: true,
  },
}

const INCLUDES_BY_TAB: Partial<Record<ExportTab, readonly IncludeKey[]>> = {
  Tailwind: ['includeExtended', 'includePalette', 'includeChart', 'includeContrastVariants'],
  CSS: ['mdSysPrefix', 'includeExtended', 'includeChart', 'includeContrastVariants'],
  shadcn: ['includeChart', 'includeHeader'],
  JSON: ['includeExtended', 'includeChart', 'includePalette', 'includeContrastVariants'],
  Dart: ['includeChart', 'includePalette', 'includeContrastVariants'],
}

const FORMAT_TABS: ReadonlySet<ExportTab> = new Set<ExportTab>([
  'Tailwind',
  'CSS',
  'shadcn',
  'JSON',
])

// why: DESIGN.md has no light/dark axis (the format carries one set of colors),
// so its tab picks a single mode where the CSS tabs co-emit both. No other tab
// needs the chooser; Design.md is also absent from FORMAT_TABS (it is hex-only,
// so the oklch/hex chooser would be a no-op).
const MODE_TABS: ReadonlySet<ExportTab> = new Set<ExportTab>(['Design.md'])

function isOn(meta: OptionMeta, options: ExportOptions): boolean {
  return meta.defaultOn ? options[meta.key] !== false : options[meta.key] === true
}

function countOn(tab: ExportTab, options: ExportOptions): number {
  const keys = INCLUDES_BY_TAB[tab] ?? []
  return keys.filter((k) => isOn(OPTION_META[k], options)).length
}

export function tabHasOptions(tab: ExportTab): boolean {
  return (INCLUDES_BY_TAB[tab]?.length ?? 0) > 0
}

export function tabSupportsFormat(tab: ExportTab): boolean {
  return FORMAT_TABS.has(tab)
}

export function tabUsesMode(tab: ExportTab): boolean {
  return MODE_TABS.has(tab)
}

// why: single-mode picker for the Design.md tab, sitting in the same header
// slot as ExportFormatChooser (the two are mutually exclusive — Design.md is
// not a FORMAT_TAB). Mirrors the oklch/hex toggle's shape so the header reads
// consistently.
export function ExportModeChooser({
  mode,
  onChange,
}: {
  mode: Mode
  onChange: (mode: Mode) => void
}) {
  return (
    <ToggleGroup
      variant="outline"
      size="xs"
      aria-label="Export mode"
      value={[mode]}
      onValueChange={(next) => onChange((next[0] ?? mode) as Mode)}
    >
      <ToggleGroupItem value="light">light</ToggleGroupItem>
      <ToggleGroupItem value="dark">dark</ToggleGroupItem>
    </ToggleGroup>
  )
}

export function ExportFormatChooser({
  options,
  onChange,
}: {
  options: ExportOptions
  onChange: (next: ExportOptions) => void
}) {
  const fmt = options.colorFormat ?? 'oklch'
  return (
    <ToggleGroup
      variant="outline"
      size="xs"
      aria-label="Color format"
      value={[fmt]}
      onValueChange={(next) =>
        onChange({ ...options, colorFormat: (next[0] ?? 'oklch') as 'oklch' | 'hex' })
      }
    >
      <ToggleGroupItem value="oklch">oklch</ToggleGroupItem>
      <ToggleGroupItem value="hex">hex</ToggleGroupItem>
    </ToggleGroup>
  )
}

interface ExportFiltersProps {
  tab: ExportTab
  options: ExportOptions
  onChange: (next: ExportOptions) => void
}

// why: the rail reflows at lg (the grid's `lg:grid-cols-[…]` breakpoint, the
// 1024px Tailwind default) — neither useIsMobile (768) nor useIsRailVisible
// (640) gates there. Base UI's Collapsible is JS-controlled, so the lg
// force-open can't be CSS-only (the panel hides/unmounts when closed); this
// gate drives `open` directly while the disclosure trigger stays `lg:hidden`.
const LG_BREAKPOINT = 1024

function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    const onChange = () => setIsDesktop(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return isDesktop
}

export function ExportFilters({ tab, options, onChange }: ExportFiltersProps) {
  const isDesktop = useIsDesktop()
  const [userOpen, setUserOpen] = useState(false)
  const keys = INCLUDES_BY_TAB[tab] ?? []
  if (keys.length === 0) return null

  const set = (k: IncludeKey, v: boolean) => onChange({ ...options, [k]: v })
  const n = countOn(tab, options)
  // why: open whenever desktop (trigger is hidden there) or the user expanded
  // the disclosure on mobile.
  const open = isDesktop || userOpen

  return (
    <aside className="flex min-h-0 flex-col overflow-y-auto border-b border-outline-variant/40 p-4 lg:border-r lg:border-b-0">
      <Collapsible open={open} onOpenChange={setUserOpen} className="flex min-h-0 flex-col">
        {/* Mobile-only disclosure; force-open at lg+ via useIsDesktop. */}
        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm text-on-surface lg:hidden">
          <span>
            Including{' '}
            <span className="font-medium">
              {n} of {keys.length}
            </span>{' '}
            optional sections
          </span>
          <span className="text-xs font-medium text-primary">{open ? 'Hide' : 'Customize'}</span>
        </CollapsibleTrigger>
        <div className="mb-2 hidden text-sm font-medium uppercase tracking-wide lg:block">
          Include in export
        </div>
        <CollapsiblePanel>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 pt-3 sm:grid-cols-2 lg:grid-cols-1 lg:pt-0">
            {keys.map((k) => {
              const m = OPTION_META[k]
              return (
                <Field key={k} name={k} className="flex-col items-start gap-1">
                  <div className="flex w-full items-center justify-between gap-2">
                    <FieldLabel className="text-sm font-medium">{m.label}</FieldLabel>
                    <Switch
                      size="sm"
                      checked={isOn(m, options)}
                      onCheckedChange={(v) => set(k, v)}
                    />
                  </div>
                  <span className="text-xs leading-snug text-on-surface-variant">
                    {m.description}
                  </span>
                </Field>
              )
            })}
          </div>
        </CollapsiblePanel>
      </Collapsible>
    </aside>
  )
}
