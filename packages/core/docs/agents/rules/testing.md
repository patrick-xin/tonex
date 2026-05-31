> **State:** Living. Edit when the core test pattern changes; shared principles → the root testing doc.

# Core testing — the deriveTheme canonical pattern

Governs `packages/core` (and `packages/color-utils`, which mirrors it) unit tests. Shared principles (runner, location, what-to-test, scripts) → [../../../../../docs/agents/tdd.md](../../../../../docs/agents/tdd.md). Terms → [../../glossary.md](../../glossary.md).

## The canonical pattern (deriveTheme)

`deriveTheme` tests are **THE canonical pattern for core** — read `packages/core/src/theme/derive/derive.test.ts` for the live reference. Every other core unit test pattern-matches against it.

Three commitments embedded:
1. **`DEFAULT_INPUTS` + inline spread for overrides.** Tests use `deriveTheme(DEFAULT_INPUTS)` for the baseline case and `deriveTheme({ ...DEFAULT_INPUTS, seed: { ...hctFromHex('#xxxxxx'), exactHex: '#xxxxxx' } })` when overriding the seed (HCT-canonical per ADR-0028 — there is no top-level `seedHex` field). No fixture builder until 3+ tests share boilerplate.
2. **Explicit assertions on output fields.** `result.shadcn.light['--primary']` is the contract. Tests-as-spec.
3. **No mocks.** `deriveTheme` is pure (ADR-0005). Mocking would mean mocking math.

`DerivedTheme` shape (lean spine per ADR-0017): `{ md: { light, dark }, shadcn: { light, dark }, warnings }`. **No `css` field** — serialization is `formatCss(theme)` / `formatLayer(theme, 'md' | 'shadcn')` from `format.ts`. Don't write `expect(result.css)...`.

## No snapshot tests on the spine

Banned for `deriveTheme`, exporters, importers, derive's intermediate stages. **Why:** snapshots erode tests-as-spec — the move when they break is "update the snapshot," not "did the contract change?" Token contracts deserve explicit assertions:

```ts
expect(theme.shadcn.light['--primary']).toBe(theme.md.light['--color-primary-container']);
expect(formatCss(theme)).toContain('.shadcn {');
```

General snapshot guidance and where they're allowed → the root testing doc.

## Config delta

| Setting | Value |
|---|---|
| Env | node (vitest default — no `environment` set) |
| Setup file | none |
| Library surface | vitest only |
| Coverage `include` | `src/**/*.ts` |
| Coverage `exclude` | `**/*.test.ts`, `**/*.config.ts` |

`color-utils` is identical. Both run `vitest run` / `vitest run --coverage` (root testing doc → Scripts).

## How to apply

- New core test → copy `theme/derive/derive.test.ts`: `DEFAULT_INPUTS` + spread + explicit assertions.
- Tempted to `toMatchSnapshot()` a derive output → refuse, write explicit `toContain` / equality assertions.
- Tempted to mock `deriveTheme` from a test → refuse, run the real function with a fixture.
