'use client'

import { CheckIcon, CopyIcon } from '@phosphor-icons/react'
import { MODES, selectPortable, useSource } from '@tonex/core'
import { SHADCN_ROLE_NAMES, type ShadcnRoleName } from '@tonex/core/schema'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { DEFAULT_BUNDLE, diffBindings, snapshotBundle } from './bundle-snapshot'
import { formatBindingPresetCopyOutput } from './format-ts'

// why: Binding preset tab — captures *only* the current role→token map as a
// SHADCN_BINDING_PRESETS entry (binding-presets.ts), the binding-only sibling
// of the Changes tab. A binding preset is pure routing (ADR-0031 #1): no seed,
// contrast, variant, or surface, so this surface ignores all of them and emits
// just the light/dark bindings under a name + user-facing description. The
// curator dials the map in the Bindings tab, then names + describes it here.
export function BindingPresetTab() {
  const portable = useSource(useShallow(selectPortable))
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const bindings = useMemo(() => snapshotBundle(portable).shadcnRoleBindings, [portable])
  const output = useMemo(
    () => formatBindingPresetCopyOutput(name, description, bindings),
    [name, description, bindings],
  )

  // why: how far the current map strays from the default routing, per mode —
  // the curator's signal that there's a distinct look worth naming.
  const lightChanged = diffBindings(bindings.light, DEFAULT_BUNDLE.shadcnRoleBindings.light)
  const darkChanged = diffBindings(bindings.dark, DEFAULT_BUNDLE.shadcnRoleBindings.dark)

  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 1500 })

  return (
    <div className="flex flex-col gap-3 px-2 py-2">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="binding-preset-name"
          className="text-xs font-medium text-on-surface-variant"
        >
          Binding preset name
        </label>
        <Input
          id="binding-preset-name"
          inputSize="sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. clean, layered, flat"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="binding-preset-description"
          className="text-xs font-medium text-on-surface-variant"
        >
          Description
        </label>
        <Input
          id="binding-preset-description"
          inputSize="sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Popover & card share one background"
          spellCheck={false}
        />
      </div>

      <BindingsSummary light={lightChanged} dark={darkChanged} />

      <Button variant="brand" size="sm" className="w-full" onClick={() => copyToClipboard(output)}>
        {isCopied ? <CheckIcon /> : <CopyIcon />}
        {isCopied ? 'Copied' : 'Copy binding preset'}
      </Button>

      <pre className="text-[10px] leading-snug font-mono whitespace-pre rounded-md ring-1 ring-outline-variant/50 bg-surface px-2 py-2 overflow-x-auto max-h-[40dvh]">
        {output}
      </pre>
    </div>
  )
}

function BindingsSummary({ light, dark }: { light: ShadcnRoleName[]; dark: ShadcnRoleName[] }) {
  const total = SHADCN_ROLE_NAMES.length
  return (
    <div className="flex flex-col gap-1 rounded-md ring-1 ring-outline-variant/50 px-2 py-2 bg-surface">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-on-surface">Bindings vs default</span>
      </div>
      <ul className="flex flex-col gap-0.5 text-xs font-mono">
        {MODES.map((mode) => {
          const roles = mode === 'light' ? light : dark
          const changed = roles.length > 0
          return (
            <li key={mode} className={changed ? 'text-on-surface' : 'text-on-surface-variant/60'}>
              <span className="inline-block w-3">{changed ? '·' : ''}</span>
              shadcnRoleBindings.{mode}
              <span className="text-on-surface-variant">
                {' '}
                ({roles.length}/{total})
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
