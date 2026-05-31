# Lift-vs-rewrite standard for legacy code

Tonex retains a substantial legacy prototype as a UI/layout reference. The foundation slices (1–8) deliberately rebuilt the engine from scratch — not lifted — because the engine had load-bearing failure modes the rebuild explicitly resolved (drift, four parallel derive paths, `ThemeSystem` facade, sinks folder). Implementation slices (10+) consume the legacy as source material for the production UI. Without an explicit rule, lifting drifts back into the failure modes the rebuild eliminated: lifted code drags in stale schema field names, references abstractions resolved by ADR, or re-introduces logic the new engine already owns.

**Decision:** Every legacy file imported into the new tree is classified into one of four verdicts before any code is moved.

| Profile | Verdict | Action |
|---|---|---|
| Pure JSX + Tailwind, no engine imports — read-only display, layouts, marketing surfaces, structural shells | **Lift verbatim** | Move file, fix imports, ship. |
| UI bound to local store state — a slider on a setter, an input on a source field | **Lift JSX, rewrite wiring** | The JSX shape survives. Store integration is rewritten using today's `useSource` selector pattern and today's schema field names. Stale field names get rewritten, not preserved. |
| Touches engine internals — palette generation, override composition, mode resolution, layer mapping, color-space conversion | **Discard. Reference behaviour only.** | Already rebuilt in slices 1–8. Use the legacy file as a behavioural spec, not as code to bring forward. |
| Contradicts a resolved ADR — `ThemeSystem` facade (⊥ ADR-0005), sinks folder (⊥ ADR-0008), `draft` field on source (⊥ ADR-0017), per-token lock struct (⊥ small-loop pivot) | **Discard outright** | Don't open the file. The ADR is the contract. |

Decision tree before lifting any file: **does it import engine code or compute derived values?** Yes → row 3 or 4. No → row 1 or 2.

Concrete pre-lift check:

```bash
grep -E '(deriveTheme|useSource|applyDom|paletteOverrides|md3TokenOverrides|shadcnTokenOverrides)' <file>
```

If the grep hits, the file is row 2 or 3 — stop and decide which before any move.

**Why:** Pattern-gravity. The first lifted file establishes the template every subsequent lift implicitly imitates. If the first lift drags in stale schema field names or a pre-grilling abstraction, every subsequent lift inherits the rot — and parallel subagent lifts amplify it across the codebase before review can catch it. The verdict matrix prevents the obvious failure modes; the decision tree makes the verdict mechanical, not judgment-based, so subagents and humans converge on the same answer.

**Consequence:**

- The first 1–2 lifts in slice 10 happen jointly between the user and the main agent. These become the **worked example** subagent lifts reference. The verdict matrix tells subagents *how to decide*; the worked example shows them what *good* looks like — restyled with `components/ui/`, store wired with today's selectors, no stale field names.
- Subagent parallelization on lifts unlocks **only after** the worked example exists. Before it exists, lifts run sequentially through the main agent.
- The deleted memory note `feedback_lift_vs_rewrite.md` does not return; this ADR is the durable home.
- When the legacy reference shrinks to nothing meaningful, this ADR becomes historical. Don't delete; future readers wondering "why doesn't anything in the new tree match the legacy 1:1?" land here.
