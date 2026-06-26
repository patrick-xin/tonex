'use client'

import { CheckIcon, CopyIcon } from '@phosphor-icons/react'
import { hexFromHct, type Mode, selectSeedHex } from '@tonex/core'
import {
  DEFAULT_INPUTS,
  SHADCN_PRESETS,
  SHADCN_ROLE_NAMES,
  type ShadcnPreset,
  type ShadcnPresetName,
  type ShadcnRoleName,
} from '@tonex/core/schema'
import { selectPortable, useSource } from '@tonex/core-react'
import { useCallback, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { DEFAULT_BUNDLE, diffBundle, snapshotBundle } from './bundle-snapshot'
import { formatCopyOutput } from './format-ts'

// why: per ADR-0031 a preset carries its curated seed + contrastLevel alongside
// the recipe, so the curator surface tunes and emits all three.
export function ChangesTab() {
  const portable = useSource(useShallow(selectPortable))
  const seedHex = useSource(selectSeedHex)
  const contrastLevel = useSource((s) => s.contrastLevel)
  const applyPreset = useApplyPreset()
  const [name, setName] = useState('')

  // why: a preset now carries a per-mode contrast pair, so the curator emits the
  // rail's light/dark verbatim — tuning a distinct dark baseline (e.g. OLED) is
  // exactly the capability the per-mode shape unlocks.
  const bundle = useMemo(() => snapshotBundle(portable), [portable])
  const diff = useMemo(() => diffBundle(bundle, DEFAULT_BUNDLE), [bundle])
  const output = useMemo(
    () => formatCopyOutput(name, seedHex, contrastLevel, bundle),
    [name, seedHex, contrastLevel, bundle],
  )

  const seedChanged = seedHex !== DEFAULT_INPUTS.seed.exactHex
  const contrastChanged =
    contrastLevel.light !== DEFAULT_INPUTS.contrastLevel.light ||
    contrastLevel.dark !== DEFAULT_INPUTS.contrastLevel.dark

  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 1500 })

  const handleLoad = useCallback(
    (presetName: ShadcnPresetName, preset: ShadcnPreset) => {
      applyPreset(preset)
      setName(presetName)
    },
    [applyPreset],
  )

  const handleReset = useCallback(() => {
    applyPreset(SHADCN_PRESETS.default)
    setName('')
  }, [applyPreset])

  return (
    <div className="flex flex-col gap-3 px-2 py-2">
      <LoadPresetRow onLoad={handleLoad} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="preset-name" className="text-xs font-medium text-on-surface-variant">
          Preset name
        </label>
        <Input
          id="preset-name"
          inputSize="sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. vivid, soft, default"
          spellCheck={false}
        />
      </div>

      <DiffSummary
        diff={diff}
        seed={{ changed: seedChanged, hex: seedHex }}
        contrast={{
          changed: contrastChanged,
          light: contrastLevel.light,
          dark: contrastLevel.dark,
        }}
      />

      <div className="flex items-center gap-2">
        <Button
          variant="brand"
          size="sm"
          className="flex-1"
          onClick={() => copyToClipboard(output)}
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
          {isCopied ? 'Copied' : 'Copy preset'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          title="Reset to the default preset (recipe + curated seed + contrast)"
        >
          Reset
        </Button>
      </div>

      <pre className="text-xs leading-snug font-mono whitespace-pre rounded-md ring-1 ring-outline-variant/50 bg-surface px-2 py-2 overflow-x-auto max-h-[40dvh]">
        {output}
      </pre>
    </div>
  )
}

