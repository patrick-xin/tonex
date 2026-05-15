'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { evaluateThemeContrast, type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import type { MdTokenName } from '@tonex/core/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from '@/features/color-picker'
import { TwColorPicker } from '@/features/tw-color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { roleDisplayName } from './contrast-utils'

interface RoleEditorProps {
  role: MdTokenName
  mode: Mode
}

export function RoleEditor({ role, mode }: RoleEditorProps) {
  const theme = useResolvedTokens()
  const overrides = useSource((s) => s.md3TokenOverrides[mode])
  const setOverride = useSource((s) => s.actions.setMd3TokenOverride)

  const overridden = role in overrides
  // why: merge core + extended sub-maps — theme.md[mode] holds only the 28
  // core tokens, extended tokens live in lightExtended/darkExtended. Editor
  // accepts any MdTokenName, so it must read from both. theme is non-null
  // here: Popover only opens after mount, parent gated on hydration.
  const mdLayer = theme !== null ? { ...theme.md[mode], ...theme.md[`${mode}Extended`] } : null
  const argb = mdLayer?.[role]
  // why: '#000000' fallback fires only if mdLayer is null (theme not yet
  // hydrated when popover renders) or the token slips out of schema rotation —
  // both are visual-sentinel paths, not states the user should reach.
  const currentHex = argb !== undefined ? hexString(argb) : '#000000'

  const { hexInput, handleChange, inputProps } = useHexFieldState(currentHex, (h) =>
    setOverride(mode, role, h),
  )

  // why: same ContrastReport the parent list reads — single memoized walk per
  // theme reference. Find the md pair that mentions this role in either slot;
  // the partner is the other slot.
  const result =
    theme !== null
      ? evaluateThemeContrast(theme)[mode].find(
          (r) => r.pair.layer === 'md' && (r.pair.fg === role || r.pair.bg === role),
        )
      : undefined
  const partner =
    result === undefined
      ? null
      : ((result.pair.fg === role ? result.pair.bg : result.pair.fg) as MdTokenName)
  const ratio = result?.ratio ?? null
  const passesAA = result?.passes ?? false

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-mono">{roleDisplayName(role)}</Label>
        {overridden && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setOverride(mode, role, null)}
            title="Reset role"
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ColorPicker
          value={currentHex}
          onChange={(h) => setOverride(mode, role, h)}
          align="start"
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
      </div>

      <div className="h-8 rounded-md" style={{ backgroundColor: currentHex }} />

      {ratio !== null && partner !== null && (
        <div className="flex items-center justify-between text-xs font-medium">
          <span>vs {roleDisplayName(partner)}</span>
          <span className={passesAA ? 'text-on-surface' : 'text-error'}>
            {ratio.toFixed(1)}:1 {passesAA ? 'AA' : 'Fail'}
          </span>
        </div>
      )}
    </div>
  )
}
