'use client'

import {
  DEFAULT_SHADCN_ROLE_BINDINGS,
  formatLayer,
  MD_TOKEN_NAMES,
  type MdTokenName,
  type ShadcnRoleName,
  useResolvedTokens,
  useSource,
  type VariantName,
  variants,
} from '@tonex/core'
import { useTheme } from 'next-themes'
import { Preview } from '@/features/preview'

// why: which mode's hex to print on the swatch — what's actually rendered.
// During testing both editors are visible but only one mode is on screen.
function useActiveMode(): 'light' | 'dark' | null {
  const { resolvedTheme } = useTheme()
  if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return null
  return resolvedTheme
}

// why: home page is the small-loop testbed. Each section exercises one
// kind of code path (override, mode-keyed binding, cross-layer mapping,
// formatted export). Tint controls live on /sink/tint where they can paint
// the full chrome; surface-only-swatch testing wasn't representative.
//
// Open-item #2 (push 'use client' down) is intentionally deferred — page
// stays client-only until the small loop is feature-complete.

export default function Page() {
  const seedHex = useSource((s) => s.seedHex)
  const setSeedHex = useSource((s) => s.setSeedHex)
  const hydrated = useSource((s) => s._hydrated)

  return (
    <main className="grid gap-6 p-6 max-w-[960px]">
      <header>
        <h1 className="text-2xl font-semibold">tonex</h1>
        <p className="opacity-70 text-sm">
          small-loop testbed — md primary family + shadcn mapping
        </p>
      </header>

      <label className="flex gap-3 items-center">
        <span>seed</span>
        <input
          type="color"
          value={seedHex}
          onChange={(e) => setSeedHex(e.target.value)}
          aria-label="seed color picker"
        />
        <input
          type="text"
          value={seedHex}
          onChange={(e) => setSeedHex(e.target.value)}
          className="font-mono w-28 px-2 py-1 border rounded"
          aria-label="seed hex"
        />
        {!hydrated && <span className="opacity-50">(hydrating…)</span>}
      </label>

      <VariantPicker />
      <PrimaryContainerOverride />
      <ShadcnBindings />

      <MdSwatches />
      <Preview />

      <p className="text-xs opacity-60">
        surface tint sink:{' '}
        <a className="underline" href="/sink/tint">
          /sink/tint
        </a>
      </p>

      <ExportPanels />
    </main>
  )
}

// why: variant dispatch is now real (registry has cmf + tonalSpot). Picker
// lets the small loop exercise lookup-by-name end-to-end. Options derive from
// `variants` so adding a third entry surfaces here automatically.
function VariantPicker() {
  const variant = useSource((s) => s.variant)
  const setVariant = useSource((s) => s.setVariant)
  const names = Object.keys(variants) as VariantName[]
  return (
    <label className="flex gap-3 items-center">
      <span className="w-10 text-sm">variant</span>
      <select
        value={variant}
        onChange={(e) => setVariant(e.target.value as VariantName)}
        className="font-mono text-xs px-2 py-1 border rounded bg-surface"
        aria-label="mcu variant"
      >
        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}

function MdSwatches() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  if (!theme || !mode) return null
  const md = theme.md[mode]
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-medium">md scope ({mode})</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary text-on-primary p-6 rounded-lg">
          <div className="font-medium">primary / on-primary</div>
          <div className="text-xs opacity-80 mt-1 font-mono">
            {md['--color-primary']} / {md['--color-on-primary']}
          </div>
          <div className="text-xs opacity-80 mt-1">utilities: bg-primary text-on-primary</div>
        </div>
        <div className="bg-primary-container text-on-primary-container p-6 rounded-lg">
          <div className="font-medium">primary-container / on-primary-container</div>
          <div className="text-xs opacity-80 mt-1 font-mono">
            {md['--color-primary-container']} / {md['--color-on-primary-container']}
          </div>
          <div className="text-xs opacity-80 mt-1">
            utilities: bg-primary-container text-on-primary-container
          </div>
        </div>
      </div>
    </section>
  )
}

