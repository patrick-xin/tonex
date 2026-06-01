# Session flow

Reading order when an agent starts work here. Designed so the user doesn't recite a manifest each session, and so the rules arrive *with the code* rather than as an upfront pile.

## Auto-loaded
- `CLAUDE.md` (repo root) — entry pointer.
- **Nested `CLAUDE.md`** — the working rules for a subtree load when you touch it: `packages/core/CLAUDE.md` (engine, schema, sinks, seed), `apps/www/CLAUDE.md` (app structure, state boundaries, component conventions). You don't fetch these — they come with the files.
- (Claude Code main agents only) machine-local memory at `~/.claude/projects/<repo>/memory/`.
- `SessionStart` hook output — branch, recent commits, uncommitted state.

## Read on every non-trivial start

### Domain docs

Docs live per layer, adr are cited by number.
- system-wide in `docs/adr/`, 
- engine 
  - glossary:`packages/core/docs/glossary`
  - adr: `packages/core/docs/adr/`, 
- web app
  - glossary:`apps/www/docs/glossary`
  - adr: `apps/www/docs/adr/`,

1. **`glossary.md`** — domain vocabulary. Use these terms; don't drift to synonyms.
2. **`docs/adr/`** — load-bearing decisions. There's no index file; the filenames are the titles, so `ls docs/adr/` and skim the slugs, then read in detail any that touch your work area.
3. **`docs/agents/working-style.md`** — collaboration norms.
4. **Active issue / PRD** in the tracker — what you're building.

Recent commits are already in the `SessionStart` output above — glance there for where the code actually is, no separate `git log` needed. When you open files under `packages/core/` or `apps/www/`, that subtree's `CLAUDE.md` arrives automatically — the working rules come with the code.

## Read when relevant

- `docs/agents/issue-tracker.md` / `triage-labels.md` — how issues are organized; triage label vocabulary.
- `docs/agents/{slice-strategy,tdd,memory-lifecycle}.md` — slice discipline, the test-first contract, memory lifecycle.

## For subagents

Subagents start cold,  They can't see machine-local memory or session history — anything load-bearing must live in repo files. Point them at specific paths (code with `// why:`, ADRs, `glossary.md`, this doc), don't restate rules in the prompt; repo paths are durable, prompt content evaporates with the subagent.

