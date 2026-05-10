'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { evaluateThemeContrast, type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import {
  MD_PALETTE_FAMILY_NAMES,
  MD_PALETTE_TONE_NAMES,
  MD_TOKEN_NAMES,
  type MdTokenName,
  type ShadcnRoleName,
} from '@tonex/core/schema'
import { useState } from 'react'
import { NativeColorInput } from '@/components/shared/native-color-input'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInputGroupContent,
  ComboboxItemContent,
  ComboboxList,
} from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TwColorPicker } from '@/features/tw-color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { shadcnRoleDisplayName } from './contrast-utils'

interface SnapshotItem {
  label: string
  value: string
}

const MD_TOKEN_ITEMS: ReadonlyArray<SnapshotItem> = MD_TOKEN_NAMES.map((t) => ({
  label: t.slice('--color-'.length),
  value: t,
}))

const PALETTE_TONE_ITEMS: ReadonlyArray<SnapshotItem> = MD_PALETTE_FAMILY_NAMES.flatMap((family) =>
  MD_PALETTE_TONE_NAMES.map((tone) => ({
    label: `${family}-${tone}`,
    value: `--md-ref-palette-${family}-${tone}`,
  })),
)

interface RoleEditorProps {
  role: ShadcnRoleName
  mode: Mode
}

// why: ADR-0026 c.6 — picker affordances are UI-side; storage is always hex.
// All five sources (hex input, native picker, TW palette, MD-token combobox,
// MD-palette-tone combobox) funnel into one setter: setShadcnRoleOverride.
// Selecting an MD token / palette tone snapshots its *current resolved hex*
// rather than tracking the source symbolically — that would be a binding,
// not an override. The MD-token picker therefore reads the post-override
// merged md layer (theme.md[mode] + lightExtended/darkExtended) so the
// snapshot reflects what the user sees right now. Palette tones live on
// theme.md.palette and are mode/contrast-invariant.
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

  // why: snapshot pickers never persist their selection (the value axis is
  // `shadcnRoleOverrides`, not the chosen md token). We control inputValue and
  // reset it after select so the input clears and the user can re-snapshot the
  // same source after editing the seed.
  const [mdQuery, setMdQuery] = useState('')
  const [toneQuery, setToneQuery] = useState('')

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

  // why: snapshot helpers project an md/palette argb into the override hex.
  // No-op if theme isn't ready — the popover wouldn't render past null gate
  // upstream, but the guard keeps types honest.
  const snapshotMdToken = (item: SnapshotItem | null) => {
    if (item === null || theme === null) return
    const merged = { ...theme.md[mode], ...theme.md[`${mode}Extended`] }
    const tokenArgb = merged[item.value as MdTokenName]
    setMdQuery('')
    if (tokenArgb === undefined) return
    setOverride(mode, role, hexString(tokenArgb))
  }
  const snapshotPaletteTone = (item: SnapshotItem | null) => {
    if (item === null || theme === null) return
    const tokenArgb = theme.md.palette[item.value]
    setToneQuery('')
    if (tokenArgb === undefined) return
    setOverride(mode, role, hexString(tokenArgb))
  }

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

      <div className="flex flex-col gap-2">
        <Combobox<SnapshotItem>
          items={MD_TOKEN_ITEMS}
          value={null}
          inputValue={mdQuery}
          onInputValueChange={setMdQuery}
          itemToStringLabel={(item) => item?.label ?? ''}
          onValueChange={snapshotMdToken}
        >
          <ComboboxInputGroupContent
            actionsMode="trigger"
            inputSize="sm"
            placeholder="Pick from MD token…"
            className="font-mono text-xs"
          />
          <ComboboxContent>
            <ComboboxEmpty>No token found.</ComboboxEmpty>
            <ComboboxList>
              {(item: SnapshotItem) => (
                <ComboboxItemContent key={item.value} value={item}>
                  <span className="font-mono text-xs">{item.label}</span>
                </ComboboxItemContent>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <Combobox<SnapshotItem>
          items={PALETTE_TONE_ITEMS}
          value={null}
          inputValue={toneQuery}
          onInputValueChange={setToneQuery}
          itemToStringLabel={(item) => item?.label ?? ''}
          onValueChange={snapshotPaletteTone}
        >
          <ComboboxInputGroupContent
            actionsMode="trigger"
            inputSize="sm"
            placeholder="Pick from palette tone…"
            className="font-mono text-xs"
          />
          <ComboboxContent>
            <ComboboxEmpty>No tone found.</ComboboxEmpty>
            <ComboboxList>
              {(item: SnapshotItem) => (
                <ComboboxItemContent key={item.value} value={item}>
                  <span className="font-mono text-xs">{item.label}</span>
                </ComboboxItemContent>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
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
