> **State:** Living. Edit when memo lifecycle norms change.

# Memory lifecycle

Machine-local agent memory (`~/.claude/projects/<repo>/memory/`) is a personal scratchpad — not durable project knowledge. Without a lifecycle convention it accumulates stale snapshots that future agents read and act on as if current. The empty MEMORY.md at the time this doc lands proves the system: every memo that was load-bearing graduated to the repo.

## Three-line rule for any new memo

1. **Frontmatter declares a forcing condition.** Every memo states what kills it. Permanent memos are rare — reserve for genuinely durable personal data.
2. **Update MEMORY.md** with a one-line index entry.
3. **At the next sweep, the forcing condition is checked.** If met, the memo graduates or dies.

## Frontmatter shape

```yaml
---
name: <short title>
description: <one-line hook used in MEMORY.md and recall>
type: user | feedback | project | reference
lifecycle: until-adr-NNNN | until-issue-NNN | until-YYYY-MM-DD | snapshot-YYYY-MM-DD | permanent
---
```

The `lifecycle:` field is mandatory. Valid values:

- **`until-adr-NNNN`** — memo graduates when ADR-NNNN lands. Pointer-style memos.
- **`until-issue-NNN`** — memo graduates when GH issue NNN closes (the issue's resolution is what makes the memo redundant).
- **`until-YYYY-MM-DD`** — memo expires on a date. Use sparingly; date-based expiries decay silently if the date passes between sweeps.
- **`snapshot-YYYY-MM-DD`** — frozen point-in-time observation; verify against current state before acting on it. Sweep deletes if older than 30 days.
- **`permanent`** — durable personal data (working preferences, identity-shaped facts). Justify in the description.

## Running the sweep

The sweep procedure — walk the index, check each memo's forcing condition, graduate or delete — runs on a recurring cadence (every ~2 weeks or every N slices, whichever lands first) and lives as the `sweep` skill. This doc is the policy that sweep enforces: the forcing conditions above and the graduation table below.

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
- Anything already documented in `CLAUDE.md` or `docs/agents/`.
- Ephemeral conversation state, in-progress task details.

If the user explicitly asks to save activity logs or PR lists, ask what was *surprising* or *non-obvious* about them — that is the part worth keeping.

## Why this convention exists

Memory is read at generation time and acted on as if current. A 5-day-old project ledger that says "lock is `lockedSnapshot: LockedSnapshot | null`" produces an agent who proposes that shape, even though the code pivoted to `seedHexLock: boolean` four days ago. The lifecycle field forces every memo to declare what kills it; the sweep enforces graduation; the empty MEMORY.md at write-time proves the system can drain itself.