function LoadPresetRow({
  onLoad,
}: {
  onLoad: (name: ShadcnPresetName, preset: ShadcnPreset) => void
}) {
  const entries = Object.entries(SHADCN_PRESETS) as [ShadcnPresetName, ShadcnPreset][]
  if (entries.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs font-medium text-on-surface-variant">Load preset</div>
      <div className="flex flex-wrap gap-1">
        {entries.map(([presetName, preset]) => (
          <Button
            key={presetName}
            variant="outline"
            size="sm"
            className="h-6 px-2 font-mono text-xs"
            onClick={() => onLoad(presetName, preset)}
            title={`Load ${presetName} into rail (overwrites current state)`}
          >
            {presetName}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface DiffSummaryProps {
  diff: ReturnType<typeof diffBundle>
  seed: { changed: boolean; hex: string }
  contrast: { changed: boolean; light: number; dark: number }
}

// why: collapse to one reading when the modes match, show `light/dark` when they
// diverge — the diff row stays honest about the per-mode value being emitted.
function formatContrast(light: number, dark: number): string {
  return light === dark ? light.toFixed(2) : `${light.toFixed(2)}/${dark.toFixed(2)}`
}

function DiffSummary({ diff, seed, contrast }: DiffSummaryProps) {
  const rows: { label: string; changed: boolean; detail?: string }[] = [
    { label: 'seed', changed: seed.changed, detail: seed.hex },
    {
      label: 'contrastLevel',
      changed: contrast.changed,
      detail: formatContrast(contrast.light, contrast.dark),
    },
    { label: 'variant', changed: diff.variantChanged },
    { label: 'surfaceAlgo', changed: diff.surfaceAlgoChanged },
    {
      label: 'surfacePaletteName',
      changed: diff.surfacePaletteName.light || diff.surfacePaletteName.dark,
      detail: changedModes(diff.surfacePaletteName),
    },
    {
      label: 'surfaceTintLevel',
      changed: diff.surfaceTintLevel.light || diff.surfaceTintLevel.dark,
      detail: changedModes(diff.surfaceTintLevel),
    },
    {
      label: 'surfaceTintTextLevel',
      changed: diff.surfaceTintTextLevel.light || diff.surfaceTintTextLevel.dark,
      detail: changedModes(diff.surfaceTintTextLevel),
    },
    {
      label: 'surfaceDesaturateLevel',
      changed: diff.surfaceDesaturateLevel.light || diff.surfaceDesaturateLevel.dark,
      detail: changedModes(diff.surfaceDesaturateLevel),
    },
  ]

  // why: source-input changes count toward the total alongside recipe changes —
  // the curator's seed/contrast picks are part of the preset under ADR-0031.
  const totalChanges = diff.totalChanges + (seed.changed ? 1 : 0) + (contrast.changed ? 1 : 0)

  return (
    <div className="flex flex-col gap-1 rounded-md ring-1 ring-outline-variant/50 px-2 py-2 bg-surface">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-on-surface">Preset diff</span>
        <span className="tabular-nums text-on-surface-variant">
          {totalChanges} {totalChanges === 1 ? 'change' : 'changes'}
        </span>
      </div>
      <ul className="flex flex-col gap-0.5 text-xs font-mono">
        {rows.map((row) => (
          <li
            key={row.label}
            className={row.changed ? 'text-on-surface' : 'text-on-surface-variant/60'}
          >
            <span className="inline-block w-3">{row.changed ? '·' : ''}</span>
            {row.label}
            {row.detail !== undefined ? (
              <span className="text-on-surface-variant"> ({row.detail})</span>
            ) : null}
          </li>
        ))}
        <BindingsDiffRow mode="light" roles={diff.bindings.light} />
        <BindingsDiffRow mode="dark" roles={diff.bindings.dark} />
      </ul>
    </div>
  )
}

function BindingsDiffRow({ mode, roles }: { mode: Mode; roles: ShadcnRoleName[] }) {
  const changed = roles.length > 0
  return (
    <li className={changed ? 'text-on-surface' : 'text-on-surface-variant/60'}>
      <span className="inline-block w-3">{changed ? '·' : ''}</span>
      shadcnRoleBindings.{mode}
      <span className="text-on-surface-variant">
        {' '}
        ({roles.length}/{SHADCN_ROLE_NAMES.length})
      </span>
    </li>
  )
}

function changedModes(per: { light: boolean; dark: boolean }): string | undefined {
  if (per.light && per.dark) return 'light + dark'
  if (per.light) return 'light'
  if (per.dark) return 'dark'
  return undefined
}

// why: shared applier used by Load (preset → rail) and Reset (`default` preset
// → rail). Applies the curated source inputs *and* the recipe so the rail ends
// up exactly equal to the preset (ADR-0031): seed + contrast go through the
// normal setters (marking them touched, which is correct in the curator surface
// — we want the picked color to render), and every role override is cleared so
// the binding-resolved values show through cleanly. Actions are read via
// `getState()` since the action object is stable across renders.
function useApplyPreset() {
  return useCallback((preset: ShadcnPreset) => {
    const { actions } = useSource.getState()
    // why: mirror selectSeedHex — prefer the curated exact bytes, fall back to
    // the HCT-derived hex if a preset ever omits exactHex (ADR-0028).
    actions.setSeedHex(preset.seed.exactHex ?? hexFromHct(preset.seed))
    // why: the preset's per-mode contrast applies to each mode as curated.
    actions.setContrastLevel('light', preset.contrastLevel.light)
    actions.setContrastLevel('dark', preset.contrastLevel.dark)
    actions.setVariant(preset.variant)
    actions.setSurfaceAlgo(preset.surfaceAlgo)
    actions.setSurfacePaletteName('light', preset.surfacePaletteName.light)
    actions.setSurfacePaletteName('dark', preset.surfacePaletteName.dark)
    actions.setSurfaceTintLevel('light', preset.surfaceTintLevel.light)
    actions.setSurfaceTintLevel('dark', preset.surfaceTintLevel.dark)
    actions.setSurfaceTintTextLevel('light', preset.surfaceTintTextLevel.light)
    actions.setSurfaceTintTextLevel('dark', preset.surfaceTintTextLevel.dark)
    actions.setSurfaceDesaturateLevel('light', preset.surfaceDesaturateLevel.light)
    actions.setSurfaceDesaturateLevel('dark', preset.surfaceDesaturateLevel.dark)
    for (const role of SHADCN_ROLE_NAMES) {
      actions.setShadcnRoleBinding('light', role, preset.shadcnRoleBindings.light[role])
      actions.setShadcnRoleBinding('dark', role, preset.shadcnRoleBindings.dark[role])
    }
    const current = useSource.getState().shadcnRoleOverrides
    for (const role of Object.keys(current.light) as ShadcnRoleName[]) {
      actions.setShadcnRoleOverride('light', role, null)
    }
    for (const role of Object.keys(current.dark) as ShadcnRoleName[]) {
      actions.setShadcnRoleOverride('dark', role, null)
    }
  }, [])
}
