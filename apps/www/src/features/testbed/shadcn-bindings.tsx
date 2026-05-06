'use client'

import { useResolvedTokens, useSource } from '@tonex/core'
import {
  DEFAULT_SHADCN_ROLE_BINDINGS,
  MD_TOKEN_NAMES,
  type MdTokenName,
  SHADCN_ROLE_NAMES,
} from '@tonex/core/schema'

const MODES: ('light' | 'dark')[] = ['light', 'dark']

export function ShadcnBindings() {
  const bindings = useSource((s) => s.shadcnRoleBindings)
  const setBinding = useSource((s) => s.actions.setShadcnRoleBinding)
  const theme = useResolvedTokens()
  if (!theme) return null

  const isCustom = MODES.some((mode) =>
    SHADCN_ROLE_NAMES.some(
      (role) => bindings[mode][role] !== DEFAULT_SHADCN_ROLE_BINDINGS[mode][role],
    ),
  )

  return (
    <fieldset className="grid gap-3 border rounded-lg p-3">
      <legend className="text-xs px-2 opacity-70">shadcn role bindings</legend>
      <div className="grid grid-cols-2 gap-4">
        {MODES.map((mode) => (
          <div key={mode} className="grid gap-2">
            <h4 className="text-xs font-medium opacity-70">{mode}</h4>
            {SHADCN_ROLE_NAMES.map((role) => (
              <label key={role} className="flex gap-2 items-center text-sm flex-wrap">
                <code className="font-mono text-xs w-40 opacity-70">{role}</code>
                <span className="opacity-50">←</span>
                <select
                  value={bindings[mode][role]}
                  onChange={(e) => setBinding(mode, role, e.target.value as MdTokenName)}
                  className="font-mono text-xs px-2 py-1 border rounded bg-surface"
                  aria-label={`${role} binding for ${mode}`}
                >
                  {MD_TOKEN_NAMES.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
                <code className="text-xs font-mono opacity-70">= {theme.shadcn[mode][role]}</code>
              </label>
            ))}
          </div>
        ))}
      </div>
      {isCustom && (
        <button
          type="button"
          onClick={() => {
            for (const mode of MODES) {
              for (const role of SHADCN_ROLE_NAMES) {
                setBinding(mode, role, DEFAULT_SHADCN_ROLE_BINDINGS[mode][role])
              }
            }
          }}
          className="text-xs px-2 py-1 border rounded justify-self-start"
        >
          reset to defaults
        </button>
      )}
    </fieldset>
  )
}
