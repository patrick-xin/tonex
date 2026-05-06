'use client'

import { DotsThreeVerticalIcon, PencilIcon, TrashIcon } from '@phosphor-icons/react'
import {
  CHROMA_HUE_LOCK,
  hctFromHex,
  hexFromHct,
  maxChroma,
  previewCustomColor,
  useSource,
} from '@tonex/core'
import {
  type CustomColorEntry,
  slugifyCustomColorName,
  validateCustomColorEntry,
} from '@tonex/core/schema'
import { useTheme } from 'next-themes'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ChromaSlider } from '../hct/chroma-slider'
import { chromaGradient, hueGradient, toneGradient } from '../hct/gradients'
import { HctSlider } from '../hct/hct-slider'
import { NewCustomColor, RolePreviewSwatches } from './new-custom-color'

export function CustomColorList() {
  const customColors = useSource((s) => s.customColors)
  const removeCustomColor = useSource((s) => s.actions.removeCustomColor)
  const [editing, setEditing] = useState<CustomColorEntry | null>(null)

  if (customColors.length === 0) {
    return (
      <div className="flex flex-col gap-1 p-2">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm">Custom Colors</div>
          <NewCustomColor iconSize="icon-xs" icon />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-2">
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm">Custom Colors</div>
        <NewCustomColor iconSize="icon-xs" icon />
      </div>
      <div className="flex flex-col gap-2">
        {customColors.map((cc) => (
          <CustomColorCard
            key={cc.id}
            entry={cc}
            onEdit={() => setEditing(cc)}
            onDelete={() => removeCustomColor(cc.id)}
          />
        ))}
      </div>

      {editing && (
        <EditCustomColorDialog
          entry={editing}
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function CustomColorCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: CustomColorEntry
  onEdit: () => void
  onDelete: () => void
}) {
  const seedHex = useSource((s) => s.seedHex)
  const { resolvedTheme } = useTheme()
  const mode: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light'
  const preview = previewCustomColor(seedHex, { hex: entry.hex, blend: entry.blend })
  const roles = [
    preview[mode].color,
    preview[mode].onColor,
    preview[mode].colorContainer,
    preview[mode].onColorContainer,
  ]

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-high">
      <div className="grid grid-cols-2 gap-0.5 shrink-0">
        {roles.map((hex, i) => (
          <div key={String(i)} className="size-3.5 rounded-full" style={{ backgroundColor: hex }} />
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{entry.name}</p>
        <p className="text-xs text-on-surface-variant font-mono">{entry.hex}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="data-popup-open:bg-primary/12">
              <DotsThreeVerticalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end" matchAnchorWidth={false}>
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} variant="destructive">
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function EditCustomColorDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: CustomColorEntry
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const seedHex = useSource((s) => s.seedHex)
  const customColors = useSource((s) => s.customColors)
  const updateCustomColor = useSource((s) => s.actions.updateCustomColor)

  const [name, setName] = useState(entry.name)
  const [description, setDescription] = useState(entry.description ?? '')
  const [blend, setBlend] = useState(entry.blend)

  const initial = hctFromHex(entry.hex)
  const [hue, setHue] = useState(initial.hue)
  const [chroma, setChroma] = useState(initial.chroma)
  const [tone, setTone] = useState(initial.tone)

  const [hexInput, setHexInput] = useState(entry.hex)
  const isHexFocused = useRef(false)
  const [error, setError] = useState<string | null>(null)

  const colorHex = hexFromHct({ hue, chroma, tone })
  const gamutLimit = maxChroma(hue, tone)
  const hueG = hueGradient()
  const chromaG = chromaGradient(hue, tone, gamutLimit)
  const toneG = toneGradient(hue, chroma)

  const setFromHex = useCallback((h: string) => {
    const t = hctFromHex(h)
    setHue(t.hue)
    setChroma(t.chroma)
    setTone(t.tone)
  }, [])

  const handleHexInput = useCallback(
    (val: string) => {
      setHexInput(val)
      if (/^#[0-9a-fA-F]{6}$/.test(val)) setFromHex(val)
    },
    [setFromHex],
  )

  // why: exclude self when validating an edit so the entry's existing slug
  // doesn't trip the duplicate check against itself.
  const otherSlugs = new Set(
    customColors.filter((e) => e.id !== entry.id).map((e) => slugifyCustomColorName(e.name)),
  )
  const draftError = validateCustomColorEntry({ name, hex: colorHex }, otherSlugs)

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      updateCustomColor(entry.id, {
        name: trimmed,
        description: description.trim() || undefined,
        hex: colorHex,
        blend,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const preview = previewCustomColor(seedHex, { hex: colorHex, blend })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Custom Color</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-color-name">Name</Label>
            <Input
              id="edit-color-name"
              inputSize="sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-color-desc">
              Description <span className="text-on-surface-variant font-normal">(optional)</span>
            </Label>
            <Input
              id="edit-color-desc"
              inputSize="sm"
              placeholder="e.g. Used for promotional banners"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="border-t border-outline-variant/40 pt-4 flex items-center gap-3">
            <label className="cursor-pointer shrink-0">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => {
                  setFromHex(e.target.value)
                  setHexInput(e.target.value)
                }}
                className="size-10 rounded-xl border-none outline-0 cursor-pointer appearance-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              />
            </label>
            <div className="flex items-center gap-2 text-sm flex-1">
              <Label htmlFor="edit-hex-input">Hex</Label>
              <Input
                id="edit-hex-input"
                className="font-mono"
                inputSize="sm"
                type="text"
                value={isHexFocused.current ? hexInput : colorHex}
                onChange={(e) => handleHexInput(e.target.value)}
                onFocus={() => {
                  isHexFocused.current = true
                  setHexInput(colorHex)
                }}
                onBlur={() => {
                  isHexFocused.current = false
                }}
                maxLength={7}
                spellCheck={false}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <HctSlider
              label="Hue"
              value={hue}
              max={360}
              gradient={hueG}
              onValueChange={setHue}
              disabled={chroma < CHROMA_HUE_LOCK}
            />
            <ChromaSlider
              value={chroma}
              gamutLimit={gamutLimit}
              gradient={chromaG}
              onValueChange={setChroma}
            />
            <HctSlider
              label="Tone"
              value={tone}
              max={100}
              gradient={toneG}
              onValueChange={setTone}
            />
          </div>

          <div className="border-t border-outline-variant/40 pt-4">
            <Label htmlFor="edit-color-blend" className="flex items-center justify-between w-full">
              <span className="flex flex-col gap-0.5">
                <span>Harmonize</span>
                <span className="text-xs text-on-surface-variant">
                  Shift hue toward source color for visual cohesion
                </span>
              </span>
              <Switch id="edit-color-blend" checked={blend} onCheckedChange={setBlend} />
            </Label>
          </div>

          <RolePreviewSwatches roles={preview.light} />

          {(error ?? draftError) !== null && (
            <p className="text-xs text-error">{error ?? draftError}</p>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={handleSave} disabled={draftError !== null}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
