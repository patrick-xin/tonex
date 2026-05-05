> **State:** Living. Edit when testing patterns change.

# Testing in tonex

## Runner

**vitest, monorepo-wide.** One runner across all packages and apps.
- ESM-native, fast watch mode (sub-second on edit)
- Same runner for `core` (node) and `www` (jsdom or happy-dom)

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

## The canonical test pattern (deriveTheme)

`deriveTheme` tests are **THE canonical pattern** — read `packages/core/src/theme/derive.test.ts` for the live reference. Every other unit test pattern-matches against it.

Three commitments embedded:
1. **`DEFAULT_INPUTS` + inline spread for overrides.** Tests use `deriveTheme(DEFAULT_INPUTS)` for the baseline case and `deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#xxxxxx' })` when a field needs overriding. No fixture builder until 3+ tests share boilerplate.
2. **Explicit assertions on output fields.** `result.shadcn.light['--primary']` is the contract. Tests-as-spec.
3. **No mocks.** `deriveTheme` is pure (ADR-0005). Mocking would mean mocking math.

`DerivedTheme` shape (lean spine per ADR-0017): `{ md: { light, dark }, shadcn: { light, dark }, warnings }`. **No `css` field** — serialization is `formatCss(theme)` / `formatLayer(theme, 'md' | 'shadcn')` from `format.ts`. Don't write `expect(result.css)...`.

## NO snapshot tests on the spine

Banned for `deriveTheme`, exporters, importers, derive's intermediate stages. **Why:** Snapshots erode tests-as-spec — the move when they break is "update the snapshot," not "did the contract change?" Token contracts deserve explicit assertions:

```ts
expect(theme.shadcn.light['--primary']).toBe(theme.md.light['--color-primary-container']);
expect(formatCss(theme)).toContain('.shadcn {');
```

Snapshots are fine for things where the *exact* shape isn't the contract — rendered HTML for visual regression, error messages. Not for the spine.

## Scripts

Root `package.json`:
```json
{ "scripts": { "test": "pnpm -r run test", "test:watch": "pnpm -r run test:watch" } }
```

Per-package:
```json
{ "scripts": { "test": "vitest run", "test:watch": "vitest" } }
```

## How to apply

- New test → look at `derive.test.ts`, copy the `DEFAULT_INPUTS` + spread + explicit-assertions pattern.
- Tempted to use `toMatchSnapshot()` on a derive output → refuse, write explicit `toContain` / equality assertions.
- Tempted to mock `deriveTheme` from a hook test → refuse, run the real function with a fixture.
- Tempted to use `__tests__/` folder → refuse, co-locate.
