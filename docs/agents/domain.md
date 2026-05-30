# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in.

## File structure

Multi-context repo:

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── packages/
    ├── core/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
└── apps/
    ├── www/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
```

## ADR numbers are the join key

Code cites ADRs by number (`ADR-0018`, `ADR-0009 c.4`), never by path or title. The number is the contract; path, title, and directory are mutable metadata. **Never renumber an ADR** — moving the file is free, but renumbering (even `0014`→`0015`) silently severs every code reference. New decision → next free number; a superseded decision keeps its number and is marked superseded.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

