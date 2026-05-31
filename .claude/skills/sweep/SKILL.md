---
name: sweep
description: Periodic maintenance sweep of the two stores that rot silently between sessions — machine-local agent memory and the ADR set. Use when the user asks to run a maintenance sweep, drain or clean up agent memory, audit ADRs, or on the recurring ~2-week / N-slice cadence.
---

# Maintenance sweep

Two stores rot silently between sessions: machine-local agent memory (stale snapshots read as current) and the ADR set (rationale that drifts against the code, or entries that no longer constrain anything). This skill is the recurring procedure that drains them. Run every ~2 weeks or every N slices, whichever lands first — or whenever the user invokes it.

This skill owns the *procedure*; the *policy* it enforces lives in docs. Don't restate the rules here — read them:
- Memory policy (forcing-condition frontmatter, the graduation table, what never goes in) → `docs/agents/memory-lifecycle.md`.
- ADR authoring discipline (rationale, not implementation) → the "ADRs carry rationale" bullet in `docs/agents/working-style.md`.

## 1. Memory sweep

Walk `~/.claude/projects/<repo>/memory/MEMORY.md` top-to-bottom. For each memo:

1. **Forcing condition met?** — `until-adr-NNNN` landed, `until-issue-NNN` closed, `until-YYYY-MM-DD` passed. Graduate the content to its home per the graduation table in `memory-lifecycle.md` (ADR / `docs/agents/` / GH issue / `CHANGELOG.md` / `docs/private/`), then delete the memo and its `MEMORY.md` line.
2. **Snapshot >30 days?** — re-read against current code; refresh the date or delete.
3. **No forcing condition?** — wrong shape: add one, or convert to `permanent` with a justification in the description.
4. **Project ledger?** — shipped history → `CHANGELOG.md`; open items → a GH issue with the right label.

A drained `MEMORY.md` is the success state, not a failure — load-bearing memos graduate to the repo; the rest were disposable.

## 2. ADR audit

Walk the live ADR set across all layers (`docs/adr/`, `packages/core/docs/adr/`, `apps/www/docs/adr/`), skipping `_archive/`.

**Run `pnpm check:adr` first — it is the deterministic half of this audit; don't hand-write one-off scripts for it.** The guard enforces ADR-0034's two invariants in both directions: c.8, every `ADR-N c.M` / amendment citation resolves *forward* to a live anchor; c.11, every active ADR resolves *back* to the code surface it governs via a `**Code anchors:**` footer whose paths each carry an `ADR-N` breadcrumb. Clear everything it flags before the judgment pass — a new ADR with no footer, a citation a fold orphaned, a breadcrumb deleted from a code anchor. The folds below are hand edits; re-run the guard after each.

Then, for each ADR by hand:

1. **Still load-bearing?** — it constrains runtime behavior, code structure, or a contract surface → keep.
2. **Constrains nothing** — a glossary entry or meta-rule that doesn't bind behavior, structure, or a contract → **archive, don't delete.** Move it to `docs/adr/_archive/`; that we once thought it earned an ADR slot is itself a lesson. Relocate live vocabulary to the layer's `glossary.md` and meta-rules to the agent docs before archiving. **Never renumber on the way** (ADR-0011 §5) — the number is the cross-layer join key.
3. **Holds a command-falsifiable result?** — the litmus: *could a command prove a sentence false, with no re-decision?* If yes it is a **result**, and it belongs to the code or test the ADR cites, not the prose (ADR-0034 c.9). Strip embedded results — config/type mirrors, constant values, "passes/fails strict", build-graph or error-count claims — back to the decision and its *why*; cite the test or name the symbol that carries the live truth. A decision's **shape** (a chosen type, a field name, the structure being decided) stays; its **measured behavior** leaves. Re-run `pnpm check:adr` after — the `Code anchors:` footer must survive the trim.

## Reporting

Summarize what moved: memos graduated/deleted, ADRs archived/trimmed, the `pnpm check:adr` end-state (green, or what was fixed to get there), and anything that needs a human decision (a memo with no clear home, an ADR whose load-bearingness is ambiguous). Never delete or archive anything ambiguous without surfacing it first.
