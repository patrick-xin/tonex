> **State:** Living. Edit when testing patterns change.

# Testing in tonex

## Runner

**vitest, monorepo-wide.** One runner across all packages and apps.
- ESM-native, fast watch mode (sub-second on edit)
- Same runner for `core` / `color-utils` (node) and `www` (jsdom)
- `globals: false` everywhere — explicit `import { describe, it, expect } from 'vitest'`. No ambient globals to chase when reading a test cold.

## Test location

**Co-located, `*.test.ts` suffix, next to source.** Not `__tests__/` folders, not a top-level `test/` mirror.

```
packages/core/src/theme/
  derive.ts
  derive.test.ts
  applyDom.ts
  applyDom.test.ts
```

**Reasoning:** when an agent opens `derive.ts`, `derive.test.ts` is the next file in the listing. Test-first becomes the obvious move because the test file is *visibly there*. `__tests__/` hides tests; top-level mirrors require navigation.

**One exception:** integration tests that span multiple files live in `src/__integration__/` per package. They're not a unit's test, so co-locating them is a lie.

## Three layers

| Layer | Where | Env | What it tests |
|---|---|---|---|
| Unit | next to source | vitest, node | Pure functions in core: `deriveTheme`, exporters, importers, variants |
| Integration | `src/__integration__/` | vitest, jsdom | Store + hook + applyDom wired together; CSS vars on scope classes |
| E2E (later) | `apps/www/e2e/` | Playwright | Golden path: upload → swatches → preview → export |

E2E is "later" — empty folder + TODO today; build the harness when there's a screen to test.

## What to test

**The criterion:** *would a regression here break a documented contract a caller depends on?* If yes, write the test. If you're reaching for a test to lift a coverage number without an invariant to pin, don't.

Worth pinning:
- **Pure functions with token / shape contracts** — `deriveTheme`, exporters, importers, contrast utilities. The output fields *are* the spec.
- **Hooks with documented invariants** — referential stability, latest-handler semantics, lifecycle guarantees. (See www canonical below.)
- **Module-edge contracts** — anything a downstream caller imports by name and relies on for shape, not just behaviour.

Skip:
- **Ad-hoc smoke tests against dead code paths** — exercising a branch that no caller depends on. Coverage % is not a contract.
- **Vendored UI primitives** (`components/ui/*`) — wrap or scope at the call site instead; the primitive is a re-vendor target ([[feedback_dont_edit_vendored_ui]]).
- **Next route components / pages** — pin the helpers they call, not the JSX. E2E layer covers the wiring later.
- **Curated-data features** — defer until the promotion slice ([[feedback_tdd_exception_data_curation]]); curation iterates on output shape, not behaviour.

When picking a www target, prefer hooks and lib helpers with clear invariants over anything that needs full rendering. Component tests are unblocked but not yet conventionalised — when the first one lands, add it as a third canonical reference below.

## The canonical test pattern (deriveTheme)

`deriveTheme` tests are **THE canonical pattern for core** — read `packages/core/src/theme/derive.test.ts` for the live reference. Every other core unit test pattern-matches against it.

Three commitments embedded:
1. **`DEFAULT_INPUTS` + inline spread for overrides.** Tests use `deriveTheme(DEFAULT_INPUTS)` for the baseline case and `deriveTheme({ ...DEFAULT_INPUTS, seed: { ...hctFromHex('#xxxxxx'), exactHex: '#xxxxxx' } })` when overriding the seed (HCT-canonical per ADR-0028 — there is no top-level `seedHex` field). No fixture builder until 3+ tests share boilerplate.
2. **Explicit assertions on output fields.** `result.shadcn.light['--primary']` is the contract. Tests-as-spec.
3. **No mocks.** `deriveTheme` is pure (ADR-0005). Mocking would mean mocking math.

`DerivedTheme` shape (lean spine per ADR-0017): `{ md: { light, dark }, shadcn: { light, dark }, warnings }`. **No `css` field** — serialization is `formatCss(theme)` / `formatLayer(theme, 'md' | 'shadcn')` from `format.ts`. Don't write `expect(result.css)...`.

## The canonical hook pattern (useEventCallback)

`useEventCallback` tests are **THE canonical pattern for www hooks** — read `apps/www/src/lib/hooks/use-event-callback.test.ts` for the live reference. Every www hook test pattern-matches against it.

