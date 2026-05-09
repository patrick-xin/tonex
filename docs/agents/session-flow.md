> **State:** Living. Edit when the session-start reading order changes.

# Session flow

Reading order when an agent starts work in this repo. Designed so the user does not have to recite a reading manifest each session.

## Auto-loaded by the harness

These reach the agent without explicit reads:
- `CLAUDE.md` — repo-level instructions
- (For Claude Code main agents only) machine-local memory at `~/.claude/projects/<repo>/memory/`
- `SessionStart` hook output — branch, recent commits, uncommitted state (see `.claude/hooks/session-context.sh`)

## Hooks

`.claude/settings.json` registers three hooks. They're checked in so every agent in this repo runs the same drift-prevention layer:

- **SessionStart** — prints repo state into opening context (above).
- **PostToolUse on Edit|Write** — surfaces a reminder when a frozen ADR, sink-layer file (`applyDom.ts`, `exporters/*.ts`), or living doc with a lifecycle header is touched. Advisory, not blocking.
- **Stop drift sentinel** — prompt-based pass that scans the last turn for four named drift patterns (frozen-ADR rewrites, stripped lifecycle headers, sink-side color logic, what-comments). Blocks the stop only on clear, named drift.

## Read on every non-trivial start

Before writing or editing code, read in this order:

1. **`CONTEXT.md`** — domain vocabulary. Use these terms; don't drift to synonyms.
2. **`docs/adr/` index** — load-bearing decisions. Skim titles; read in detail any that touch your work area.
3. **`docs/agents/working-style.md`** — collaboration norms.
4. **Recent commits** (`git log --oneline -10`) — where the code actually is now.
5. **Active issue / PRD** in the tracker — what you're building.

## Read when relevant

- **`docs/agents/issue-tracker.md`** — how issues are organized.
- **`docs/agents/triage-labels.md`** — label vocabulary for triage.
- **`docs/agents/domain.md`** — how to consume domain docs across the codebase.
- **`docs/agents/core-surface.md`** — what `@tonex/core` exposes, by subpath. Read before importing from `@tonex/core` in www; saves a round-trip into core's source.

## For subagents

Subagents start cold and cannot see machine-local memory. Their orchestrator is responsible for either:
- Pointing them at specific repo paths in their prompt, or
- Letting them read `CONTEXT.md` + the relevant ADR(s) + `docs/agents/working-style.md` themselves.

Never assume a subagent has prior session context.

## Before reporting done

Run `pnpm biome check <touched-files>` and fix flagged issues. The project enforces single quotes, semicolons-as-needed, trailing commas. Style regressions on touched files (including pre-existing files the agent edited) are the most common avoidable miss — biome catches all of them, so let it.

## Doc lifecycle (one-line summary)

Each repo doc declares its lifecycle state in a header line at the top:
- **Living** — edit when code triggers (`CLAUDE.md`, `CONTEXT.md`, `docs/agents/*`)
- **Frozen** — append amendment block only (`docs/adr/*`)
- **Transient** — issue tracker (PRDs, slices, bugs)

If a doc has no header, treat it as suspect — it predates the lifecycle policy.
