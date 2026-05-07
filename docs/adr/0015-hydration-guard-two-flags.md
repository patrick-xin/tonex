> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Hydration guard — two flags, both required

SSR/SSG renders before zustand-persist has loaded persisted state and before next-themes has resolved the active mode. Rendering theme-aware UI in that window produces hydration mismatches: server-rendered HTML disagrees with first client paint, and any colour-bound component flickers or shows the wrong values. The fix is two independent guards, both required.

**Decision:**

1. **`_hydrated: boolean`** lives on the source store, initially `false`. It is **in-memory only — never in `PortableTheme`**, never persisted. `selectPortable(state)` strips it; the partialize blacklist excludes it explicitly.

2. **`onRehydrateStorage` flips `_hydrated → true` by calling the store's own `actions.setHydrated()`.** The flip MUST go through the action. Raw `set({ _hydrated: true })` is forbidden so the partialize blacklist remains the single source of truth for the persisted shape — a habit-anchor that prevents future agents from treating `_hydrated` as just-another-field.

3. **Consumers route through guards.** `useResolvedTokens()` returns `null` while `_hydrated === false`; `applyDom` no-ops; components handle the null and render placeholders.

4. **Theme mode (next-themes) needs its own guard.** `next-themes`' `resolvedTheme` is `undefined` pre-mount. Tonex's `useActiveMode` hook owns the standard mounted-flag pattern. **Every component that needs `'light' | 'dark'` resolution must consume it through `useActiveMode`, never through `useTheme()` directly.**

5. **Both flags are required.** Source-state consumers route through `useResolvedTokens` (or guard equivalent). Theme-mode-aware UI routes through `useActiveMode`. AND-ing the guards is the pattern; either bypassed is a defect class.

**Why:** The two failure modes are independent. Store-rehydration mismatch happens because persisted state appears asynchronously after first paint. next-themes mode mismatch happens because the active theme is computed from `localStorage` only on the client. Each guard targets one source. A single combined guard would either over-block (UI hidden longer than necessary) or under-block (one of the two windows leaks).

The flip-via-action rule (point 2) is load-bearing for a different reason: `_hydrated` lives outside `PortableTheme` only because the store knows to strip it. If a future agent adds a raw `set({ _hydrated: ... })` somewhere, the strip is bypassed conceptually — the action-only convention prevents the class.

**Consequence:**

- Every consumer of derived theme state (rendered tokens) goes through `useResolvedTokens`. Direct `useSource(s => s.someSourceField)` reads of *source* state are fine; what cannot bypass the guard is the *derived* output.
- Every consumer of `resolvedTheme` goes through `useActiveMode`. `useTheme()` is reserved for `_providers.tsx` (one site, set up the provider) and event handlers where SSR mismatch is structurally impossible (e.g. keypress).
- **Drift sentinels (cheap, mechanical)** catch the bypass class:
  - Grep for `useTheme()` outside `{use-active-mode.ts, _providers.tsx}` — bypass candidate.
  - Grep for raw `_hydrated` reads outside `packages/core/src/theme/source.ts` and `useResolvedTokens.ts` — bypass candidate.
- "Remove the null check, it's annoying" — refuse. The annoyance is the guard working. Render proper placeholders instead.
- **Known violations at write time** (real bugs, not just convention slip): two `editor-rail/` components read `useTheme().resolvedTheme` raw and silently coerce undefined → `'light'` — produces an incorrect swatch on first paint for users with dark system theme. Tracked as cleanup issues; the rule supersedes them.
