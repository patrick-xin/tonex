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
