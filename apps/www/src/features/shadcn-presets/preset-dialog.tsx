'use client'

import { selectPortable, selectSeedHex, useSource } from '@tonex/core'
import { SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import { useId, useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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

// why: one row per touched-and-eligible source input. The switch reads as
// "keep mine" and defaults ON (replacing the ambient reset buttons): ON holds
// the user's current value, OFF hands the field to the preset. Both the title
// and subline track the live switch state — the title states the action that
// will happen ("Keep current color" vs "Use preset color") and the subline the
// value that will land, with a swatch when that value is a color. The whole
// block is a <label> bound to the switch (htmlFor), so it's clickable and the
// switch is announced with the full text by assistive tech.
function ChoiceRow({
  noun,
  currentText,
  presetText,
  currentSwatch,
  presetSwatch,
  checked,
  onCheckedChange,
}: {
  noun: string
  currentText: string
  presetText: string
  currentSwatch?: string
  presetSwatch?: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
}) {
  const id = useId()
  const swatch = checked ? currentSwatch : presetSwatch
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-surface-container-low px-3 py-2">
      <Label htmlFor={id} className="min-w-0 flex-col items-start gap-0.5">
        <span className="text-sm font-medium text-on-surface">
          {checked ? `Keep current ${noun}` : `Use preset ${noun}`}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-xs font-normal text-on-surface-variant">
          {swatch && (
            <span
              className="size-3 shrink-0 rounded-sm outline outline-outline-variant"
              style={{ backgroundColor: swatch }}
            />
          )}
          <span className="truncate">{checked ? currentText : presetText}</span>
        </span>
      </Label>
      <Switch id={id} size="sm" checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

// why: the body is its own component so the switch choices can hold local state
// across the dialog's lifetime; the render-prop child re-runs each render and
// can't own hooks directly. Reads the live store to decide which rows to show —
// only a touched-and-unlocked seed / touched contrast raises a choice, matching
// presetSwitchNeedsDialog's gate at the call site.
function PresetSwitchBody({ name }: { name: ShadcnPresetName }) {
  const setShadcnPreset = useSource((s) => s.actions.setShadcnPreset)
  const portable = useSource(useShallow(selectPortable))
  const seedTouched = useSource((s) => s.seedTouched)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const contrastTouched = useSource((s) => s.contrastTouched)
  const currentHex = useSource(selectSeedHex)
  const currentContrast = useSource((s) => s.contrastLevel)

  // Switches mean "keep mine" and default ON — the safe choice preserves the
  // user's tuning; turning one OFF opts that field into the preset.
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
        <div className="flex flex-col gap-2">
          {seedDecision && (
            <ChoiceRow
              noun="color"
              currentText={`Current: ${currentHex}`}
              presetText={`Preset: ${presetHex}`}
              currentSwatch={currentHex}
              presetSwatch={presetHex}
              checked={keepSeed}
              onCheckedChange={setKeepSeed}
            />
          )}
          {contrastTouched && (
            <ChoiceRow
              noun="contrast"
              currentText={`Current: ${currentContrast.toFixed(2)}`}
              presetText={`Preset: ${preset.contrastLevel.toFixed(2)}`}
              checked={keepContrast}
              onCheckedChange={setKeepContrast}
            />
          )}
        </div>
      )}
      <DialogFooter>
        <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
        <DialogClose
          onClick={() => setShadcnPreset(name, { seed: !keepSeed, contrast: !keepContrast })}
          render={<Button variant="primary" />}
        >
          Apply
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}
