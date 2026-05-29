> **State:** Living. Edit when adding a constraint with no in-code home.

## Agent context

Agent context (working style, conventions, durable rules) lives in `docs/agents/`. Subtree code rules auto-load from nested `CLAUDE.md` — `packages/core/CLAUDE.md` (engine) and `apps/www/CLAUDE.md` (app) — when you touch those trees. Promote stable rules to repo; keep memory for transient observations only.

Starting work? Read `docs/agents/session-flow.md` for the reading order.

## Agent skills

### Issue tracker
Issues live in GitHub Issues at `patrick-xin/tonex`. See `docs/agents/issue-tracker.md`.

### Triage labels
Default canonical label strings (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs
Single-context repo — one `CONTEXT.md` (vocabulary) and `docs/adr/` (decisions) at the root. Use `CONTEXT.md` terms; skim ADR filenames and read those touching your area.
