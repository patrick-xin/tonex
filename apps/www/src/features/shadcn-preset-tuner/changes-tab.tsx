'use client'

import { CheckIcon, CopyIcon } from '@phosphor-icons/react'
import { selectPortable, useSource } from '@tonex/core'
import { SHADCN_ROLE_NAMES, type ShadcnRoleName } from '@tonex/core/schema'
import { useCallback, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import {
  DEFAULT_BUNDLE,
  diffBundle,
  type PresetBundle,
  type PresetFixture,
  snapshotBundle,
} from './bundle-snapshot'
import { PRESET_FIXTURES } from './fixtures'
import { formatCopyOutput } from './format-ts'

// why: Changes tab — surfaces what the user has changed vs DEFAULT_INPUTS,
// plus Load picker (seed from fixtures.ts), Reset (back to DEFAULT_INPUTS),
// and Copy (emit a fixture-entry literal for paste-back into fixtures.ts).
// Per ADR-0026 presets are bundle-only — overrides are not part of the
// curator surface.
export function ChangesTab() {
  const portable = useSource(useShallow(selectPortable))
  const applyBundle = useApplyBundle()
  const [name, setName] = useState('')

  const bundle = useMemo(() => snapshotBundle(portable), [portable])
  const diff = useMemo(() => diffBundle(bundle, DEFAULT_BUNDLE), [bundle])
  const output = useMemo(() => formatCopyOutput(name, bundle), [name, bundle])

  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 1500 })

  const handleLoad = useCallback(
    (fixture: PresetFixture) => {
      applyBundle(fixture.bundle)
      setName(fixture.name)
    },
    [applyBundle],
  )

  const handleReset = useCallback(() => {
    applyBundle(DEFAULT_BUNDLE)
    setName('')
  }, [applyBundle])

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

      <DiffSummary diff={diff} />

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
          title="Reset bundle to DEFAULT_INPUTS"
        >
          Reset
        </Button>
      </div>

      <pre className="text-[10px] leading-snug font-mono whitespace-pre rounded-md ring-1 ring-outline-variant/50 bg-surface px-2 py-2 overflow-x-auto max-h-[40dvh]">
        {output}
      </pre>
    </div>
  )
}

// why: chip row of fixtures from PRESET_FIXTURES — clicking a chip seeds
// the rail with that preset's bundle + overrides so the user can tweak and
// re-Copy. Chips wrap so the row scales with the fixture count without
// needing a dropdown affordance.
function LoadPresetRow({ onLoad }: { onLoad: (fixture: PresetFixture) => void }) {
  if (PRESET_FIXTURES.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs font-medium text-on-surface-variant">Load preset</div>
      <div className="flex flex-wrap gap-1">
        {PRESET_FIXTURES.map((fixture) => (
          <Button
            key={fixture.name}
            variant="outline"
            size="sm"
            className="h-6 px-2 font-mono text-[11px]"
            onClick={() => onLoad(fixture)}
            title={`Load ${fixture.name} into rail (overwrites current state)`}
          >
            {fixture.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface DiffSummaryProps {
  diff: ReturnType<typeof diffBundle>
}

function DiffSummary({ diff }: DiffSummaryProps) {
  const rows: { label: string; changed: boolean; detail?: string }[] = [
    { label: 'variant', changed: diff.variantChanged },
    { label: 'surfaceAlgo', changed: diff.surfaceAlgoChanged },
    { label: 'surfacePaletteName', changed: diff.surfacePaletteNameChanged },
    {
      label: 'surfaceTintLevel',
      changed: diff.surfaceTintLevel.light || diff.surfaceTintLevel.dark,
      detail: changedModes(diff.surfaceTintLevel),
    },
    {
      label: 'surfaceDesaturateLevel',
      changed: diff.surfaceDesaturateLevel.light || diff.surfaceDesaturateLevel.dark,
      detail: changedModes(diff.surfaceDesaturateLevel),
    },
  ]

  return (
    <div className="flex flex-col gap-1 rounded-md ring-1 ring-outline-variant/50 px-2 py-2 bg-surface">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-on-surface">Bundle diff</span>
        <span className="tabular-nums text-on-surface-variant">
          {diff.totalChanges} {diff.totalChanges === 1 ? 'change' : 'changes'}
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

function BindingsDiffRow({ mode, roles }: { mode: 'light' | 'dark'; roles: ShadcnRoleName[] }) {
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

// why: shared applier used by Load (fixture → rail) and Reset (DEFAULT_INPUTS
// → rail). Actions are read via `getState()` rather than subscribed because
// the action object is stable across renders — no need to trigger re-render
// in this component when actions change (they don't). Clears any existing
// role overrides so the rail state ends up exactly equal to the bundle.
//
// Note: seedHex + contrastLevel are intentionally NOT touched — the user is
// tuning aesthetic recipes, not re-picking the source color or contrast.
function useApplyBundle() {
  return useCallback((bundle: PresetBundle) => {
    const { actions } = useSource.getState()
    actions.setVariant(bundle.variant)
    actions.setSurfaceAlgo(bundle.surfaceAlgo)
    actions.setSurfacePaletteName(bundle.surfacePaletteName)
    actions.setSurfaceTintLevel('light', bundle.surfaceTintLevel.light)
    actions.setSurfaceTintLevel('dark', bundle.surfaceTintLevel.dark)
    actions.setSurfaceDesaturateLevel('light', bundle.surfaceDesaturateLevel.light)
    actions.setSurfaceDesaturateLevel('dark', bundle.surfaceDesaturateLevel.dark)
    for (const role of SHADCN_ROLE_NAMES) {
      actions.setShadcnRoleBinding('light', role, bundle.shadcnRoleBindings.light[role])
      actions.setShadcnRoleBinding('dark', role, bundle.shadcnRoleBindings.dark[role])
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
