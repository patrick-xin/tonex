'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import type { MdTokenName } from '@tonex/core/schema'
import { NativeColorInput } from '@/components/shared/native-color-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TwColorPicker } from '@/features/tw-color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { AA_THRESHOLD, contrastRatio, ROLE_CONTRAST_PAIRS, roleDisplayName } from './contrast-utils'

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
  const currentHex = argb !== undefined ? hexString(argb) : '#000000'

  const { hexInput, handleChange, inputProps } = useHexFieldState(currentHex, (h) =>
    setOverride(mode, role, h),
  )

  const fgPair = ROLE_CONTRAST_PAIRS.find(([fg]) => fg === role)
  const bgPair = ROLE_CONTRAST_PAIRS.find(([, bg]) => bg === role)
  const partner = fgPair?.[1] ?? bgPair?.[0] ?? null
  const partnerArgb = partner !== null ? mdLayer?.[partner] : undefined
  const partnerHex = partnerArgb !== undefined ? hexString(partnerArgb) : null
  const ratio =
    partnerHex !== null && /^#[0-9a-fA-F]{6}$/.test(currentHex)
      ? contrastRatio(currentHex, partnerHex)
      : null
  const passesAA = ratio !== null && ratio >= AA_THRESHOLD

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-mono">{roleDisplayName(role)}</Label>
        {overridden && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setOverride(mode, role, null)}
            title="Reset to MCU"
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <NativeColorInput
          className="size-8"
          currentHex={currentHex}
          onColorChange={(h) => setOverride(mode, role, h)}
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
