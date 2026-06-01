---
name: slice
description: Apply tonex's build method — vertical slices with a one-sentence promise, two-adapters = real seam, Red-Green-Refactor, blueprint slices — when planning, decomposing, deciding "what should I build next?", or judging whether an abstraction is earned. Use at the start of any design/phasing task, especially file-free planning, or whenever invoked via /slice. The method docs are real but filed under session-flow's weak "read when relevant" gate that planning tasks (no files touched → no nested-CLAUDE.md delivery) systematically miss; this injects them on demand.
---

# Slice

The build method for turning a decision into shipped work: **vertical slices, test-first, abstractions only when earned.** Invoke before any planning, decomposition, "what next", or abstraction-design task — the kind that touches no files, so the nested-`CLAUDE.md` "rules arrive with the code" delivery never fires and the method sits behind session-flow's weakest gate ("read when relevant").

This skill owns the *operating procedure*; the *policy* lives in docs. Don't restate the rules — read them:
- Slice discipline + the **"two-adapters = real seam"** rule → `docs/agents/slice-strategy.md`.
- The test-first contract — "the process" here *is* Red-Green-Refactor — → `docs/agents/tdd.md`, plus the per-layer testing shards it points to.

## Gates — apply every time

1. **One-sentence promise, stated first.** Can't say the slice in one sentence? Too big — split. The Red test captures the promise. (slice-strategy rule 1)
2. **No "while I'm here."** Anything outside the Red test is a *different* slice. YAGNI inside the slice. (rule 2)
3. **Two adapters = real seam.** One concrete consumer = no abstraction; two = candidate. A *speculative* second ("we might add X") does not count — a second concrete adapter being actually in scope is what flips it. The rule ADR-0001/ADR-0004 invoke but only `slice-strategy.md` defines.
4. **Red-Green-Refactor.** Refactor (third R) only on green; never while red. (tdd)
5. **Blueprint slices are legitimate** — no code, only ADRs / doc updates — when a decision spans multiple implementation slices and must land first. Name them as such; cite ADR-0019 / ADR-0020. Don't reinvent the concept unnamed.
6. **Depth before breadth in foundation slices.** Smallest token set that exercises every seam (source → derive → DOM → export, light/dark, md + shadcn) before scaling coverage. Slice 1 verifies *both* layers — the "and" is load-bearing.

## Output contract

- Asked "what should I build next?" → **name the one-sentence promise first**, then refuse expansions.
- Each proposed slice carries its Red test as the contract; don't describe code beyond what that test demands.
- When you lean on "two-adapters = real seam," cite both the rule (`slice-strategy.md`) and the ADR applying it — close the cross-link session-flow leaves dangling.
- Any phasing that bundles two seams into one step is a rule-1 violation — flag it and split.