// why: testing-phase UI shows both modes side-by-side so verification doesn't
// require a mode toggle between every assertion. Production target is the
// single-mode pattern (data is mode-keyed; only the UI narrows). Tracked as
// an issue against feedback_single_mode_editing.md when that gets written.
function PrimaryContainerOverride() {
  const override = useSource((s) => s.md3PrimaryContainerOverride)
  const setOverride = useSource((s) => s.setMd3PrimaryContainerOverride)
  const theme = useResolvedTokens()
  if (!theme) return null

  const lightValue = override.light ?? theme.md.light['--color-primary-container'] ?? '#000000'
  const darkValue = override.dark ?? theme.md.dark['--color-primary-container'] ?? '#000000'
  const isOverridden = override.light !== null || override.dark !== null

  return (
    <fieldset className="grid gap-3 border rounded-lg p-3">
      <legend className="text-xs px-2 opacity-70">md primary-container override</legend>
      <div className="flex gap-6 items-center flex-wrap">
        <label className="flex gap-2 items-center">
          <span className="text-sm w-10">light</span>
          <input
            type="color"
            value={lightValue}
            onChange={(e) => setOverride('light', e.target.value)}
            aria-label="primary-container light override"
          />
          <code className="text-xs font-mono opacity-70">{lightValue}</code>
          <span className="text-xs opacity-50">
            {override.light !== null ? '(override)' : '(mcu)'}
          </span>
        </label>
        <label className="flex gap-2 items-center">
          <span className="text-sm w-10">dark</span>
          <input
            type="color"
            value={darkValue}
            onChange={(e) => setOverride('dark', e.target.value)}
            aria-label="primary-container dark override"
          />
          <code className="text-xs font-mono opacity-70">{darkValue}</code>
          <span className="text-xs opacity-50">
            {override.dark !== null ? '(override)' : '(mcu)'}
          </span>
        </label>
        {isOverridden && (
          <button
            type="button"
            onClick={() => {
              setOverride('light', null)
              setOverride('dark', null)
            }}
            className="text-xs px-2 py-1 border rounded"
          >
            reset
          </button>
        )}
      </div>
    </fieldset>
  )
}

const ROLES: ShadcnRoleName[] = ['--primary', '--primary-foreground']
const MODES: ('light' | 'dark')[] = ['light', 'dark']

// why: testing-phase shows both modes; production target is single-mode UI
// driven by next-themes resolvedTheme. Same data shape, only the slice of
// rendered controls differs.
function ShadcnBindings() {
  const bindings = useSource((s) => s.shadcnRoleBindings)
  const setBinding = useSource((s) => s.setShadcnRoleBinding)
  const theme = useResolvedTokens()
  if (!theme) return null

  const isCustom = MODES.some((mode) =>
    ROLES.some((role) => bindings[mode][role] !== DEFAULT_SHADCN_ROLE_BINDINGS[role]),
  )

  return (
    <fieldset className="grid gap-3 border rounded-lg p-3">
      <legend className="text-xs px-2 opacity-70">shadcn role bindings</legend>
      <div className="grid grid-cols-2 gap-4">
        {MODES.map((mode) => (
          <div key={mode} className="grid gap-2">
            <h4 className="text-xs font-medium opacity-70">{mode}</h4>
            {ROLES.map((role) => (
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
              for (const role of ROLES) {
                setBinding(mode, role, DEFAULT_SHADCN_ROLE_BINDINGS[role])
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

function ExportPanels() {
  const theme = useResolvedTokens()
  if (!theme) return null
  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <h3 className="text-sm font-medium opacity-70">md export</h3>
        <pre className="text-xs p-4 rounded-lg bg-surface-container overflow-x-auto">
          <code>{formatLayer(theme, 'md')}</code>
        </pre>
      </div>
      <div className="grid gap-2">
        <h3 className="text-sm font-medium opacity-70">shadcn export</h3>
        <pre className="text-xs p-4 rounded-lg bg-surface-container overflow-x-auto">
          <code>{formatLayer(theme, 'shadcn')}</code>
        </pre>
      </div>
    </section>
  )
}
