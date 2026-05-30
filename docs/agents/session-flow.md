> **State:** Living. Edit when the session-start reading order or enforcement layer changes.

# Session flow

Reading order when an agent starts work here. Designed so the user doesn't recite a manifest each session, and so the rules arrive *with the code* rather than as an upfront pile.

## Auto-loaded (no read action)
- `CLAUDE.md` (repo root) — entry pointer.
- **Nested `CLAUDE.md`** — the working rules for a subtree load when you touch it: `packages/core/CLAUDE.md` (engine, schema, sinks, seed), `apps/www/CLAUDE.md` (app structure, state boundaries, component conventions) You don't fetch these — they come with the files.
- (Claude Code main agents only) machine-local memory at `~/.claude/projects/<repo>/memory/`.
- `SessionStart` hook output — branch, recent commits, uncommitted state.

## Enforcement layer (checked in, runs for every agent)

Two complementary gates, deterministic-first:

- **`scripts/check-conventions.mjs`** (deterministic) — the import/type-shape rules a regex can settle: the culori firewall (ADR-0025), the `next-themes` allowlist (ADR-0015), inline `'light' | 'dark'` / `['light','dark']` Mode-union literals (ADR-0016). Runs on staged `.ts/.tsx` via lint-staged (`.husky/pre-commit`), so **any file you touch must be clean**; `pnpm check:conventions` audits the whole tree.
- **Stop drift sentinel** (judgment) — a prompt pass scanning the last turn for the **four** patterns a regex can't settle: ADR decision rewrites, stripped lifecycle headers, sink-side color logic, and what/narrative comments. Blocks the stop only on clear, named drift.
- **PostToolUse on Edit|Write** — advisory reminder when a frozen-rationale ADR, a sink-layer file (`applyDom.ts`, `exporters/*.ts`), or a lifecycle-headed doc is touched. Not blocking.

## Read on every non-trivial start

Before writing or editing code:

1. **`CONTEXT.md`** — domain vocabulary. Use these terms; don't drift to synonyms.
2. **`docs/adr/`** — load-bearing decisions. There's no index file; the filenames are the titles, so `ls docs/adr/` and skim the slugs, then read in detail any that touch your work area.
3. **`docs/agents/working-style.md`** — collaboration norms.
4. **Active issue / PRD** in the tracker — what you're building.

Recent commits are already in the `SessionStart` output above — glance there for where the code actually is, no separate `git log` needed. When you open files under `packages/core/` or `apps/www/`, that subtree's `CLAUDE.md` arrives automatically — the working rules come with the code.

## Read when relevant
- `packages/core/docs/agents/api/core-surface.md` — what `@tonex/core` exposes, by subpath. Read before importing from `@tonex/core` in www.
- `docs/agents/issue-tracker.md` / `triage-labels.md` — how issues are organized; triage label vocabulary.
- `docs/agents/{slice-strategy,tdd,decision-flow,memory-lifecycle}.md` — slice discipline, the test-first contract, how decisions are captured, memory lifecycle.

## For subagents

Subagents start cold, can't see machine-local memory, and **may not get the nested `CLAUDE.md` auto-load**. Their orchestrator must hand them paths. For any code task, point a subagent at:
- `CONTEXT.md` + the relevant ADR(s), and
- the working rules for its area — `packages/core/CLAUDE.md` and/or `apps/www/CLAUDE.md` (+ the rail file for rail work), and
- `docs/agents/working-style.md`.

Never assume a subagent has prior session context or auto-loaded subtree rules.

## Before reporting done

Run `pnpm biome check <touched-files>` and `pnpm check:conventions` (or just commit — lint-staged runs both on staged files) and fix what's flagged. The project enforces single quotes, semicolons-as-needed, trailing commas. Style regressions on touched files are the most common avoidable miss — let biome catch them.

## Doc lifecycle (one-line summary)

Each repo doc declares its lifecycle state in a header line at the top:
- **Living** — edit when code triggers (`CLAUDE.md` + nested `CLAUDE.md`, `CONTEXT.md`, `docs/agents/*`).
- **Living rationale** (`docs/adr/*`) — the decision and its *why* don't change without a new ADR (or an append-only amendment); the body may be cleaned as code moves.
- **Transient** — issue tracker (PRDs, slices, bugs).

If a doc has no header, treat it as suspect — it predates the lifecycle policy.
