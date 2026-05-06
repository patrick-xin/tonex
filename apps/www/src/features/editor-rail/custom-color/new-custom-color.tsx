'use client'

import { PlusIcon } from '@phosphor-icons/react'
import {
  CHROMA_HUE_LOCK,
  type CustomColorPreviewRoles,
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ChromaSlider } from '../hct/chroma-slider'
import { chromaGradient, hueGradient, toneGradient } from '../hct/gradients'
import { HctSlider } from '../hct/hct-slider'

// why: shift seed hue by 120° for a complementary starting color. Pure on
// core's hex↔HCT helpers — no MCU import in www.
function complementaryHex(seedHex: string): string {
  const { hue, chroma, tone } = hctFromHex(seedHex)
  return hexFromHct({ hue: (hue + 120) % 360, chroma, tone })
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

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [hue, setHue] = useState(0)
  const [chroma, setChroma] = useState(48)
  const [tone, setTone] = useState(40)
  const [blend, setBlend] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [hexInput, setHexInput] = useState('')
  const isHexFocused = useRef(false)

  const colorHex = hexFromHct({ hue, chroma, tone })
  const gamutLimit = maxChroma(hue, tone)
  const hueG = hueGradient()
  const chromaG = chromaGradient(hue, tone, gamutLimit)
  const toneG = toneGradient(hue, chroma)

  const setFromHex = useCallback((hex: string) => {
    const t = hctFromHex(hex)
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

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setName('')
      setDescription('')
      setBlend(true)
      setError(null)
      const startHex = complementaryHex(seedHex)
      setFromHex(startHex)
      setHexInput(startHex)
    }
    setOpen(nextOpen)
  }

  // why: live-validate the draft so the Add button reflects whether the next
  // click would throw. Excludes nothing from existingSlugs — add-time checks
  // against ALL current entries.
  const draftError = validateCustomColorEntry(
    { name, hex: colorHex },
    new Set(customColors.map((e) => slugifyCustomColorName(e.name))),
  )

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    // why: shadcnSource defaults to 'color' silently — md-only UI for now.
    // Editing the field is deferred until the shadcn surface is exposed.
    const entry: CustomColorEntry = {
      id: crypto.randomUUID(),
      name: trimmed,
      description: description.trim() || undefined,
      hex: colorHex,
      blend,
      shadcnSource: 'color',
    }
    try {
      addCustomColor(entry)
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
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
          <DialogTitle>Add Custom Color</DialogTitle>
          <DialogDescription>
            Pick a color and name it. The system generates 4 accessible roles automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="custom-color-name">Name</Label>
            <Input
              id="custom-color-name"
              inputSize="sm"
              placeholder="e.g. Brand, Warning, Info"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-color-desc">
              Description <span className="text-on-surface-variant font-normal">(optional)</span>
            </Label>
            <Input
              id="custom-color-desc"
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
              <Label htmlFor="custom-hex-input">Hex</Label>
              <Input
                id="custom-hex-input"
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

          <RolePreview seedHex={seedHex} hex={colorHex} blend={blend} />

          <div className="border-t border-outline-variant/40 pt-4">
            <Label
              htmlFor="custom-color-blend"
              className="flex items-center justify-between w-full"
            >
              <span className="flex flex-col gap-0.5">
                <span>Harmonize</span>
                <span className="text-xs text-on-surface-variant">
                  Shift hue toward source color for visual cohesion
                </span>
              </span>
              <Switch id="custom-color-blend" checked={blend} onCheckedChange={setBlend} />
            </Label>
          </div>

          {(error ?? draftError) !== null && (
            <p className="text-xs text-error">{error ?? draftError}</p>
          )}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={handleAdd} disabled={draftError !== null}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// why: live preview of the 4 generated md roles via core's previewCustomColor.
// Light-mode only here — the dialog is a quick add path; the row swatch in
// CustomColorList resolves mode against the active theme.
function RolePreview({ seedHex, hex, blend }: { seedHex: string; hex: string; blend: boolean }) {
  const preview = previewCustomColor(seedHex, { hex, blend })
  return <RolePreviewSwatches roles={preview.light} />
}

export function RolePreviewSwatches({ roles }: { roles: CustomColorPreviewRoles }) {
  const pairs: Array<{
    label: string
    bg: keyof CustomColorPreviewRoles
    fg: keyof CustomColorPreviewRoles
  }> = [
    { label: 'Color', bg: 'color', fg: 'onColor' },
    { label: 'On Color', bg: 'onColor', fg: 'color' },
    { label: 'Container', bg: 'colorContainer', fg: 'onColorContainer' },
    { label: 'On Container', bg: 'onColorContainer', fg: 'colorContainer' },
  ]
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {pairs.map((p) => (
        <div
          key={p.label}
          className="h-12 flex items-end p-1.5 rounded-md"
          style={{ backgroundColor: roles[p.bg] }}
        >
          <span className="text-[9px] font-medium leading-tight" style={{ color: roles[p.fg] }}>
            {p.label}
          </span>
        </div>
      ))}
    </div>
  )
}
