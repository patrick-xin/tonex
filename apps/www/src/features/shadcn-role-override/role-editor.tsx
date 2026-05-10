'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { evaluateThemeContrast, type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import type { ShadcnRoleName } from '@tonex/core/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TwColorPicker } from '@/features/tw-color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { ColorPicker } from '../color-picker'
import { shadcnRoleDisplayName } from './contrast-utils'
import { MdSnapshotPicker } from './md-snapshot-picker'

interface RoleEditorProps {
  role: ShadcnRoleName
  mode: Mode
}

// why: ADR-0026 c.6 — picker affordances are UI-side; storage is always hex.
// All four sources (hex input, native picker, TW palette, MD snapshot picker)
// funnel into one setter: setShadcnRoleOverride. The MD picker tabs roles vs
// palette tones; selecting either snapshots the *current resolved hex* into
// the override rather than tracking the source symbolically — that would be a
// binding, not an override.
export function RoleEditor({ role, mode }: RoleEditorProps) {
  const theme = useResolvedTokens()
  const overrides = useSource((s) => s.shadcnRoleOverrides[mode])
  const setOverride = useSource((s) => s.actions.setShadcnRoleOverride)

  const overridden = role in overrides
  const argb = theme?.shadcn[mode][role]
  // why: '#000000' fallback fires only if theme is null (popover re-render
  // pre-hydration) or the role somehow drops out of the closed enum — visual
  // sentinel, not a state the user reaches.
  const currentHex = argb !== undefined ? hexString(argb) : '#000000'

  const { hexInput, handleChange, inputProps } = useHexFieldState(currentHex, (h) =>
    setOverride(mode, role, h),
  )

  // why: same ContrastReport the parent list reads — single memoized walk per
  // theme reference (ADR-0025 c.8). Find the shadcn pair that mentions this
  // role; the partner is the other slot. May be undefined for roles outside
  // CONTRAST_PAIRS (edges, sidebar utilities).
  const result =
    theme !== null
      ? evaluateThemeContrast(theme)[mode].find(
          (r) => r.pair.layer === 'shadcn' && (r.pair.fg === role || r.pair.bg === role),
        )
      : undefined
  const partner =
    result === undefined
      ? null
      : ((result.pair.fg === role ? result.pair.bg : result.pair.fg) as ShadcnRoleName)
  const ratio = result?.ratio ?? null
  const passesAA = result?.passes ?? false

  return (
    <div className="flex flex-col gap-3 min-w-72">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-mono">{shadcnRoleDisplayName(role)}</Label>
        {overridden && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setOverride(mode, role, null)}
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
          onChange={(h) => setOverride(mode, role, h)}
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
        <TwColorPicker currentColor={currentHex} onSelect={(h) => setOverride(mode, role, h)} />
        <MdSnapshotPicker mode={mode} onSnapshot={(h) => setOverride(mode, role, h)} />
      </div>

      {ratio !== null && partner !== null && (
        <div className="flex items-center justify-between text-xs font-medium">
          <span>vs {shadcnRoleDisplayName(partner)}</span>
          <span className={passesAA ? 'text-on-surface' : 'text-error'}>
            {ratio.toFixed(1)}:1 {passesAA ? 'AA' : 'Fail'}
          </span>
        </div>
      )}
    </div>
  )
}
