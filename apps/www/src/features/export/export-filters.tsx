'use client'

import type { ExportOptions } from '@tonex/core'
import { Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { ExportTab } from './use-export-content'

// why: the option surface is shared across formats (ADR-0021 amendment
// 2026-05-20) and rendered once above the tab strip by export-button. This
// component renders the subset each tab can actually use: Tailwind gets the
// full tier filters (Extended, Palette, Chart, Contrast); shadcn gets Chart +
// New project; JSON gets Extended, Chart, Palette, Contrast — Chart rejoined in
// #89 (it has a natural slot in the MTB shape, ADR-0029), but `New project`
// stays off the JSON tab since the shadcn header has no JSON home and the
// formatter ignores it. TS / Dart are still stub formatters with no options, so
// they render nothing (#86).
//
// Layout: Format is a single-select chooser (oklch vs hex are mutually
// exclusive) so it stays a ToggleGroup. Include flags are independent
// booleans so each is its own Field+Switch pair — reads as a settings row
// rather than a multi-select chip strip and matches the Settings popover
// pattern.

interface ExportFiltersProps {
  tab: ExportTab
  options: ExportOptions
  onChange: (next: ExportOptions) => void
}

type IncludeKey =
  | 'includeExtended'
  | 'includePalette'
  | 'includeChart'
  | 'includeContrastVariants'
  | 'includeHeader'

interface IncludeItem {
  key: IncludeKey
  label: string
}

const TAILWIND_INCLUDES: readonly IncludeItem[] = [
  { key: 'includeExtended', label: 'Extended' },
  { key: 'includePalette', label: 'Palette' },
  { key: 'includeChart', label: 'Chart' },
  { key: 'includeContrastVariants', label: 'Contrast' },
] as const

const SHADCN_INCLUDES: readonly IncludeItem[] = [
  { key: 'includeChart', label: 'Chart' },
  { key: 'includeHeader', label: 'New project' },
] as const

// why: JSON honors color format + Extended / Chart / Palette / Contrast (the
// options with a natural home in the MTB shape). Chart rejoined the set in #89:
// chart is part of our wider roster, and the JSON formatter now merges it into
// each scheme just like Extended (ADR-0029 — wider roster lands in its natural
// slot). includeHeader stays omitted — it's the shadcn bootstrap incantation,
// with no JSON home — so offering it would be a toggle that changes nothing.
const JSON_INCLUDES: readonly IncludeItem[] = [
  { key: 'includeExtended', label: 'Extended' },
  { key: 'includeChart', label: 'Chart' },
  { key: 'includePalette', label: 'Palette' },
  { key: 'includeContrastVariants', label: 'Contrast' },
] as const

// why: per-tab subset lookup. A tab absent from this map (TS / Dart) has no
// tunable options, so the component renders nothing for it.
const INCLUDES_BY_TAB: Partial<Record<ExportTab, readonly IncludeItem[]>> = {
  Tailwind: TAILWIND_INCLUDES,
  shadcn: SHADCN_INCLUDES,
  JSON: JSON_INCLUDES,
}

export function ExportFilters({ tab, options, onChange }: ExportFiltersProps) {
  // why: TS / Dart formatters are stubs with no tunable options, so they map to
  // no subset and render nothing. JSON joined the option-aware tabs in #86.
  const items = INCLUDES_BY_TAB[tab]
  if (items === undefined) return null

  const fmt = options.colorFormat ?? 'oklch'

  const onFormatChange = (next: string[]) => {
    const value = (next[0] ?? 'oklch') as 'oklch' | 'hex'
    onChange({ ...options, colorFormat: value })
  }

  const setFlag = (key: IncludeKey, next: boolean) => {
    onChange({ ...options, [key]: next })
  }

  return (
    <div className="border-b border-outline-variant px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-on-surface-variant">Format</span>
        <ToggleGroup variant="outline" size="xs" value={[fmt]} onValueChange={onFormatChange}>
          <ToggleGroupItem value="oklch">oklch</ToggleGroupItem>
          <ToggleGroupItem value="hex">hex</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {items.map((it) => (
        <Field key={it.key} name={it.key}>
          <FieldLabel className="text-xs font-normal text-on-surface-variant gap-2">
            {it.label}
            <Switch
              size="sm"
              checked={options[it.key] === true}
              onCheckedChange={(v) => setFlag(it.key, v)}
            />
          </FieldLabel>
        </Field>
      ))}
    </div>
  )
}
