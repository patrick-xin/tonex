# Session flow

Reading order when an agent starts work here. Designed so the user doesn't recite a manifest each session, and so the rules arrive *with the code* rather than as an upfront pile.

## Auto-loaded
- `CLAUDE.md` (repo root) — entry pointer.
- **Nested `CLAUDE.md`** — the working rules for a subtree load when you touch it; you don't fetch these, they come with the files. **The invariant: every package carrying authored, non-vendored code carries a `CLAUDE.md`** (so the convention tracks the package topology instead of freezing to whatever existed when it was written). Deep surfaces dispatch onward to a `rules/` tree — `packages/core/CLAUDE.md` (engine, schema, sinks, seed), `apps/www/CLAUDE.md` (app structure, state, components). Thin packages are a single file: the **consumers** `packages/cli` + `packages/core-react` (consume `@tonex/core`, never re-implement it) and the **boundary** `packages/color-utils` (the culori firewall). Exempt: vendored code (`packages/mcu`, graduating back to an npm dep) and config (`packages/typescript-config`). New package with authored code → it gets a `CLAUDE.md`.
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

0. **`packages/core/docs/agents/api/core-surface.md`** — *if you're working in a consumer* (`packages/cli`, `packages/core-react`, `apps/www`, a future MCP server): what `@tonex/core` exposes by subpath. Read it before walking core's source so you surface what already exists instead of re-deriving/re-encoding/re-scoring in the consumer.
1. **`glossary.md`** — domain vocabulary. Use these terms; don't drift to synonyms.
2. **`docs/adr/`** — load-bearing decisions. There's no index file; the filenames are the titles, so `ls docs/adr/` and skim the slugs, then read in detail any that touch your work area.
3. **`docs/agents/working-style.md`** — collaboration norms.
4. **Active issue / PRD** in the tracker — what you're building.

Recent commits are already in the `SessionStart` output above — glance there for where the code actually is, no separate `git log` needed. When you open files under `packages/core/` or `apps/www/`, that subtree's `CLAUDE.md` arrives automatically — the working rules come with the code.

## Read when relevant

- `docs/agents/issue-tracker.md` / `triage-labels.md` — how issues are organized; triage label vocabulary.
- `docs/agents/memory-lifecycle.md` — memory lifecycle.

## For subagents

Subagents start cold,  They can't see machine-local memory or session history — anything load-bearing must live in repo files. Point them at specific paths (code with `// why:`, ADRs, `glossary.md`, this doc), don't restate rules in the prompt; repo paths are durable, prompt content evaporates with the subagent.

