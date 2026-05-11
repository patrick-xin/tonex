'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import type { ShadcnChartTokenName } from '@tonex/core/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TwColorPicker } from '@/features/tw-color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { ColorPicker } from '../color-picker'
import { MdSnapshotPicker } from '../shadcn-role-override/md-snapshot-picker'
import { shadcnChartDisplayName } from './display-name'

interface ChartEditorProps {
  token: ShadcnChartTokenName
  mode: Mode
}

// why: ADR-0027 slice chart-3 — chart override editor. Mirrors RoleEditor's
// four-source picker funnel (hex input, native picker, TW palette, MD
// snapshot picker) but writes through `setShadcnChartOverride` and reads
// `theme.shadcn.lightChart`/`darkChart`. MdSnapshotPicker is reused as-is
// since its `onSnapshot` callback receives a hex string — token-domain
// agnostic. No contrast-pair section: chart pairs are not yet in
// CONTRAST_PAIRS (ADR-0027 c.6 — "where applicable", ADR-0025 c.8 extension
// is a separate slice).
export function ChartEditor({ token, mode }: ChartEditorProps) {
  const theme = useResolvedTokens()
  const overrides = useSource((s) => s.shadcnChartOverrides[mode])
  const setOverride = useSource((s) => s.actions.setShadcnChartOverride)

  const overridden = token in overrides
  const chartLayer = mode === 'light' ? theme?.shadcn.lightChart : theme?.shadcn.darkChart
  const argb = chartLayer?.[token]
  // why: '#000000' fallback fires only if theme is null (popover re-render
  // pre-hydration) or the token somehow drops out of the closed enum.
  const currentHex = argb !== undefined ? hexString(argb) : '#000000'

  const { hexInput, handleChange, inputProps } = useHexFieldState(currentHex, (h) =>
    setOverride(mode, token, h),
  )

  return (
    <div className="flex flex-col gap-3 min-w-72">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-mono">{shadcnChartDisplayName(token)}</Label>
        {overridden && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setOverride(mode, token, null)}
            title="Reset override"
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ColorPicker
          align="start"
          value={currentHex}
          onChange={(h) => setOverride(mode, token, h)}
        />
        <Input
          autoFocus
          className="font-mono flex-1"
          inputSize="sm"
          type="text"
          value={hexInput}
          onChange={(e) => handleChange(e.target.value)}
          {...inputProps}
          maxLength={7}
          spellCheck={false}
          placeholder="#000000"
        />
        <TwColorPicker currentColor={currentHex} onSelect={(h) => setOverride(mode, token, h)} />
        <MdSnapshotPicker mode={mode} onSnapshot={(h) => setOverride(mode, token, h)} />
      </div>
    </div>
  )
}
