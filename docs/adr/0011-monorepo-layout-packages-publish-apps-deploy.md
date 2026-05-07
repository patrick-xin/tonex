> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Monorepo layout — packages publish, apps deploy

Tonex is a pnpm workspace. The conventional split "uses core / is core" is one option; the chosen split is by *publishability*.

**Decision:**

1. **`packages/`** holds publishable npm artifacts. Today: `@tonex/core` (engine + store + hook + applyDom + registries; zero JSX), `@tonex/mcu` (vendored MCU spec — see ADR-0012), `@tonex/typescript-config` (shared tsconfig bases). Future: `@tonex/cli` if and when a publishable CLI binary ships.

2. **`apps/`** holds deployed targets. Today: `apps/www` (Next.js + Tailwind v4 + shadcn + base-ui).

3. **Workspace = one tree at the type level.** Root tsconfig path mappings point at *source* files (`@tonex/core/*` → `packages/core/src/*`), never at built `dist/` outputs. Stack traces, grep, and "go to definition" all converge on source. **Internal packages must never publish dist between themselves** — the illusion of "@tonex/core is npm-installed" is the trap.

4. **Turborepo orchestrates tasks.** Root scripts (`build`, `dev`, `test`, `typecheck`, `lint`) all delegate to `turbo run`. Per-package scripts are the canonical commands; `turbo.json` wires the dependency graph. The cache (`.turbo/`) is gitignored — it lives in user environments and CI, never committed.

**Why:** Splitting by publishability gives a cleaner conceptual line than "uses core / is core." A CLI is a publishable binary regardless of whether it imports core; the www site is a deployed target regardless of which packages it consumes. Source-mode workspace mapping keeps the dev loop fast (no dist build between core edits and www reload) and keeps debugging legible.

**Consequence:**

- New publishable artifact (CLI, plugin, second-consumer library) → goes in `packages/` with `private: true` in package.json until it's ready to publish.
- New deployed target (a docs site, a marketing page) → goes in `apps/`.
- One `core` package today. Splitting (e.g. `@tonex/spine` + `@tonex/registries`) only when a second consumer arrives. **Two adapters = real seam; one consumer = manufactured seam.**
- Per-package tsconfig may relax strict bits locally (per ADR-0012 for mcu) without bleeding into the shared base.
- Subpath exports from `@tonex/core` (`/schema`, `/oklch`, `/data`, `/variants`) are the public surface (per ADR-0016). Reaching into `@tonex/core/src/...` bypasses the surface — refuse.
