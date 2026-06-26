---
name: sweep
description: Periodic maintenance sweep of the two stores that rot silently between sessions — machine-local agent memory and the ADR set. Use when the user asks to run a maintenance sweep, drain or clean up agent memory, audit ADRs, or on the recurring ~2-week / N-slice cadence.
metadata:
  internal: true
---

# Maintenance sweep

Two stores rot silently between sessions: machine-local agent memory (stale snapshots read as current) and the ADR set (rationale that drifts against the code, or entries that no longer constrain anything). This skill is the recurring procedure that drains them. Run every ~2 weeks or every N slices, whichever lands first — or whenever the user invokes it.

This skill owns the *procedure*; the *policy* it enforces lives in docs. Don't restate the rules here — read them:
- Memory policy (forcing-condition frontmatter, the graduation table, what never goes in) → `docs/agents/memory-lifecycle.md`.
- ADR authoring + audit procedure → the **`adr` skill** (it owns the convention and the fold procedure; this skill just runs it on the cadence).

## 1. Memory sweep

Walk `~/.claude/projects/<repo>/memory/MEMORY.md` top-to-bottom. For each memo:

1. **Forcing condition met?** — `until-adr-NNNN` landed, `until-issue-NNN` closed, `until-YYYY-MM-DD` passed. Graduate the content to its home per the graduation table in `memory-lifecycle.md` (ADR / `docs/agents/` / GH issue / `CHANGELOG.md` / `docs/private/`), then delete the memo and its `MEMORY.md` line.
2. **Snapshot >30 days?** — re-read against current code; refresh the date or delete.
3. **No forcing condition?** — wrong shape: add one, or convert to `permanent` with a justification in the description.
4. **Project ledger?** — shipped history → `CHANGELOG.md`; open items → a GH issue with the right label.

A drained `MEMORY.md` is the success state, not a failure — load-bearing memos graduate to the repo; the rest were disposable.

## 2. ADR audit

The ADR audit lives in the dedicated **`adr` skill** — it owns the authoring convention and the audit/fold procedure. Run it as the ADR half of the sweep: `pnpm check:adr` to clear the deterministic flags, then its by-hand pass (still load-bearing? constrains nothing? holds a command-falsifiable result?). Surface anything ambiguous rather than archiving it.

## Reporting

Summarize what moved: memos graduated/deleted, ADRs archived/trimmed, the `pnpm check:adr` end-state (green, or what was fixed to get there), and anything that needs a human decision (a memo with no clear home, an ADR whose load-bearingness is ambiguous). Never delete or archive anything ambiguous without surfacing it first.
