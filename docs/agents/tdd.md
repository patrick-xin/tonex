# Testing in tonex

Shared principles below. The per-layer canonical pattern + config delta live in each layer's testing shard:
- **Core** (incl. `color-utils`) → [`packages/core/docs/agents/rules/testing.md`](../../packages/core/docs/agents/rules/testing.md)
- **www** → [`apps/www/docs/agents/rules/testing.md`](../../apps/www/docs/agents/rules/testing.md)

## Runner

**vitest, monorepo-wide.** One runner across all packages and apps.
- ESM-native, fast watch mode (sub-second on edit)
- Same runner for `core` / `color-utils` (node) and `www` (jsdom)
- `globals: false` everywhere — explicit `import { describe, it, expect } from 'vitest'`. No ambient globals to chase when reading a test cold.

## Test location

**Co-located, `*.test.ts` suffix, next to source.** Not `__tests__/` folders, not a top-level `test/` mirror.

```
packages/core/src/theme/derive/
  derive.ts
  derive.test.ts
  cache.ts
  cache.test.ts
```

**Reasoning:** when an agent opens `derive.ts`, `derive.test.ts` is the next file in the listing. Test-first becomes the obvious move because the test file is *visibly there*. `__tests__/` hides tests; top-level mirrors require navigation.

**One exception:** integration tests that span multiple files live in `src/__integration__/` (today: www's `globals-drift.test.ts`). They're not a unit's test, so co-locating them is a lie.

## Three layers

| Layer | Where | Env | What it tests |
|---|---|---|---|
| Unit | next to source | vitest — node (core) / jsdom (www) | Pure functions, hooks, lib helpers with shape/invariant contracts |
| Integration | `src/__integration__/` | vitest, jsdom | Cross-file wiring; today: baked `globals.css` vs `deriveTheme(DEFAULT_INPUTS)` drift guard |
| E2E (later) | `apps/www/e2e/` | Playwright | Golden path: upload → swatches → preview → export |

E2E is "later" — no folder yet; build the harness when there's a screen to test.

## What to test

**The criterion:** *would a regression here break a documented contract a caller depends on?* If yes, write the test. If you're reaching for a test to lift a coverage number without an invariant to pin, don't.

Worth pinning:
- **Pure functions with token / shape contracts** — `deriveTheme`, exporters, importers, contrast utilities. The output fields *are* the spec.
- **Hooks with documented invariants** — referential stability, latest-handler semantics, lifecycle guarantees. (www canonical → the www testing shard.)
- **Module-edge contracts** — anything a downstream caller imports by name and relies on for shape, not just behaviour.

Skip:
- **Ad-hoc smoke tests against dead code paths** — exercising a branch that no caller depends on. Coverage % is not a contract.
- **Vendored UI primitives** (`components/ui/*`) — wrap or scope at the call site instead; the primitive is a re-vendor target ([[feedback_dont_edit_vendored_ui]]).
- **Next route components / pages** — pin the helpers they call, not the JSX. E2E layer covers the wiring later.
- **Curated-data features** — defer until the promotion slice ([[feedback_tdd_exception_data_curation]]); curation iterates on output shape, not behaviour.

## Snapshots

Prefer explicit assertions over snapshots for any contract surface — a snapshot's "just update it" reflex erodes tests-as-spec. **The core spine bans them outright** (`deriveTheme`, exporters, importers, derive stages) — see the core testing shard. Snapshots stay fine where the *exact* shape isn't the contract: rendered HTML for visual regression, error messages, www's `bundle-snapshot`.

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

**Catalog deps.** Test deps live in `pnpm-workspace.yaml` catalog: `vitest`, `@vitest/coverage-v8`, `vite-tsconfig-paths`, `@vitejs/plugin-react`. Reference with `"catalog:"` in `package.json`, don't pin a version inline.

## How to apply

- Writing a core test → the deriveTheme canonical pattern in the [core testing shard](../../packages/core/docs/agents/rules/testing.md).
- Writing a www hook test → the useEventCallback canonical pattern in the [www testing shard](../../apps/www/docs/agents/rules/testing.md).
- Picking a target → run the "what to test" criterion above. No documented contract on the line? Don't write it.
- Tempted to use a `__tests__/` folder → refuse, co-locate.
