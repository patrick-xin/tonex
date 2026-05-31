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

Walk the live ADR set across all layers (`docs/adr/`, `packages/core/docs/adr/`, `apps/www/docs/adr/`), skipping `_archive/`. For each ADR:

1. **Still load-bearing?** — it constrains runtime behavior, code structure, or a contract surface → keep.
2. **Constrains nothing** — a glossary entry or meta-rule that doesn't bind behavior, structure, or a contract → **archive, don't delete.** Move it to `docs/adr/_archive/`; that we once thought it earned an ADR slot is itself a lesson. Relocate live vocabulary to the layer's `glossary.md` and meta-rules to the agent docs before archiving. **Never renumber on the way** (ADR-0011 §5) — the number is the cross-layer join key.
3. **Rotted against code?** — body now carries implementation that drifted from the source (paths, signatures, schema versions, slice-plans). Strip it back to rationale; don't leave stale implementation prose competing with the truth-source.

## Reporting

Summarize what moved: memos graduated/deleted, ADRs archived/trimmed, and anything that needs a human decision (a memo with no clear home, an ADR whose load-bearingness is ambiguous). Never delete or archive anything ambiguous without surfacing it first.
