# www testing — the useEventCallback canonical hook pattern

Governs `apps/www` unit tests. Shared principles (runner, location, what-to-test, scripts) → [../../../../../docs/agents/tdd.md](../../../../../docs/agents/tdd.md). Terms → [../../glossary.md](../../glossary.md).

## The canonical pattern (useEventCallback)

`useEventCallback` tests are **THE canonical pattern for www hooks** — read `apps/www/src/lib/hooks/use-event-callback.test.ts` for the live reference. Every www hook test pattern-matches against it.

Three commitments embedded:
1. **`renderHook` with explicit generics for typed `initialProps`.** TS can't infer `initialProps` shape from the hook callback alone — pass `renderHook<TReturn, TProps>(...)` and a `type Props = { ... }` alias above. Skip the alias and you'll hit `TS2345 unknown not assignable to ...`.
2. **`act(() => ...)` around any handler invocation that may schedule state updates.** Even when the assertion is about a side-effect (a `vi.fn()` getting called), wrap the trigger — it costs nothing and stays correct when the hook later grows internal state.
3. **Pin documented invariants, not exhaustive paths.** The three tests cover: referential stability across re-renders, latest-handler after re-render, no-op fallback when no handler is provided. That's the *contract* — anything beyond it is implementation detail.

No mocks beyond `vi.fn()` as a stand-in for caller-provided handlers. If a hook reaches into Next router, store, or fetch, the answer is usually "extract the side-effect into a pure helper and test that" — not mock the surface.

## Picking a target

Prefer hooks and lib helpers with clear invariants over anything that needs full rendering. Component tests are unblocked but not yet conventionalised — when the first one lands, add it as a second canonical reference here (and widen the coverage carve-out below).

## The E2E tier (Playwright)

There are now **two tiers**. This shard governs the unit tier (`vitest` + `jsdom`);
the browser tier lives in [`apps/www/e2e/`](../../../e2e/README.md).

Route by failure mode, not by component-vs-hook:

- **Logic / invariants** → `vitest` unit test (this shard). Fast, no browser.
- **"Sometimes out of sync", render-timing, cross-navigation, hydration** → E2E.
  `act()` flushes effects synchronously, so a lagging `useEffect` mirror and a
  render-time sync produce identical final state — both pass a unit test. Only a
  real browser across a real navigation observes the stale frame. This is the
  class issue #180 tracks; the prop→state-mirror bug that motivated it could not
  be caught at the unit tier by construction.

Run: `pnpm --filter @tonex/www e2e` (`e2e:ui` to debug). Authoring conventions and
the reusable seam helpers (`gotoTheme`, `setSeedHex`, `getSeedHex`, …) are in the
e2e README — import everything from `e2e/fixtures.ts`, assert on what the user
sees, seed via the UI (not localStorage), settle hydration before interacting.

## Config delta

| Setting | Value |
|---|---|
| Env | jsdom |
| Setup file | `vitest.setup.ts` (jest-dom matchers via the `/vitest` entrypoint) |
| Library surface | + `@testing-library/react` (`renderHook`, `act`), `@testing-library/user-event` |
| Coverage `include` | `src/**/*.ts` *(no `.tsx` yet)* |
| Coverage `exclude` | `**/*.test.ts`, `**/*.config.ts`, `src/app/**`, `src/emails/**`, `scripts/**` |

**Env injection.** `vitest.config.ts` sets `test.env` with `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_DOMAIN` so tests importing modules that read those at top level don't crash. Add to the block; don't `process.env =` inside a test.

**`.tsx` coverage carve-out** *(self-retiring):* `include: ['src/**/*.ts']` excludes `.tsx` until component tests land. Widen to `src/**/*.{ts,tsx}` when the first ships; until then the carve-out keeps coverage signal honest.

## How to apply

- New www hook test → copy `lib/hooks/use-event-callback.test.ts`: typed `renderHook` generics + `act(...)` + invariant pinning.
- Adding a test that imports a module reading `process.env.*` → add the key to `vitest.config.ts` `test.env`, don't mutate `process.env` in-test.
- Tempted to mock Next router / fetch / store in a hook test → first extract the side-effect into a pure helper and test that.
