> **State:** Living. Edit when decision-capture norms change.

# How decisions are captured

When a decision changes how we approach work that an existing rule already covers, do **not** silently update the existing doc. File an issue via `/to-issues` that captures the new decision and references the affected doc by name.

**Why:** Docs that get edited in-place lose their decision history. If a future session asks "why did we decide X" and the doc has already been overwritten with the new guidance, the chain is broken. Issues are durable, dated, and explain *what changed and why* — even when the original doc and the updated doc appear to agree on the surface.

## How to apply

- **New rule with no prior conflict** — write it in the appropriate doc (`CLAUDE.md`, working-style, code-conventions, slice-strategy, etc.). No issue needed; nothing to track against.
- **Decision that contradicts or refines an existing rule** — file an issue first via `/to-issues`. The doc update can come later; the issue is the source of truth for the change.
- **Decision that needs a new ADR** — file the issue first. ADRs hold living rationale, but a new decision (or a flip of an existing one) gets a new ADR; the rationale must be captured before the ADR text is written.
- **When unsure** whether a decision modifies an existing rule, lean toward filing an issue. The cost of an extra issue is small; the cost of lost rationale is high.

## Agent role

The `/to-issues` skill is user-invoked, not agent-invoked. When a moment calls for one, surface it: "this looks like a `/to-issues` moment — want me to draft the issue body?"

## Authoring & auditing ADRs

ADRs hold living *rationale* — the why behind a decision, in a form that survives reorganization and reimplementation. They are not implementation records, and not an inventory of where code lives.

- **Write rationale, not implementation.** Strip implementation pointers (file paths, function signatures, schema versions, test references) and forward-looking slice plans ("Slice 1 — …; Slice 2 — …") — code is the truth-source for those, and the ADR rots against it once the work lands. Keep a code block only when it names the exact contract surface the decision changes (a tsconfig flag being relaxed, a discriminated-union case being added); strip blocks that merely illustrate or recap code.
- **Folder and feature names are convention, not decision.** Where something lives (`features/<name>/`, popover or route-group names) belongs in `working-style.md`, `www-structure.md`, or `CONTEXT.md` — never in an ADR. Keep the *principle* ("a prompt 'do X to Y' resolves to one folder under `features/<Y>/`"); drop the *roster* of specific folders. Names rot; rationale doesn't.
- **Audit disposition is archive, not delete.** When an audit finds a non-load-bearing ADR — a glossary entry or meta-rule that doesn't constrain runtime behavior, code structure, or a contract surface — move it to `docs/adr/_archive/`, don't delete it. That we once thought it earned an ADR slot is itself a lesson. Vocabulary still relocates to `CONTEXT.md` and meta-rules to agent docs; the archived file stays on disk, excluded from the live audit set.
