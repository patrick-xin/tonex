'use client'

import type { ExportOptions } from '@tonex/core'
import { Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { ExportTab } from './use-export-content'

// why: ADR-0021 commitment 6 — filter visibility is per-tab. Tailwind tab
// surfaces the full tier filters (Extended, Palette, Chart, Contrast);
// shadcn surfaces Chart + New project. TS / JSON / Dart tabs return null
// since their formatters are stubs.
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

export function ExportFilters({ tab, options, onChange }: ExportFiltersProps) {
  if (tab !== 'Tailwind' && tab !== 'shadcn') return null

  const fmt = options.colorFormat ?? 'oklch'
  const items = tab === 'Tailwind' ? TAILWIND_INCLUDES : SHADCN_INCLUDES

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
