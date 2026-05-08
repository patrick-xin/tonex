'use client'

import type { ExportOptions } from '@tonex/core'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { ExportTab } from './use-export-content'

// why: ADR-0021 commitment 6 — filter visibility is per-tab. md tabs (Tailwind)
// surface the full 4 tier filters + colorFormat; shadcn surfaces only the
// chart toggle + colorFormat (other tiers don't apply to the shadcn role
// surface). TS / JSON / Dart tabs return null because their formatters are
// stubs (slice 6).

interface ExportFiltersProps {
  tab: ExportTab
  options: ExportOptions
  onChange: (next: ExportOptions) => void
}

interface ToggleProps {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
}

function Toggle({ id, label, checked, onCheckedChange }: ToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} size="sm" checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="text-xs cursor-pointer select-none">
        {label}
      </Label>
    </div>
  )
}

export function ExportFilters({ tab, options, onChange }: ExportFiltersProps) {
  if (tab !== 'Tailwind' && tab !== 'shadcn') return null

  const set = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) =>
    onChange({ ...options, [key]: value })

  // why: lean defaults are absent from the options object (undefined === false
  // for include flags, undefined === 'oklch' for colorFormat). The toggle's
  // `checked` prop reads with `?? false` so the surfaced state matches what
  // exportCss interprets.
  const fmt = options.colorFormat ?? 'oklch'

  return (
    <div className="border-b border-outline-variant px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-on-surface-variant">Format</Label>
        <Toggle
          id="export-format-hex"
          label={fmt === 'hex' ? 'hex' : 'oklch'}
          checked={fmt === 'hex'}
          onCheckedChange={(next) => set('colorFormat', next ? 'hex' : 'oklch')}
        />
      </div>
      {tab === 'Tailwind' && (
        <Toggle
          id="export-include-extended"
          label="Extended"
          checked={options.includeExtended ?? false}
          onCheckedChange={(next) => set('includeExtended', next)}
        />
      )}
      {tab === 'Tailwind' && (
        <Toggle
          id="export-include-palette"
          label="Palette"
          checked={options.includePalette ?? false}
          onCheckedChange={(next) => set('includePalette', next)}
        />
      )}
      <Toggle
        id="export-include-chart"
        label="Chart"
        checked={options.includeChart ?? false}
        onCheckedChange={(next) => set('includeChart', next)}
      />
      {tab === 'Tailwind' && (
        <Toggle
          id="export-include-contrast"
          label="Contrast variants"
          checked={options.includeContrastVariants ?? false}
          onCheckedChange={(next) => set('includeContrastVariants', next)}
        />
      )}
    </div>
  )
}
