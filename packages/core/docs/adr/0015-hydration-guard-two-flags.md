> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

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
  - `useTheme()` outside its allowlist — bypass candidate. The current allowlist is enforced by the drift sentinel in `.claude/settings.json` rule #5.
  - Raw `_hydrated` reads outside the source store and `useResolvedTokens` — bypass candidate.
- "Remove the null check, it's annoying" — refuse. The annoyance is the guard working. Render proper placeholders instead.

## Amendment 2026-05-09

The allowlist moved with the workflow-feature consolidation (ADR-0022 rule 5). `next-themes` is now imported by exactly one folder, `features/theme-mode/`, and the canonical resolved-theme hook moved there from `lib/hooks/use-active-mode.ts`.

Updated allowlist (the only files allowed to import from `next-themes`):

- `apps/www/src/features/theme-mode/use-active-mode.ts` — the canonical `useTheme().resolvedTheme` reader. Now also exports `useSetMode`, a thin wrapper around `setTheme` for event-handler callers (the carve-out the original Consequence section already permitted; this just gives it a named home so callers don't import `useTheme()` directly).
- `apps/www/src/features/theme-mode/theme-mode-provider.tsx` — mounts `<NextThemesProvider>` and the `D`-key hotkey. Imports `ThemeProvider` only; does not call `useTheme()`.

Removed from the allowlist:

- `apps/www/src/app/_providers.tsx` — no longer imports `next-themes`. It mounts `ThemeModeProvider` from `features/theme-mode/` instead.
- `apps/www/src/lib/hooks/use-active-mode.ts` — file deleted; moved to the theme-mode feature folder.

The five numbered Decision points stand verbatim. Commitment 4 still binds: any component reading `'light' | 'dark'` MUST go through `useActiveMode`. Components that need to set the mode in event handlers go through the new `useSetMode`. The drift-sentinel hook in `.claude/settings.json` updates to match.

## Amendment 2026-05-25 (issue #128 P3)

Two bypass-candidate classes the original Consequence named had legitimate-but-unhomed instances. This amendment gives each a named home rather than carving file-level exceptions — the allowlist stays two files, and the bypass greps stay zero in product code.

- **Raw theme *preference* (incl `'system'`)** — `use-active-mode.ts` gains a third export, `useThemePreference()`, returning the unresolved `theme` string. It is the home for cosmetic consumers that mirror the user's *setting* rather than the resolved appearance — the only current caller is the shadcn `sonner` Toaster's `theme` prop, which previously imported `useTheme()` directly (the one real out-of-allowlist call). `next-themes` remains imported by exactly one folder. No mounted-guard: the value is presentational, not SSR-critical token output.
- **Raw `_hydrated` reads** — the source store now exports `selectHydrated(state)` (sibling to `selectSeedHex` / `selectPortable`). Gating sites that need source hydration before any token is derived — export availability (`features/export/use-export-content.ts`), picker input (`features/testbed/seed-input.tsx`) — read `useSource(selectHydrated)` instead of reaching into the private `_hydrated` field. These were always legitimate (source-state gates, not derived-output bypasses); the selector removes the ambiguity so the "bypass candidate" grep returns zero in `apps/www/src`. (The separate `lib/stores/ui-prefs` store owns its own `_hydrated` + `selectUiPrefs` and is unaffected.)

The five numbered Decision points and Commitment 4 continue to bind verbatim. No `.claude/settings.json` sentinel change: rule #5's two-file allowlist is unchanged (the new export lives inside `use-active-mode.ts`), and `_hydrated` has no mechanical sentinel rule.
