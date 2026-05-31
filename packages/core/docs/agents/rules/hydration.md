# Hydration — two AND-ed guards

Governs `theme/useResolvedTokens.ts`, `react.ts`, and `applyDom`'s pre-hydrate gate.

- **`_hydrated: boolean` on the source store, initially `false`.** Never persisted — stripped by `selectPortable`; explicitly excluded from the partialize blacklist. _(ADR-0015 c.1)_
- **Flip via `actions.setHydrated()`, never raw `set({ _hydrated: true })`.** Keeps the partialize blacklist the single truth-source for the persisted shape. _(ADR-0015 c.2)_
- **Derived consumers route through `useResolvedTokens`** (returns `null` pre-hydrate; render placeholders). Direct *source*-state reads are fine — only *derived* output cannot bypass the guard. _(ADR-0015 c.3)_
- **`applyDom` no-ops pre-hydrate.** The renderer has its own gate so non-React callers don't paint a stale theme. _(ADR-0015 c.3)_
- **`useActiveMode` is the only consumer of resolved theme mode.** Components reading `'light' | 'dark'` go through `useActiveMode`; setters use `useSetMode`. Don't call `useTheme()` directly — lint-enforced allowlist. _(ADR-0015 c.4; Amendment 2026-05-09)_
- **`next-themes` import allowlist.** Only files in `features/theme-mode/` import from `next-themes`. Lint-enforced. _(ADR-0015; Amendment 2026-05-09)_
- **Raw `_hydrated` reads** outside the source store and `useResolvedTokens` are bypass candidates. _(ADR-0015)_
- **"Remove the null check, it's annoying" → refuse.** The annoyance is the guard working; render proper placeholders. _(ADR-0015)_
