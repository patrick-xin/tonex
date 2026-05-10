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
import { ChevronsUpDown } from 'lucide-react'
import { NativeColorInput } from '@/components/shared/native-color-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItemContent,
  SelectTriggerGroup,
} from '@/components/ui/select'
import { TwColorPicker } from '@/features/tw-color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { shadcnRoleDisplayName } from './contrast-utils'

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
  const snapshotMdToken = (token: MdTokenName) => {
    if (theme === null) return
    const merged = { ...theme.md[mode], ...theme.md[`${mode}Extended`] }
    const tokenArgb = merged[token]
    if (tokenArgb === undefined) return
    setOverride(mode, role, hexString(tokenArgb))
  }
  const snapshotPaletteTone = (paletteToken: string) => {
    if (theme === null) return
    const tokenArgb = theme.md.palette[paletteToken]
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

      <div className="flex flex-col gap-1.5">
        <Label className="text-[11px] uppercase tracking-wide text-on-surface-variant">
          Snapshot from
        </Label>
        <div className="flex gap-2">
          <Select
            items={MD_TOKEN_NAMES.map((t) => ({ label: t.slice('--color-'.length), value: t }))}
            // why: snapshot pickers never persist their selection — the value
            // axis is `shadcnRoleOverrides`, not the chosen md token. Leaving
            // value undefined renders the placeholder each open so the user
            // can re-snapshot the same source after editing the seed.
            onValueChange={(v) => snapshotMdToken(v as MdTokenName)}
          >
            <SelectTriggerGroup
              indicatorIcon={<ChevronsUpDown className="size-3.5" />}
              size="sm"
              variant="outline"
              className="flex-1 text-xs px-2"
              placeholder="MD token"
            />
            <SelectContent align="start">
              {MD_TOKEN_NAMES.map((token) => (
                <SelectItemContent key={token} value={token}>
                  <span className="font-mono text-xs">{token.slice('--color-'.length)}</span>
                </SelectItemContent>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={MD_PALETTE_FAMILY_NAMES.flatMap((family) =>
              MD_PALETTE_TONE_NAMES.map((tone) => ({
                label: `${family}-${tone}`,
                value: `--md-ref-palette-${family}-${tone}`,
              })),
            )}
            onValueChange={(v) => snapshotPaletteTone(v as string)}
          >
            <SelectTriggerGroup
              indicatorIcon={<ChevronsUpDown className="size-3.5" />}
              size="sm"
              variant="outline"
              className="flex-1 text-xs px-2"
              placeholder="Tone"
            />
            <SelectContent align="start">
              {MD_PALETTE_FAMILY_NAMES.flatMap((family) =>
                MD_PALETTE_TONE_NAMES.map((tone) => {
                  const value = `--md-ref-palette-${family}-${tone}`
                  return (
                    <SelectItemContent key={value} value={value}>
                      <span className="font-mono text-xs">
                        {family}-{tone}
                      </span>
                    </SelectItemContent>
                  )
                }),
              )}
            </SelectContent>
          </Select>
        </div>
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
