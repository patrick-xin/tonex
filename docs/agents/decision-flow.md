> **State:** Living. Edit when decision-capture norms change.

# How decisions are captured

When a decision changes how we approach work that an existing rule already covers, do **not** silently update the existing doc. File an issue via `/to-issues` that captures the new decision and references the affected doc by name.

**Why:** Docs that get edited in-place lose their decision history. If a future session asks "why did we decide X" and the doc has already been overwritten with the new guidance, the chain is broken. Issues are durable, dated, and explain *what changed and why* — even when the original doc and the updated doc appear to agree on the surface.

## How to apply

- **New rule with no prior conflict** — write it in the appropriate doc: a subtree code rule in the nearest `CLAUDE.md` (`packages/core/CLAUDE.md`, `apps/www/CLAUDE.md`); else `working-style.md` / `slice-strategy.md` / root `CLAUDE.md`. No issue needed; nothing to track against.
- **Decision that contradicts or refines an existing rule** — file an issue first via `/to-issues`. The doc update can come later; the issue is the source of truth for the change.
- **Decision that needs a new ADR** — write the ADR directly. A new ADR is net-new rationale and an amendment is append-only, so neither overwrites history — the ADR *is* the durable, dated rationale store, and routing it through a throwaway issue first buys nothing. (The issue-first rule above protects *living*-doc history from in-place overwrites; ADRs don't have that failure mode.)
- **When unsure** whether a decision modifies an existing rule, lean toward filing an issue. The cost of an extra issue is small; the cost of lost rationale is high.

## From decision to code

The chain for a decision big enough to need an ADR:

1. **ADR** — written directly (rationale; a new ADR, or an append-amendment to the one it refines).
2. **`/to-prd`** — publish the spec to the tracker as a PRD issue (the problem / solution / user-stories / implementation-decisions shape, e.g. issue #80).
3. **`/to-issues`** — split the PRD into independently-grabbable slice issues when it spans more than one; a one-chunk PRD skips this.
4. **Implement** — the planner writes each slice's Red test as the contract (see `working-style.md`, "The planner writes the contract"); the implementer makes it green and refactors.

PRDs live on the tracker (transient — see the lifecycle convention), not as `docs/prd/` files. `docs/prd/0021` is a blueprint-era exception paired with the foundational export ADR.

## Agent role

The `/to-prd` and `/to-issues` skills are user-invoked, not agent-invoked. When a moment calls for one, surface it: "this looks like a `/to-issues` moment — want me to draft the issue body?"

## Authoring & auditing ADRs

ADRs hold living *rationale* — the why behind a decision, in a form that survives reorganization and reimplementation. They are not implementation records, and not an inventory of where code lives.

- **Write rationale, not implementation.** Strip implementation pointers (file paths, function signatures, schema versions, test references) and forward-looking slice plans ("Slice 1 — …; Slice 2 — …") — code is the truth-source for those, and the ADR rots against it once the work lands. Keep a code block only when it names the exact contract surface the decision changes (a tsconfig flag being relaxed, a discriminated-union case being added); strip blocks that merely illustrate or recap code.
- **Folder and feature names are convention, not decision.** Where something lives (`features/<name>/`, popover or route-group names) belongs in `apps/www/CLAUDE.md`, `working-style.md`, or `CONTEXT.md` — never in an ADR. Keep the *principle* ("a prompt 'do X to Y' resolves to one folder under `features/<Y>/`"); drop the *roster* of specific folders. Names rot; rationale doesn't.
- **Audit disposition is archive, not delete.** When an audit finds a non-load-bearing ADR — a glossary entry or meta-rule that doesn't constrain runtime behavior, code structure, or a contract surface — move it to `docs/adr/_archive/`, don't delete it. That we once thought it earned an ADR slot is itself a lesson. Vocabulary still relocates to `CONTEXT.md` and meta-rules to agent docs; the archived file stays on disk, excluded from the live audit set.
