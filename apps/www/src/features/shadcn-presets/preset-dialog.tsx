'use client'

import { selectPortable, selectSeedHex, useSource } from '@tonex/core'
import { SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import { type ReactNode, useId, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import {
  createDialogHandle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioCard, RadioGroup } from '@/components/ui/radio'
import { applyShadcnPreset } from './apply'
import { isPresetSwitchDirty } from './predicate'

// why: imperative handle threads the pending preset name (the payload) from
// the call site into the dialog without intermediate React state. Mirrors
// `deleteAlertDialogHandle` in data-table/dialogs/delete-account.tsx — one
// dialog component serves every preset chip via payload-typed handle + render
// prop.
export const presetSwitchDialogHandle = createDialogHandle<ShadcnPresetName>()

export function PresetSwitchDialog() {
  return (
    <Dialog handle={presetSwitchDialogHandle}>
      {({ payload }) => (payload ? <PresetSwitchBody name={payload} /> : null)}
    </Dialog>
  )
}

// why: one labelled pair of choice cards per touched-and-eligible source input.
// A switch read ambiguously ("keep mine" vs the preset) because it hid one of
// the two values behind the off state; two side-by-side cards show both the
// current and the preset value at once and make the pick explicit. The cards
// mirror custom-color-form's ShadcnSourcePicker (RadioGroup of <label> cards).
// `keep === true` selects the user's current value; selecting the preset card
// hands the field to the preset — the same boolean the Apply handler consumes.
// The caption is a plain element referenced by `aria-labelledby` (not a
// <label>, which would imply a single associated control) so the group is
// named for assistive tech per Base UI's RadioGroup guidance.
function ChoiceCards({
  noun,
  current,
  preset,
  keep,
  onKeepChange,
}: {
  noun: string
  current: ReactNode
  preset: ReactNode
  keep: boolean
  onKeepChange: (next: boolean) => void
}) {
  const captionId = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <div id={captionId} className="text-sm font-medium capitalize text-on-surface">
        {noun}
      </div>
      <RadioGroup
        aria-labelledby={captionId}
        value={keep ? 'current' : 'preset'}
        onValueChange={(v) => onKeepChange(v === 'current')}
        className="grid-cols-2"
      >
        <RadioCard value="current" label="Current" selected={keep}>
          <div className="font-mono text-xs text-on-surface-variant">{current}</div>
        </RadioCard>
        <RadioCard value="preset" label="Preset" selected={!keep}>
          <div className="font-mono text-xs text-on-surface-variant">{preset}</div>
        </RadioCard>
      </RadioGroup>
    </div>
  )
}

// why: seed value body — swatch plus the hex it stands for.
function SeedValue({ hex }: { hex: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span
        className="size-3 shrink-0 rounded-sm outline outline-outline-variant"
        style={{ backgroundColor: hex }}
      />
      <span className="truncate">{hex}</span>
    </span>
  )
}

// why: contrast is per-mode (#123), so each card spells out both modes with
// `light:`/`dark:` labels — the user needs to know which number is which, and
// the labels carry that even when the two values happen to match. Kept on one
// line so the contrast cards match the single-line seed cards' height.
function ContrastValue({ c }: { c: { light: number; dark: number } }) {
  return (
    <span className="flex items-center gap-2 tabular-nums">
      <span>light: {c.light.toFixed(2)}</span>
      <span>dark: {c.dark.toFixed(2)}</span>
    </span>
  )
}

// why: the body is its own component so the card choices can hold local state
// across the dialog's lifetime; the render-prop child re-runs each render and
// can't own hooks directly. Reads the live store to decide which rows to show —
// only a touched-and-unlocked seed / touched contrast raises a choice, matching
// presetSwitchNeedsDialog's gate at the call site.
function PresetSwitchBody({ name }: { name: ShadcnPresetName }) {
  const portable = useSource(useShallow(selectPortable))
  const seedTouched = useSource((s) => s.seedTouched)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const contrastTouched = useSource((s) => s.contrastTouched)
  const currentHex = useSource(selectSeedHex)
  const currentContrast = useSource((s) => s.contrastLevel)

  // Cards default to "Current" (keep === true) — the safe choice preserves the
  // user's tuning; picking the "Preset" card opts that field into the preset.
  const [keepSeed, setKeepSeed] = useState(true)
  const [keepContrast, setKeepContrast] = useState(true)

  const recipeDirty = isPresetSwitchDirty(portable)
  const seedDecision = seedTouched && !seedHexLock
  const preset = SHADCN_PRESETS[name]
  const presetHex = selectSeedHex(preset)

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="capitalize">Switch to {name}?</DialogTitle>
        <DialogDescription>
          {recipeDirty
            ? 'Your customized bindings, surface, and variant will be replaced by this recipe. Hex overrides are preserved.'
            : 'Choose what this preset controls for the inputs you’ve customized.'}
        </DialogDescription>
      </DialogHeader>

      {(seedDecision || contrastTouched) && (
        <div className="flex flex-col gap-4">
          {seedDecision && (
            <ChoiceCards
              noun="seed color"
              current={<SeedValue hex={currentHex} />}
              preset={<SeedValue hex={presetHex} />}
              keep={keepSeed}
              onKeepChange={setKeepSeed}
            />
          )}
          {contrastTouched && (
            <ChoiceCards
              noun="contrast"
              current={<ContrastValue c={currentContrast} />}
              preset={<ContrastValue c={preset.contrastLevel} />}
              keep={keepContrast}
              onKeepChange={setKeepContrast}
            />
          )}
        </div>
      )}
      <DialogFooter>
        <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
        <DialogClose
          onClick={() => applyShadcnPreset(name, { seed: !keepSeed, contrast: !keepContrast })}
          render={<Button variant="primary" />}
        >
          Apply
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}
