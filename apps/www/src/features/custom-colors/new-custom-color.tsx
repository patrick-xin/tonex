'use client'

import { PlusIcon } from '@phosphor-icons/react'
import { hctFromHex, hexFromHct, useSource } from '@tonex/core'
import { type CustomColorEntry, slugifyCustomColorName } from '@tonex/core/schema'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useLayer } from '@/lib/layer-context'
import { CustomColorFormBody } from './custom-color-form'
import { type CustomColorFormInitial, useCustomColorForm } from './use-custom-color-form'

// why: golden-angle rotation around the seed — Nth new color (0-indexed)
// shifts hue by (N+1) × 137.5°. The golden angle never aligns cleanly with
// 360°, so successive suggestions stay visually distinct from both the seed
// and each other for ~10+ entries before any collision drift. Pure on core's
// hex↔HCT helpers — no MCU import in www.
const GOLDEN_ANGLE_DEG = 137.5

function suggestedHex(seedHex: string, existingCount: number): string {
  const { hue, chroma, tone } = hctFromHex(seedHex)
  const offset = ((existingCount + 1) * GOLDEN_ANGLE_DEG) % 360
  return hexFromHct({ hue: (hue + offset) % 360, chroma, tone })
}

function freshInitial(seedHex: string, existingCount: number): CustomColorFormInitial {
  return {
    name: '',
    description: '',
    hex: suggestedHex(seedHex, existingCount),
    blend: true,
    shadcnSource: 'color',
  }
}

export function NewCustomColor({
  icon,
  iconSize = 'icon-sm',
}: {
  icon?: boolean
  iconSize?: 'icon-sm' | 'icon-xs'
}) {
  const seedHex = useSource((s) => s.seedHex)
  const customColors = useSource((s) => s.customColors)
  const addCustomColor = useSource((s) => s.actions.addCustomColor)
  const layer = useLayer()

  const [open, setOpen] = useState(false)

  const form = useCustomColorForm(
    freshInitial(seedHex, customColors.length),
    new Set(customColors.map((e) => slugifyCustomColorName(e.name))),
  )

  // why: reseed on open — seedHex AND customColors.length may have changed
  // since the last open, so the golden-angle rotation must read the current
  // count to advance to the next suggested hue.
  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) form.reset(freshInitial(seedHex, customColors.length))
    setOpen(nextOpen)
  }

  const handleAdd = () => {
    const trimmed = form.name.trim()
    if (!trimmed) return
    // why: shadcnSource is user-chosen on the shadcn route via
    // ShadcnSourcePicker; on the md route the picker is hidden and the 'color'
    // default carries — md emits all 4 custom tokens regardless, shadcnSource
    // only selects which md pair feeds the shadcn --{slug} token.
    const entry: CustomColorEntry = {
      id: crypto.randomUUID(),
      name: trimmed,
      description: form.description.trim() || undefined,
      hex: form.colorHex,
      blend: form.blend,
      shadcnSource: form.shadcnSource,
    }
    try {
      addCustomColor(entry)
      setOpen(false)
    } catch (err) {
      form.setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger
        render={
          icon ? (
            <Button variant="outline" size={iconSize}>
              <PlusIcon />
            </Button>
          ) : (
            <Button size="sm">New color</Button>
          )
        }
      />
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Add custom color</DialogTitle>
          <DialogDescription>
            Pick a color and name it. The system generates 4 accessible roles automatically.
          </DialogDescription>
        </DialogHeader>

        <CustomColorFormBody form={form} layer={layer} onEnter={handleAdd} />

        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={handleAdd} disabled={form.draftError !== null}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
