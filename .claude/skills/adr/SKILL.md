---
name: adr
description: Author, amend, cite, and audit Architecture Decision Records in tonex, plus the citation/anchor guard behind `pnpm check:adr`. Use when writing or changing an ADR, citing one from code, when `pnpm check:adr` fails, or auditing the ADR set during a sweep.
metadata:
  internal: true
---

# ADRs

ADRs record **decisions and the road not taken**, not implementation. The doctrine is ADR-0034 Part B (commitments c.6–c.11); this skill is how to live within it. The deterministic half is bundled here as `scripts/check-adr-citations.mjs`, run via **`pnpm check:adr`** — wired into lint-staged (every staged `.ts/.tsx/.md`) and CI, so a dangling citation or a missing code anchor fails the build. Run it and fix what it names; don't hand-write one-off ADR checks.

## Writing or amending an ADR

1. **Decision + why + road-not-taken, not a spec mirror** (c.6). Strip file paths, signatures, schema versions, test references, slice-plans — code is the truth-source, prose rots against it. Keep a code block only when it names the exact contract surface the decision changes (a relaxed tsconfig flag, an added union case).
2. **Lead with current truth** (c.7). The body states the decision as it stands; fold decision-bearing amendments inline and keep a compact **Amendment anchors** ledger so every cited date still resolves in one hop. Pure spec-drift amendments drop to the code/tests that carry them.
3. **No command-falsifiable results in the prose** (c.9). The litmus: *could a command prove a sentence false with no re-decision?* If yes it's a **result** — it belongs to the code or test the ADR cites. A decision's *shape* (a chosen type, a field name) stays; its *measured behavior* (config/constant values, error counts, "passes strict") leaves. Cite the test or name the symbol that carries the live truth.
4. **Declare a `Code anchors:` footer** (c.11) — backtick file path(s), each carrying an `ADR-N` breadcrumb at the code site, or `none — <reason>` if the decision has no single code home. This is what lets an agent standing on the code hop *back* to the decision in one step.
5. **Citations are an API** (c.8). Never renumber or drop a cited commitment (`c.M`), amendment date, or ADR number — supersede with a redirect stub, don't orphan.
6. **Run `pnpm check:adr`** — green proves the fold orphaned no citation and the footer resolves.

A net-new ADR is written straight to its layer's `adr/` dir (system-wide `docs/adr/`, engine `packages/core/docs/adr/`, web `apps/www/docs/adr/`); a refinement is an append-amendment folded per step 2. Never renumber an ADR (ADR-0011 §5) — the number is the cross-layer join key.

## Auditing the ADR set (periodic / during `sweep`)

Run `pnpm check:adr` first — clear everything it flags (a footer-less new ADR, a fold-orphaned citation, a breadcrumb deleted from a code anchor). Then, per ADR by hand:

1. **Still load-bearing?** — constrains runtime behavior, code structure, or a contract surface → keep.
2. **Constrains nothing?** — binds no behavior, structure, or contract → **archive, don't delete**: move to `_archive/`, relocate live vocabulary to the layer `glossary.md`, never renumber.
3. **Holds a command-falsifiable result?** — apply the c.9 litmus above; strip the result back to decision + why, then re-run `pnpm check:adr` — the `Code anchors:` footer must survive the trim.

Surface anything ambiguous (an ADR whose load-bearingness is unclear) rather than archiving it.

## What the guard checks

`scripts/check-adr-citations.mjs` (bundled here) indexes every ADR under `docs`/`packages`/`apps`, then resolves both directions: forward (c.8) — each `ADR-N c.M` / `amendment <date>` cited in code or docs points to a live anchor (the ADR exists, the commitment number is declared, the date still appears); backward (c.11) — each active ADR's `Code anchors:` paths exist and carry the `ADR-N` breadcrumb. Known limits: ranges (`c.6–c.10`) validate only the first endpoint; `§N` / `Part X` only assert the ADR exists.
