# Memory lifecycle

Machine-local agent memory (`~/.claude/projects/<repo>/memory/`) is a personal scratchpad, not durable project knowledge. A memo is read at generation time and acted on as if current, so every memo must declare what kills it; without a forcing condition, stale snapshots accumulate and future agents act on them. Load-bearing knowledge graduates to the repo.

## Three-line rule for any new memo

1. **Frontmatter declares a forcing condition.** Every memo states what kills it. Permanent memos are rare — reserve for genuinely durable personal data.
2. **Update MEMORY.md** with a one-line index entry.
3. **At the next sweep, the forcing condition is checked** — if met, the memo graduates or dies.

## Frontmatter shape

```yaml
---
name: <short title>
description: <one-line hook used in MEMORY.md and recall>
type: user | feedback | project | reference
lifecycle: until-adr-NNNN | until-issue-NNN | until-YYYY-MM-DD | snapshot-YYYY-MM-DD | permanent
---
```

`lifecycle:` is mandatory:

- **`until-adr-NNNN`** — graduates when ADR-NNNN lands. Pointer-style memos.
- **`until-issue-NNN`** — graduates when GH issue NNN closes.
- **`until-YYYY-MM-DD`** — expires on a date. Use sparingly.
- **`snapshot-YYYY-MM-DD`** — frozen point-in-time observation; verify against current state before acting on it. Sweep deletes if older than 30 days.
- **`permanent`** — durable personal data; justify in the description.

## Running the sweep

The sweep — walk the index, check each memo's forcing condition, graduate or delete — runs every ~2 weeks or every N slices (whichever lands first) as the `sweep` skill. This doc is the policy sweep enforces.

## What graduates where

| Memo content | Graduates to |
|---|---|
| Decision rationale | `docs/adr/NNNN-...md` |
| Working norm / convention | `docs/agents/<topic>.md` |
| Glossary / vocabulary | the layer `glossary.md` |
| Slice / shipped history | `CHANGELOG.md` |
| Open work item | GH issue with appropriate label |
| Strategic / competitor / sibling-product positioning | `docs/private/<topic>.md` (gitignored) |
| User-specific preference | stays in memory, `lifecycle: permanent` |

## What never goes into memory

Even when the user asks to save:

- Code patterns or architecture (derive from current code).
- File paths or project structure (derive from `ls`/`tree`).
- Git history / who-changed-what (derive from `git log`).
- Debugging fix recipes (the fix is in the code; the commit message has the context).
- Anything already documented in `AGENTS.md` or `docs/agents/`.
- Ephemeral conversation state, in-progress task details.

If the user explicitly asks to save activity logs or PR lists, ask what was *surprising* or *non-obvious* about them — that is the part worth keeping.
