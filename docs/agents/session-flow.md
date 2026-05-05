> **State:** Living. Edit when the session-start reading order changes.

# Session flow

Reading order when an agent starts work in this repo. Designed so the user does not have to recite a reading manifest each session.

## Auto-loaded by the harness

These reach the agent without explicit reads:
- `CLAUDE.md` — repo-level instructions
- (For Claude Code main agents only) machine-local memory at `~/.claude/projects/<repo>/memory/`

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

## For subagents

Subagents start cold and cannot see machine-local memory. Their orchestrator is responsible for either:
- Pointing them at specific repo paths in their prompt, or
- Letting them read `CONTEXT.md` + the relevant ADR(s) + `docs/agents/working-style.md` themselves.

Never assume a subagent has prior session context.

## Doc lifecycle (one-line summary)

Each repo doc declares its lifecycle state in a header line at the top:
- **Living** — edit when code triggers (`CLAUDE.md`, `CONTEXT.md`, `docs/agents/*`)
- **Frozen** — append amendment block only (`docs/adr/*`)
- **Transient** — issue tracker (PRDs, slices, bugs)

If a doc has no header, treat it as suspect — it predates the lifecycle policy.
