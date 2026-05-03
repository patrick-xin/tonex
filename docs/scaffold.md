# Monorepo scaffold — 2026-05-03

Documents what was built in the Phase 1 scaffolding session and the decisions made. ADRs 0011–0016 (monorepo layout, MCU vendoring, layer architecture, www structure, hydration guard, domain discipline) are pending and will be drafted after slice 1 lands.

---

## What was built

```
tonex/
├── package.json                  workspace root; turbo scripts + husky prepare
├── pnpm-workspace.yaml           workspace globs + shared version catalog
├── turbo.json                    task graph: build, dev, test, typecheck, lint
├── biome.json                    linter + formatter (replaces ESLint + Prettier)
├── .commitlintrc.json            conventional commits enforcement
├── .npmrc                        shamefully-hoist=false
├── .gitignore
├── .husky/
│   ├── pre-commit                runs lint-staged (biome check --write on staged files)
│   └── commit-msg                runs commitlint
├── .github/workflows/test.yml    CI seam (TODO stub — pnpm + turbo wiring pending)
├── packages/
│   ├── typescript-config/        @tonex/typescript-config
│   │   ├── base.json             strict base (target ES2022, bundler resolution, all strict flags)
│   │   ├── nextjs.json           extends base + dom lib, jsx preserve, allowJs, noEmit
│   │   └── library.json          extends base (for @tonex/core)
│   ├── mcu/                      @tonex/mcu — vendored MCU 2026 spec sources
│   │   ├── index.ts              re-exports everything
│   │   └── tsconfig.json         extends base.json, relaxes noUncheckedIndexedAccess + exactOptionalPropertyTypes
│   └── core/                     @tonex/core — empty barrel, ready for slice 1
│       ├── src/index.ts
│       ├── tsconfig.json         extends library.json, paths: @tonex/mcu → ../mcu/index.ts
│       └── vitest.config.ts      tsconfigPaths plugin, passWithNoTests: true
└── apps/
    └── www/                      @tonex/www — Next.js 16 + Tailwind v4
        ├── src/app/layout.tsx    <body class="md"> placeholder (ThemeProvider added in slice 1)
        ├── src/app/page.tsx
        ├── src/app/globals.css   @import "tailwindcss"
        ├── next.config.ts
        ├── postcss.config.mjs    @tailwindcss/postcss
        ├── tsconfig.json         extends nextjs.json, paths: @/* @tonex/core @tonex/mcu
        └── vitest.config.ts      react + tsconfigPaths plugins, jsdom, passWithNoTests: true
```

---

## Decisions made this session

### Turborepo added (overrides prior plan)
Prior grilling session settled on "pnpm workspaces, no Turborepo today." Revisited and reversed: even with a source-only workspace (no built dist between packages during dev), Turborepo earns its keep via CI test caching (`turbo run test --filter=[HEAD^1]`) and production build ordering. Setup cost is ~20 lines in `turbo.json`. ADR-0011 will record this.

### `packages/typescript-config` (Turborepo standard)
Instead of `tsconfig.base.json` at root (relative paths like `../../tsconfig.base.json`), a proper `@tonex/typescript-config` package provides named presets (`base.json`, `nextjs.json`, `library.json`). Each package extends by name, not path. MCU's tsconfig relaxes two strict options inline (vendored code, not our concern).

### pnpm workspace catalog
Shared dev dependencies (`vitest`, `typescript`, `vite-tsconfig-paths`, `@vitejs/plugin-react`) are pinned once in `pnpm-workspace.yaml` under `catalog:` and referenced as `"catalog:"` in package.json files. Prevents silent version drift between packages.

### Biome 2.x (not ESLint + Prettier)
Single tool for linting and formatting. Runs via lint-staged on pre-commit (staged files only). `packages/mcu/` is excluded from biome — it is vendored Google code. Biome 2.4.14 schema (migrated from 2.0.0 via `biome migrate`).

### Conventional commits enforced
`@commitlint/config-conventional` via husky `commit-msg` hook. Format: `type(scope): description` — e.g. `feat:`, `fix:`, `chore:`, `docs:`.

---

## QA findings and fixes (same session)

| # | Finding | Fix |
|---|---|---|
| 1 | GitHub repo slug wrong in `CLAUDE.md` and `docs/agents/issue-tracker.md` — `patrickxin/tonex` should be `patrick-xin/tonex` | Patched both files |
| 2 | `apps/www` vitest config used `environment: 'jsdom'` but `jsdom` was not installed | Added `jsdom` to www devDependencies |
| 3 | `packages/core` vitest exits code 1 with no test files (expected during scaffolding) | Added `passWithNoTests: true` to both vitest configs |
| 4 | `biome.json` used schema `2.0.0` but installed Biome was `2.4.14` — schema mismatch, `files.ignore` and `organizeImports` keys no longer valid | Ran `biome migrate --write`; `files.ignore` → `files.includes` with negation; `organizeImports` → `assist.actions.source.organizeImports` |
| 5 | `packages/mcu` produced 200+ biome warnings (vendored code style) | Added `!packages/mcu/**` to `biome.json` includes |
| 6 | `@tonex/mcu` and `@tonex/typescript-config` appeared in turbo test scope despite having no `test` script | Turbo silently skips missing scripts — no action needed |

---

## Deferred / pending

- **CI workflow** (`.github/workflows/test.yml`) — stub only; needs pnpm setup action, install, `turbo run test`
- **ADRs 0011–0016** — monorepo layout, MCU vendoring, layer architecture, www structure, hydration guard, domain discipline — draft after slice 1 lands
- **Deliberate upgrades to evaluate separately:**
  - TypeScript 5 → 6 (major, potential breaking changes)
  - Vitest 3 → 4 (requires Vite 6; upgrade together with `@vitejs/plugin-react` v4 → v6)
  - `vite-tsconfig-paths` 5 → 6 (tied to Vite 6 upgrade)
  - `@types/node` 22 → 25 (low risk, independent)

---

## MCU vendor migration path

When Google publishes an official npm release of the 2026 spec:
1. Remove `packages/mcu/`
2. `pnpm add @material/material-color-utilities --filter @tonex/core`
3. Update path aliases in `packages/core/tsconfig.json` and `apps/www/tsconfig.json` — change `@tonex/mcu` target from `../mcu/index.ts` to the npm package
4. Remove `@tonex/mcu` from workspace

Import paths in source code (`import { ... } from '@tonex/mcu'`) do not change.
