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
import { useCallback, useState } from 'react'
import { cn } from 'tailwind-variants'
import { NativeColorInput } from '@/components/shared/native-color-input'
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
import { RadioGroup, RadioRoot } from '@/components/ui/radio'
import { Switch } from '@/components/ui/switch'
import {
  ChromaSlider,
  chromaGradient,
  HctSlider,
  hueGradient,
  toneGradient,
} from '@/features/hct-controls'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { useLayer } from '@/lib/layer-context'

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
  const layer = useLayer()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [hue, setHue] = useState(0)
  const [chroma, setChroma] = useState(48)
  const [tone, setTone] = useState(40)
  const [blend, setBlend] = useState(true)
  const [shadcnSource, setShadcnSource] = useState<'color' | 'container'>('color')
  const [error, setError] = useState<string | null>(null)

  const colorHex = hexFromHct({ hue, chroma, tone })
  const gamutLimit = maxChroma(hue, tone)
  const hueG = hueGradient()
  const chromaG = chromaGradient(hue, tone, gamutLimit)
  const toneG = toneGradient(hue, chroma)
  // why: light-mode preview of the 4 generated md roles — feeds both the role
  // swatches and the shadcn-pair picker. The dialog is a quick-add path; the
  // CustomColorList row swatch is what resolves against the active theme mode.
  const preview = previewCustomColor(seedHex, { hex: colorHex, blend })

  const setFromHex = useCallback((hex: string) => {
    const t = hctFromHex(hex)
    setHue(t.hue)
    setChroma(t.chroma)
    setTone(t.tone)
  }, [])

  const {
    hexInput,
    handleChange: handleHexInput,
    inputProps: hexInputProps,
  } = useHexFieldState(colorHex, setFromHex)

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setName('')
      setDescription('')
      setBlend(true)
      setShadcnSource('color')
      setError(null)
      const startHex = complementaryHex(seedHex)
      setFromHex(startHex)
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
  // why: gate the draft error TEXT on a non-empty name — the dialog opens with
  // an empty name, and showing "name must contain…" before the user has typed
  // reads as a failure they caused. The Add button still keys off draftError
  // directly, so an empty name keeps it disabled; only the red text waits. A
  // caught `error` from addCustomColor always shows.
  const visibleError = error ?? (name.trim() ? draftError : null)

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    // why: shadcnSource is user-chosen on the shadcn route via ShadcnSourcePicker;
    // on the md route the picker is hidden and the 'color' default carries — md
    // emits all 4 custom tokens regardless, shadcnSource only selects which md
    // pair feeds the shadcn --{slug} token.
    const entry: CustomColorEntry = {
      id: crypto.randomUUID(),
      name: trimmed,
      description: description.trim() || undefined,
      hex: colorHex,
      blend,
      shadcnSource,
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
          <DialogTitle>Add custom color</DialogTitle>
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
            <NativeColorInput
              className="size-8"
              currentHex={colorHex}
              onColorChange={handleHexInput}
            />
            <div className="flex items-center gap-2 text-sm flex-1">
              <Label htmlFor="custom-hex-input">Hex</Label>
              <Input
                id="custom-hex-input"
                className="font-mono"
                inputSize="sm"
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                {...hexInputProps}
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

          {layer === 'md' && <RolePreviewSwatches roles={preview.light} />}

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

          {layer === 'shadcn' && (
            <ShadcnSourcePicker
              value={shadcnSource}
              onValueChange={setShadcnSource}
              roles={preview.light}
            />
          )}

          {visibleError !== null && <p className="text-xs text-error">{visibleError}</p>}
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

// why: shadcn-route-only control — picks which generated md pair feeds the
// custom color's shadcn token (--{slug} / --{slug}-foreground). deriveTheme's
// buildCustomColorsShadcn reads entry.shadcnSource to make exactly this
// selection: 'color' → the vivid color/on-color pair, 'container' → the soft
// container pair. The md route hides this — md emits all 4 tokens regardless.
// Shared by the add (NewCustomColor) and edit (EditCustomColorDialog) dialogs.
export function ShadcnSourcePicker({
  value,
  onValueChange,
  roles,
}: {
  value: 'color' | 'container'
  onValueChange: (value: 'color' | 'container') => void
  roles: CustomColorPreviewRoles
}) {
  return (
    <div className="border-t border-outline-variant/40 pt-4 space-y-2">
      <RadioGroup
        value={value}
        onValueChange={(v) => onValueChange(v as 'color' | 'container')}
        className="grid-cols-2"
      >
        <SourceCard
          value="color"
          selected={value === 'color'}
          bg={roles.color}
          fg={roles.onColor}
        />
        <SourceCard
          value="container"
          selected={value === 'container'}
          bg={roles.colorContainer}
          fg={roles.onColorContainer}
        />
      </RadioGroup>
    </div>
  )
}

function SourceCard({
  value,
  selected,
  bg,
  fg,
}: {
  value: 'color' | 'container'
  selected: boolean
  bg: string
  fg: string
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the nested Radio (a Base UI <button>, a labelable control) is the associated control
    <label
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-2 cursor-pointer transition-colors',
        selected
          ? 'border-outline-variant bg-primary/8'
          : 'border-outline-variant/60 hover:border-outline-variant',
      )}
    >
      <RadioRoot value={value} />
      <div className="flex gap-2">
        <div className="h-9 flex-1 flex items-end p-1.5 rounded-md" style={{ backgroundColor: bg }}>
          <span className="text-[10px] font-medium leading-none" style={{ color: fg }}>
            bg: {bg}
          </span>
        </div>
        <div className="h-9 flex-1 flex items-end p-1.5 rounded-md" style={{ backgroundColor: fg }}>
          <span className="text-[10px] font-medium leading-none" style={{ color: bg }}>
            fg: {fg}
          </span>
        </div>
      </div>
    </label>
  )
}