Three commitments embedded:
1. **`renderHook` with explicit generics for typed `initialProps`.** TS can't infer `initialProps` shape from the hook callback alone — pass `renderHook<TReturn, TProps>(...)` and a `type Props = { ... }` alias above. Skip the alias and you'll hit `TS2345 unknown not assignable to ...`.
2. **`act(() => ...)` around any handler invocation that may schedule state updates.** Even when the assertion is about a side-effect (a `vi.fn()` getting called), wrap the trigger — it costs nothing and stays correct when the hook later grows internal state.
3. **Pin documented invariants, not exhaustive paths.** The three tests cover: referential stability across re-renders, latest-handler after re-render, no-op fallback when no handler is provided. That's the *contract* — anything beyond it is implementation detail.

No mocks beyond `vi.fn()` as a stand-in for caller-provided handlers. If a hook reaches into Next router, store, or fetch, the answer is usually "extract the side-effect into a pure helper and test that" — not mock the surface.

## NO snapshot tests on the spine

Banned for `deriveTheme`, exporters, importers, derive's intermediate stages. **Why:** Snapshots erode tests-as-spec — the move when they break is "update the snapshot," not "did the contract change?" Token contracts deserve explicit assertions:

```ts
expect(theme.shadcn.light['--primary']).toBe(theme.md.light['--color-primary-container']);
expect(formatCss(theme)).toContain('.shadcn {');
```

Snapshots are fine for things where the *exact* shape isn't the contract — rendered HTML for visual regression, error messages. Not for the spine.

## Per-workspace setup

The principles above are shared. Only runtime / config differs:

| Workspace | Env | Setup file | Library surface | Coverage `include` | Coverage `exclude` |
|---|---|---|---|---|---|
| `packages/core` | node | none | vitest only | `src/**/*.ts` | `**/*.test.ts`, `**/*.config.ts` |
| `packages/color-utils` | node | none | vitest only | `src/**/*.ts` | `**/*.test.ts`, `**/*.config.ts` |
| `apps/www` | jsdom | `vitest.setup.ts` (jest-dom matchers via `/vitest` entrypoint) | + `@testing-library/react` (`renderHook`, `act`), `@testing-library/user-event` | `src/**/*.ts` *(no `.tsx` yet)* | `**/*.test.ts`, `**/*.config.ts`, `src/app/**`, `src/emails/**`, `scripts/**` |

**www env injection.** `vitest.config.ts` sets `test.env` with `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_DOMAIN`. This lets tests import modules that read those at top level without crashing. Add to the block, don't `process.env =` inside a test.

**www `.tsx` coverage carve-out** *(self-retiring):* the `include: ['src/**/*.ts']` line in `apps/www/vitest.config.ts` excludes `.tsx` files until component tests land. Widen to `src/**/*.{ts,tsx}` when the first component test ships; until then, the carve-out keeps coverage signal honest.

**Catalog deps.** Test deps live in `pnpm-workspace.yaml` catalog: `vitest`, `@vitest/coverage-v8`, `vite-tsconfig-paths`, `@vitejs/plugin-react`. Reference with `"catalog:"` in `package.json`, don't pin a version inline.

A feature crossing core and www reads this doc once: shared principles + canonical pattern for each concern + the small delta above for the workspace you're editing.

## Scripts

Root `package.json` uses turbo:
```json
{ "scripts": { "test": "turbo run test", "coverage": "turbo run coverage" } }
```

Per-package:
```json
{ "scripts": { "test": "vitest run", "coverage": "vitest run --coverage" } }
```

`turbo.json` splits `test` (no outputs) from `coverage` (outputs `coverage/**`) so coverage runs cache and watch is unaffected. **Don't pass `--force` through turbo** — it forwards to vitest which doesn't know the flag. Use `pnpm --filter <pkg> test` for a forced single-package run.

## How to apply

- New core test → copy `derive.test.ts`: `DEFAULT_INPUTS` + spread + explicit assertions.
- New www hook test → copy `use-event-callback.test.ts`: typed `renderHook` generics + `act(...)` + invariant pinning.
- Picking a target → run the "what to test" criterion. No documented contract on the line? Don't write it.
- Tempted to use `toMatchSnapshot()` on a derive output → refuse, write explicit `toContain` / equality assertions.
- Tempted to mock `deriveTheme` from a hook test → refuse, run the real function with a fixture.
- Tempted to mock Next router / fetch / store inside a hook test → first try to extract the side-effect into a pure helper and test that.
- Tempted to use `__tests__/` folder → refuse, co-locate.
- Adding a www test that imports a module reading `process.env.*` → add the key to `vitest.config.ts` `test.env`, don't mutate `process.env` in-test.
