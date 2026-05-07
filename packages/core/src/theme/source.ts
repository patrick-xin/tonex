import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { VariantName } from '../variants'
import { hctFromHex, hexFromHct } from './hct'
import type { Mode } from './mode'
import { paletteOverrideDisabledReason } from './palette-override'
import {
  type CustomColorEntry,
  DEFAULT_INPUTS,
  DEFAULT_SHADCN_ROLE_BINDINGS,
  isValidHex,
  type MdTokenName,
  type PaletteName,
  type PortableTheme,
  SCHEMA_VERSION,
  type ShadcnRoleName,
  STORAGE_KEY,
  type SurfaceAlgo,
  slugifyCustomColorName,
  validateCustomColorEntry,
} from './schema'
import type { NeutralPaletteName } from './surface'

export interface SourceActions {
  setSeedHex(seedHex: string): void
  // why: HCT setters all decompose the current seed, replace one axis, and
  // recompose to a hex routed through setSeedHex. Centralizing through the
  // hex setter means seedHexLock gates every mutation pathway with one check
  // — no per-axis lock plumbing, no chance of a future setter forgetting the
  // gate.
  setSeedHue(hue: number): void
  setSeedChroma(chroma: number): void
  setSeedTone(tone: number): void
  setVariant(variant: VariantName): void
  setContrastLevel(level: number): void
  setSeedHexLock(locked: boolean): void
  setMd3TokenOverride(mode: Mode, token: MdTokenName, hex: string | null): void
  setShadcnRoleBinding(mode: Mode, role: ShadcnRoleName, mdToken: MdTokenName): void
  setSurfaceAlgo(algo: SurfaceAlgo): void
  setSurfacePaletteName(name: NeutralPaletteName): void
  setSurfaceTintLevel(mode: Mode, level: number): void
  setSurfaceDesaturateLevel(mode: Mode, level: number): void
  addCustomColor(entry: CustomColorEntry): void
  updateCustomColor(id: string, patch: Partial<Omit<CustomColorEntry, 'id'>>): void
  removeCustomColor(id: string): void
  // why: hex sets the override for one palette; null deletes the entry so
  // MCU's seed-derived palette flows through unchanged. No-op when the
  // (palette, source) combination is disabled per
  // paletteOverrideDisabledReason — UI is the truth source for "user could
  // have done this", but this guard is the structural backstop for any
  // caller that bypasses the disabled state. Hex format validated; a
  // malformed value throws at the seam, not silently at derive time.
  setPaletteOverride(palette: PaletteName, hex: string | null): void
  setHydrated(): void
  reset(): void
}

// why: actions live nested under `actions` so SourceState — PortableTheme −
// `_hydrated` − `actions` is the persistable surface, and selectPortable
// excludes both ephemeral fields with two destructure keys. Adding a new
// action requires zero edits to selectPortable / partialize; adding a new
// portable field flows through automatically. Pattern: persist fields are
// flat (top-level), actions are bundled. The bundle has stable identity
// across renders since it's constructed once in the store factory.
export type SourceState = PortableTheme & {
  _hydrated: boolean
  actions: SourceActions
}

// why: single projection from SourceState → PortableTheme. Used by:
//   - partialize (persistence write)
//   - applyDom (state.getState() → deriveTheme input)
//   - useResolvedTokens (subscription input via useShallow)
// Two-key blacklist replaces the prior 16-key destructure: anything that's
// not _hydrated or actions is, by definition, persistable. New actions land
// inside the bundle; new portable fields land at top level. The shape itself
// enforces the partition — no per-action maintenance burden.
export function selectPortable(s: SourceState): PortableTheme {
  const { _hydrated: _h, actions: _a, ...portable } = s
  return portable
}

