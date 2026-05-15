'use client'

import { CHROMA_HUE_LOCK, type CustomColorPreviewRoles } from '@tonex/core'
import { cn } from 'tailwind-variants'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Radio, RadioGroup } from '@/components/ui/radio'
import { Switch } from '@/components/ui/switch'
import { ColorPicker } from '@/features/color-picker'
import { ChromaSlider, HctSlider } from '@/features/hct-controls'
import { useActiveMode } from '@/features/theme-mode'
import type { Layer } from '@/lib/layer-context'
import type { CustomColorFormState } from './use-custom-color-form'

// why: shared form JSX for the new + edit dialogs. The hook owns state; this
// component is a pure render given the hook result + the active layer (which
// gates the md-only role preview vs the shadcn-only source picker) + an
// `onEnter` callback so the name input's Enter-to-submit can call into the
// dialog's submit handler.
export function CustomColorFormBody({
  form,
  layer,
  onEnter,
}: {
  form: CustomColorFormState
  layer: Layer
  onEnter: () => void
}) {
  // why: swatches must mirror the page's active theme mode — the user is
  // previewing what they'll see in light vs dark, not a frozen palette.
  // useActiveMode returns null pre-hydration; the dialog only opens after user
  // interaction so hydration is settled, but fall back to 'light' defensively.
  const mode = useActiveMode()
  const previewRoles = form.preview[mode ?? 'light']
  return (
    <div className="grid gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="custom-color-name">Name</Label>
        <Input
          id="custom-color-name"
          inputSize="sm"
          placeholder="e.g. Brand, Warning, Info"
          value={form.name}
          onChange={(e) => form.setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onEnter()
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
          value={form.description}
          onChange={(e) => form.setDescription(e.target.value)}
        />
      </div>

      <div className="border-t border-outline-variant/40 pt-4 flex items-center gap-3">
        <ColorPicker value={form.colorHex} onChange={form.handleHexInput} align="start" />
        <div className="flex items-center gap-2 text-sm flex-1">
          <Label htmlFor="custom-hex-input">Hex</Label>
          <Input
            id="custom-hex-input"
            className="font-mono"
            inputSize="sm"
            type="text"
            value={form.hexInput}
            onChange={(e) => form.handleHexInput(e.target.value)}
            {...form.hexInputProps}
            maxLength={7}
            spellCheck={false}
            placeholder="#000000"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <HctSlider
          label="Hue"
          value={form.hue}
          max={360}
          gradient={form.hueG}
          onValueChange={form.setHue}
          disabled={form.chroma < CHROMA_HUE_LOCK}
        />
        <ChromaSlider
          value={form.chroma}
          gamutLimit={form.gamutLimit}
          gradient={form.chromaG}
          onValueChange={form.setChroma}
        />
        <HctSlider
          label="Tone"
          value={form.tone}
          max={100}
          gradient={form.toneG}
          onValueChange={form.setTone}
        />
      </div>

      {layer === 'md' && <RolePreviewSwatches roles={previewRoles} />}

      <div className="border-t border-outline-variant/40 pt-4">
        <Label htmlFor="custom-color-blend" className="flex items-center justify-between w-full">
          <span className="flex flex-col gap-0.5">
            <span>Harmonize</span>
            <span className="text-xs text-on-surface-variant">
              Shift hue toward source color for visual cohesion
            </span>
          </span>
          <Switch id="custom-color-blend" checked={form.blend} onCheckedChange={form.setBlend} />
        </Label>
      </div>

      {layer === 'shadcn' && (
        <ShadcnSourcePicker
          value={form.shadcnSource}
          onValueChange={form.setShadcnSource}
          roles={previewRoles}
        />
      )}

      {form.visibleError !== null && <p className="text-xs text-error">{form.visibleError}</p>}
    </div>
  )
}

function RolePreviewSwatches({ roles }: { roles: CustomColorPreviewRoles }) {
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
function ShadcnSourcePicker({
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
      <Radio value={value} />
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
