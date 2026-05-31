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
- Every consumer of `resolvedTheme` goes through `useActiveMode`. `next-themes` is imported by exactly one folder — `apps/www/src/features/theme-mode/` — which owns three named exports: `useActiveMode` (the canonical `useTheme().resolvedTheme` reader), `useSetMode` (the event-handler setter, the SSR-safe carve-out), and `useThemePreference` (the unresolved `theme` string, for cosmetic consumers that mirror the *setting* rather than the resolved appearance — e.g. the `sonner` Toaster). The two files are `use-active-mode.ts` and `theme-mode-provider.tsx`; nothing else imports `next-themes`.
- Raw `_hydrated` is read through `selectHydrated(state)` (sibling to `selectSeedHex` / `selectPortable`), the named home for gating that needs source hydration before any token derives (export availability, picker inputs). Reaching into the private `_hydrated` field directly is the bypass. (The separate `lib/stores/ui-prefs` store owns its own `_hydrated` + `selectUiPrefs`.)
- **Drift sentinels (cheap, mechanical)** catch the bypass class:
  - `useTheme()` (or any `next-themes` import) outside `features/theme-mode/` — bypass candidate, enforced by the drift sentinel in `.claude/settings.json` rule #5 (a two-file allowlist).
  - Raw `_hydrated` reads outside the source store, `useResolvedTokens`, and `selectHydrated` — bypass candidate.
- "Remove the null check, it's annoying" — refuse. The annoyance is the guard working. Render proper placeholders instead.

**Amendment anchors** — dates cited from code/docs; each decision is folded into the Consequence above and kept here only so the citation resolves in one hop. The five numbered Decision points and commitment 4 continue to bind verbatim through both.

- **2026-05-09** — the `next-themes` allowlist moved into `features/theme-mode/` (canonical hook relocated from `lib/hooks/use-active-mode.ts`; `_providers.tsx` no longer imports `next-themes`); `useSetMode` got a named home.
- **2026-05-25** (issue #128 P3) — two bypass-candidate classes got named homes instead of file-level exceptions: `useThemePreference()` for raw preference (incl. `'system'`) and `selectHydrated(state)` for raw `_hydrated` gates, so the bypass greps return zero in product code. Allowlist stays two files; no sentinel change.