export const useSource = create<SourceState>()(
  persist(
    (set) => ({
      ...DEFAULT_INPUTS,
      _hydrated: false,
      actions: {
        // why: seedHexLock gates the seed write at the setter so every pathway
        // (hex input, HCT slider, image extraction) is blocked by one check
        // instead of each consumer guarding individually. Silent no-op — UI is
        // expected to disable the inputs cosmetically; this is the structural
        // backstop for any caller that bypasses the disabled state.
        setSeedHex: (seedHex) => set((s) => (s.seedHexLock ? {} : { seedHex })),
        setSeedHue: (hue) =>
          set((s) => {
            if (s.seedHexLock) return {}
            const current = hctFromHex(s.seedHex)
            return { seedHex: hexFromHct({ ...current, hue }) }
          }),
        setSeedChroma: (chroma) =>
          set((s) => {
            if (s.seedHexLock) return {}
            const current = hctFromHex(s.seedHex)
            return { seedHex: hexFromHct({ ...current, chroma }) }
          }),
        setSeedTone: (tone) =>
          set((s) => {
            if (s.seedHexLock) return {}
            const current = hctFromHex(s.seedHex)
            return { seedHex: hexFromHct({ ...current, tone }) }
          }),
        setVariant: (variant) => set({ variant }),
        setContrastLevel: (contrastLevel) => set({ contrastLevel }),
        setSeedHexLock: (seedHexLock) => set({ seedHexLock }),
        // why: hex sets the override for one (mode, token); null deletes the
        // entry so the token returns to MCU. Mode and token are typed so any
        // unknown token is a TS error at the call site, not a silent no-op
        // at derive time.
        setMd3TokenOverride: (mode, token, hex) =>
          set((s) => {
            const next = { ...s.md3TokenOverrides[mode] }
            if (hex === null) delete next[token]
            else next[token] = hex
            return { md3TokenOverrides: { ...s.md3TokenOverrides, [mode]: next } }
          }),
        setShadcnRoleBinding: (mode, role, mdToken) =>
          set((s) => ({
            shadcnRoleBindings: {
              ...s.shadcnRoleBindings,
              [mode]: { ...s.shadcnRoleBindings[mode], [role]: mdToken },
            },
          })),
        setSurfaceAlgo: (surfaceAlgo) => set({ surfaceAlgo }),
        setSurfacePaletteName: (surfacePaletteName) => set({ surfacePaletteName }),
        // why: per-mode write — only the addressed mode's level moves. Mirrors
        // setMd3TokenOverride's per-mode shape so all per-mode writers in
        // SourceActions take `(mode, value)` first.
        setSurfaceTintLevel: (mode, level) =>
          set((s) => ({ surfaceTintLevel: { ...s.surfaceTintLevel, [mode]: level } })),
        setSurfaceDesaturateLevel: (mode, level) =>
          set((s) => ({
            surfaceDesaturateLevel: { ...s.surfaceDesaturateLevel, [mode]: level },
          })),
        // why: validate at the store seam — UI's add-time validator surfaces
        // the message in-form; this throw is the structural backstop for any
        // caller that bypasses the form (programmatic add, future import path).
        // Existing-slugs set excludes self for updates; for adds, all current
        // slugs count.
        addCustomColor: (entry) =>
          set((s) => {
            const existing = new Set(s.customColors.map((e) => slugifyCustomColorName(e.name)))
            const err = validateCustomColorEntry(entry, existing)
            if (err !== null) throw new Error(`[addCustomColor] ${err}`)
            return { customColors: [...s.customColors, entry] }
          }),
        updateCustomColor: (id, patch) =>
          set((s) => {
            const target = s.customColors.find((e) => e.id === id)
            if (target === undefined) throw new Error(`[updateCustomColor] no entry with id ${id}`)
            const next: CustomColorEntry = { ...target, ...patch }
            const otherSlugs = new Set(
              s.customColors.filter((e) => e.id !== id).map((e) => slugifyCustomColorName(e.name)),
            )
            const err = validateCustomColorEntry(next, otherSlugs)
            if (err !== null) throw new Error(`[updateCustomColor] ${err}`)
            return {
              customColors: s.customColors.map((e) => (e.id === id ? next : e)),
            }
          }),
        removeCustomColor: (id) =>
          set((s) => ({ customColors: s.customColors.filter((e) => e.id !== id) })),
        setPaletteOverride: (palette, hex) =>
          set((s) => {
            if (paletteOverrideDisabledReason(palette, s) !== null) return {}
            const next = { ...s.paletteOverrides }
            if (hex === null) {
              delete next[palette]
            } else {
              if (!isValidHex(hex)) throw new Error(`[setPaletteOverride] invalid hex "${hex}"`)
              next[palette] = hex
            }
            return { paletteOverrides: next }
          }),
        setHydrated: () => set({ _hydrated: true }),
        reset: () => set({ ...DEFAULT_INPUTS }),
      },
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      // why: pass `undefined` for storage on the server so persist becomes a
      // no-op during SSR — initial server render uses DEFAULT_INPUTS. On the
      // client, real localStorage is wired up and onRehydrateStorage fires
      // after the read completes, flipping _hydrated true.
      storage: typeof window === 'undefined' ? undefined : createJSONStorage(() => localStorage),
      // why: selectPortable excludes _hydrated + actions; everything else is
      // PortableTheme by construction. One source of truth for "what's
      // portable vs ephemeral." Persistence drift is no longer a separate
      // maintenance surface.
      partialize: selectPortable,
      // why: forward migration ladder per ADR-0009. v1 → v2 expanded the
      // shadcn role surface from 2 keys to 26; zustand persist replaces the
      // bindings field wholesale on rehydrate, so v1 state would leave 24
      // role keys undefined and bindShadcn would throw at the first lookup.
      // Spread defaults under persisted bindings — preserves any user edits
      // to the two roles v1 had while filling the rest from current defaults.
      // Returning a partial PortableTheme is fine; zustand spreads it over
      // initial state, so unmentioned fields keep their in-memory defaults.
      migrate: (persistedState, version) => {
        const s = persistedState as Partial<PortableTheme>
        if (version < 2) {
          s.shadcnRoleBindings = {
            light: { ...DEFAULT_SHADCN_ROLE_BINDINGS.light, ...s.shadcnRoleBindings?.light },
            dark: { ...DEFAULT_SHADCN_ROLE_BINDINGS.dark, ...s.shadcnRoleBindings?.dark },
          }
        }
        if (version < 3) {
          // why: v2 had no customColors field — fill empty so deriveTheme's
          // iteration doesn't NPE. Empty array preserves every existing
          // user's exact rendered output (zero extra emission).
          s.customColors = s.customColors ?? []
        }
        if (version < 4) {
          // why: v3 stored md3PrimaryContainerOverride: { light, dark }.
          // Slice 6 generalized this to md3TokenOverrides — a per-token map
          // per mode. Lift any non-null v3 hex into the new map under
          // --color-primary-container, then delete the legacy field so it
          // doesn't leak past rehydrate (same field on the in-memory state
          // would shadow the new shape).
          const legacy = (
            s as { md3PrimaryContainerOverride?: { light: string | null; dark: string | null } }
          ).md3PrimaryContainerOverride
          const lifted: {
            light: Partial<Record<MdTokenName, string>>
            dark: Partial<Record<MdTokenName, string>>
          } = {
            light: {},
            dark: {},
          }
          if (legacy?.light != null) lifted.light['--color-primary-container'] = legacy.light
          if (legacy?.dark != null) lifted.dark['--color-primary-container'] = legacy.dark
          s.md3TokenOverrides = lifted
          delete (s as { md3PrimaryContainerOverride?: unknown }).md3PrimaryContainerOverride
        }
        if (version < 5) {
          // why: v4 had no surfacePaletteName — applySurfaceTint was hardcoded
          // to zinc. Fill 'zinc' so post-rehydrate output is bytewise identical
          // to v4 for any user. Without this, the field is undefined and the
          // tint algorithm's palette lookup NPEs.
          s.surfacePaletteName = s.surfacePaletteName ?? 'zinc'
        }
        if (version < 6) {
          // why: slice-10 audit pruned primaryHexLock — see SCHEMA_VERSION
          // header. md3TokenOverrides still covers the pin-a-hex case for
          // --color-primary; the family-regen story is deferred. Drop the
          // field so it doesn't shadow the new shape on rehydrate.
          delete (s as { primaryHexLock?: unknown }).primaryHexLock
        }
        if (version < 7) {
          // why: lift flat number → { light, dark }. Same level on both modes
          // means post-migrate output is byte-identical to v6. Undefined
          // (legacy unset) falls back to DEFAULT_INPUTS via zustand's spread
          // over initial state, so we only act when the legacy number is real.
          const legacyTint = (s as { surfaceTintLevel?: number | { light: number; dark: number } })
            .surfaceTintLevel
          if (typeof legacyTint === 'number') {
            s.surfaceTintLevel = { light: legacyTint, dark: legacyTint }
          }
          const legacyDesat = (
            s as { surfaceDesaturateLevel?: number | { light: number; dark: number } }
          ).surfaceDesaturateLevel
          if (typeof legacyDesat === 'number') {
            s.surfaceDesaturateLevel = { light: legacyDesat, dark: legacyDesat }
          }
        }
        if (version < 8) {
          // why: v7 had no paletteOverrides — fill empty so deriveTheme's
          // iteration over PALETTE_NAMES finds a defined object. Empty map
          // preserves every existing user's exact rendered output (zero
          // mutations applied to the scheme).
          s.paletteOverrides = s.paletteOverrides ?? {}
        }
        return s as PortableTheme
      },
      // why: flip the _hydrated guard once persist completes. useResolvedTokens
      // returns null until this fires; applyDom only subscribes after this is
      // true. Structurally prevents Next.js hydration mismatches. ADR-0015.
      onRehydrateStorage: () => (state) => {
        state?.actions.setHydrated()
      },
    },
  ),
)
