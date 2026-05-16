import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ChartScheme, HueAnchor, ShadcnChartTokenName } from '../chart/schema'
import { cmfSecondSourceDisabledReason } from '../cmf/second-source'
import type { VariantName } from '../variants'
import { hctFromHex, hexFromHct } from './hct'
import type { Mode } from './mode'
import { paletteOverrideDisabledReason } from './palette-override'
import { createDebouncedStorage } from './persist-storage'
import {
  type CustomColorEntry,
  DEFAULT_INPUTS,
  isValidHex,
  type MdTokenName,
  type PaletteName,
  type PortableTheme,
  parsePortableTheme,
  SCHEMA_VERSION,
  type ShadcnRoleName,
  STORAGE_KEY,
  type SurfaceAlgo,
  slugifyCustomColorName,
  validateCustomColorEntry,
} from './schema'
import { SHADCN_PRESETS, type ShadcnPresetName } from './shadcn-presets'
import type { NeutralPaletteName } from './surface'

export interface SourceActions {
  // why: ADR-0028 — hex input path. Stores the HCT decomposition AND the
  // user's exact bytes via `seed.exactHex`, so the hex display reads back
  // verbatim (avoids the #3B82F6 → #3B82F4 round-trip surprise). Idempotent
  // on byte-equal input. seedHexLock gates this and every HCT-axis setter.
  setSeedHex(seedHex: string): void
  // why: HCT-axis setters write the canonical axis directly and clear
  // `seed.exactHex` — touching an HCT axis is the user signal that they
  // have left hex-input mode, so the preserved hex is no longer the live
  // intent. 5e-3 tolerance gate (issue #56) carries forward: any caller
  // submitting a value within solver epsilon of the current axis is a
  // no-op, defending against repeated-commit drift from the slider's
  // `.toFixed(2)` button-tap path.
  setSeedHue(hue: number): void
  setSeedChroma(chroma: number): void
  setSeedTone(tone: number): void
  setVariant(variant: VariantName): void
  setContrastLevel(level: number): void
  setSeedHexLock(locked: boolean): void
  setMd3TokenOverride(mode: Mode, token: MdTokenName, hex: string | null): void
  setShadcnRoleBinding(mode: Mode, role: ShadcnRoleName, mdToken: MdTokenName): void
  // why: composite action — applies one preset's variant + surface fields +
  // 26-role bindings (both modes) in a single atomic store update. Does NOT
  // touch seedHex, contrastLevel, shadcnRoleOverrides, shadcnChartOverrides,
  // customColors, or paletteOverrides — those are orthogonal user-owned
  // axes (ADR-0026: overrides sit on top of bindings, not inside the preset).
  // Consumers that want overrides cleared on preset switch call
  // setShadcnRoleOverride(mode, role, null) per entry alongside.
  setShadcnPreset(name: ShadcnPresetName): void
  // why: ADR-0026 — literal pin on a shadcn role. hex sets the entry; null
  // deletes so the role falls back to its binding-resolved value. Mirrors
  // setMd3TokenOverride's per-mode shape so override editors share one
  // mental model. Hex format validated at the seam; malformed throws so a
  // bad value never reaches derive.
  setShadcnRoleOverride(mode: Mode, role: ShadcnRoleName, hex: string | null): void
  setShadcnChartOverride(mode: Mode, token: ShadcnChartTokenName, hex: string | null): void
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
  // why: hex pins the second source for the cmf variant; null clears it so
  // SchemeCmf falls back to single-source (second = seed). No-op when
  // disabled per cmfSecondSourceDisabledReason — same backstop pattern as
  // setPaletteOverride. Hex format validated; malformed throws at the seam.
  setCmfSecondSourceHex(hex: string | null): void
  setChartScheme(scheme: ChartScheme): void
  setChartHueSpread(spread: number): void
  setChartHueAnchor(anchor: HueAnchor): void
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

// why: tolerance gate for HCT-axis setters (issue #56). 5e-3 = half of one
// `.toFixed(2)` step; the slider display rounds away anything tighter than
// this, so a button-tap commit cannot mutate `seed.{axis}` while a typed
// change of 0.01 still flows through. Shared by setSeedHue/Chroma/Tone.
// Post-ADR-0028 the comparison is against `s.seed.{axis}` (canonical HCT)
// instead of `hctFromHex(s.seedHex)` (derived); same numeric threshold,
// no round-trip in the comparison itself.
const HCT_SETTER_EPSILON = 5e-3

// why: trailing-edge debounce for the persist write. 200ms balances two
// concerns: long enough that 60Hz streaming inputs (slider drag, native
// color picker, hex keystrokes) coalesce ~12 ticks into one IO call,
// short enough that an intentional pause-then-reload still lands the
// user's most recent state. Lifecycle flush covers tab close so no edits
// are lost mid-debounce. Issue #9.
const PERSIST_DEBOUNCE_MS = 200

// why: hold a reference to the wrapper outside createJSONStorage's closure
// so flushPersist can call __flush. SSR has no storage, so this stays null
// on the server and flushPersist becomes a no-op.
const debouncedStorage =
  typeof window === 'undefined'
    ? null
    : createDebouncedStorage({ storage: localStorage, delayMs: PERSIST_DEBOUNCE_MS })

// why: drain any pending debounced write to localStorage immediately. Tests
// need this to assert "after these setters, localStorage contains X" without
// awaiting real timers; future workflows that read localStorage right after
// a streaming write (e.g. an export-to-file path that snapshots the persisted
// blob) can call it too. No-op on the server. Lifecycle handlers (pagehide,
// visibilitychange) call the same underlying __flush automatically — this
// is the manual seam.
export function flushPersist(): void {
  debouncedStorage?.__flush()
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

// why: ADR-0028 — hex projection selector. Returns the user's pasted bytes
// when `seed.exactHex` is set (preserved across hex-input paths); falls
// back to `hexFromHct(seed)` once any HCT-axis setter has cleared it.
// Operates on `Pick<PortableTheme, 'seed'>` so it works on both SourceState
// and the pure PortableTheme shape (derive.ts, chart/sequential.ts).
// Every read site that needs a hex calls this — `seed.exactHex` is never
// read directly outside the selector, so the fallback rule has one home.
export function selectSeedHex(s: Pick<PortableTheme, 'seed'>): string {
  return s.seed.exactHex ?? hexFromHct(s.seed)
}

export const useSource = create<SourceState>()(
  persist(
    (set) => ({
      ...DEFAULT_INPUTS,
      _hydrated: false,
      actions: {
        // why: seedHexLock gates every seed mutation pathway (hex input, HCT
        // slider, image extraction) at the store seam — one structural check
        // instead of per-consumer guards. Silent no-op — UI is expected to
        // disable the inputs cosmetically; this is the backstop for any
        // caller that bypasses the disabled state. Idempotency check uses
        // selectSeedHex so a paste of the current value (whether stored as
        // exactHex or projected from HCT) is a clean no-op.
        setSeedHex: (hex) =>
          set((s) => {
            if (s.seedHexLock) return {}
            if (hex === selectSeedHex(s)) return {}
            return { seed: { ...hctFromHex(hex), exactHex: hex } }
          }),
        // why: HCT-axis setters write the canonical axis and rebuild `seed`
        // without `exactHex` — the user has left hex-input mode (ADR-0028).
        // Spread omission is the explicit clear; the schema treats absent
        // and undefined as equivalent (optional field). 5e-3 tolerance
        // (issue #56) suppresses no-op writes from the slider's button-tap
        // `.toFixed(2)` commit path — the band rounded away by the display
        // can never mutate state, but any typed 0.01 change still flows.
        // The comparison is against `s.seed.{axis}` directly — no hex
        // round-trip — so MCU's gamut solver cannot rotate the unchanged
        // axes (Mechanism B from #57). At chroma<4 the visual hue lock
        // matches state because hue is preserved verbatim across a chroma
        // touch instead of being recomputed from the new hex projection.
        setSeedHue: (hue) =>
          set((s) => {
            if (s.seedHexLock) return {}
            if (Math.abs(hue - s.seed.hue) < HCT_SETTER_EPSILON) return {}
            return { seed: { hue, chroma: s.seed.chroma, tone: s.seed.tone } }
          }),
        setSeedChroma: (chroma) =>
          set((s) => {
            if (s.seedHexLock) return {}
            if (Math.abs(chroma - s.seed.chroma) < HCT_SETTER_EPSILON) return {}
            return { seed: { hue: s.seed.hue, chroma, tone: s.seed.tone } }
          }),
        setSeedTone: (tone) =>
          set((s) => {
            if (s.seedHexLock) return {}
            if (Math.abs(tone - s.seed.tone) < HCT_SETTER_EPSILON) return {}
            return { seed: { hue: s.seed.hue, chroma: s.seed.chroma, tone } }
          }),
        setVariant: (variant) => set({ variant }),
        // why: clamp at the seam (issue #33). MCU's 2025/2026 spec curves
        // make any value outside [0, 1] inert (`low === normal` in every
        // ContrastCurve; `> 1` saturates at `high`) — accepting them would
        // let source state drift from the effective theme and pollute the
        // export header. One clamp here covers every call site (testbed
        // slider, future contrast dialog, programmatic callers); UI inputs
        // still set their own min/max for the slider UX, but no consumer
        // needs to re-derive the contract.
        setContrastLevel: (contrastLevel) =>
          set({ contrastLevel: Math.max(0, Math.min(1, contrastLevel)) }),
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
        setShadcnPreset: (name) => {
          const preset = SHADCN_PRESETS[name]
          set({
            variant: preset.variant,
            surfaceAlgo: preset.surfaceAlgo,
            surfacePaletteName: preset.surfacePaletteName,
            surfaceTintLevel: { ...preset.surfaceTintLevel },
            surfaceDesaturateLevel: { ...preset.surfaceDesaturateLevel },
            shadcnRoleBindings: {
              light: { ...preset.shadcnRoleBindings.light },
              dark: { ...preset.shadcnRoleBindings.dark },
            },
          })
        },
        setShadcnRoleOverride: (mode, role, hex) =>
          set((s) => {
            const next = { ...s.shadcnRoleOverrides[mode] }
            if (hex === null) {
              delete next[role]
            } else {
              if (!isValidHex(hex)) throw new Error(`[setShadcnRoleOverride] invalid hex "${hex}"`)
              next[role] = hex
            }
            return { shadcnRoleOverrides: { ...s.shadcnRoleOverrides, [mode]: next } }
          }),
        setShadcnChartOverride: (mode, token, hex) =>
          set((s) => {
            const next = { ...s.shadcnChartOverrides[mode] }
            if (hex === null) {
              delete next[token]
            } else {
              if (!isValidHex(hex)) throw new Error(`[setShadcnChartOverride] invalid hex "${hex}"`)
              next[token] = hex
            }
            return { shadcnChartOverrides: { ...s.shadcnChartOverrides, [mode]: next } }
          }),
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
        setCmfSecondSourceHex: (hex) =>
          set((s) => {
            if (cmfSecondSourceDisabledReason(s) !== null) return {}
            if (hex !== null && !isValidHex(hex)) {
              throw new Error(`[setCmfSecondSourceHex] invalid hex "${hex}"`)
            }
            return { cmfSecondSourceHex: hex }
          }),
        setChartScheme: (scheme) => set((s) => ({ chart: { ...s.chart, scheme } })),
        setChartHueSpread: (spread) => set((s) => ({ chart: { ...s.chart, hueSpread: spread } })),
        setChartHueAnchor: (anchor) => set((s) => ({ chart: { ...s.chart, hueAnchor: anchor } })),
        setHydrated: () => set({ _hydrated: true }),
        reset: () => set({ ...DEFAULT_INPUTS }),
      },
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      // why: pass `undefined` for storage on the server so persist becomes a
      // no-op during SSR — initial server render uses DEFAULT_INPUTS. On the
      // client, real localStorage is wired up via createDebouncedStorage so
      // streaming writes (slider drag, native picker drag, hex typing)
      // coalesce into a single trailing IO write per ~200ms instead of
      // firing setItem at frame rate. Issue #9. JSON.stringify still happens
      // per tick inside createJSONStorage (microseconds, not the bottleneck);
      // the wrapped Storage debounces the actual setItem call. Lifecycle
      // flush in createDebouncedStorage covers tab close.
      storage: debouncedStorage === null ? undefined : createJSONStorage(() => debouncedStorage),
      // why: selectPortable excludes _hydrated + actions; everything else is
      // PortableTheme by construction. One source of truth for "what's
      // portable vs ephemeral." Persistence drift is no longer a separate
      // maintenance surface.
      partialize: selectPortable,
      // why: passthrough — no forward-migration logic for v1 → v2.
      // ADR-0028 flipped the seed shape (`seedHex: string` → `seed: {...}`)
      // pre-launch; persisted v1 records fail the v2 schema and reset to
      // DEFAULT_INPUTS via onRehydrateStorage below (ADR-0009 c.4,
      // memory/feedback_prelaunch_breaking_changes.md). Future bumps with
      // live users to preserve add real forward-migration branches per
      // ADR-0009.
      migrate: (persistedState, _version) => persistedState as PortableTheme,
      // why: flip the _hydrated guard once persist completes. useResolvedTokens
      // returns null until this fires; applyDom only subscribes after this is
      // true. Structurally prevents Next.js hydration mismatches. ADR-0015.
      //
      // Validate the rehydrated portable shape against PortableThemeSchema
      // (ADR-0009). Migration ladder above is currently a passthrough; this
      // is the v2 contract check. On parse failure (corrupted localStorage,
      // schema bug, partial write, OR a persisted v1 record under the
      // ADR-0028 break — see migrate comment above) reset to DEFAULT_INPUTS
      // — all-or-nothing recovery, the rare path that's simpler than
      // per-field fallback. If rehydrate itself errored or no state came
      // back, leave the in-memory DEFAULT_INPUTS in place and just flip the
      // hydrated flag.
      onRehydrateStorage: () => (state, error) => {
        if (state === undefined || error !== undefined) return
        const result = parsePortableTheme(selectPortable(state))
        if (!result.ok) state.actions.reset()
        state.actions.setHydrated()
      },
    },
  ),
)
