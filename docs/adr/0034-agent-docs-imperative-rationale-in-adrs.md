# The doc system is agent-first

Docs here are read by agents at generation time, where they compete with the surrounding code for influence. An agent acts on what a doc *tells it to do*, not on the argument for why a rule is good — agents are dominated by what they read at generation time, not by what they were told earlier. That one fact splits the docs into two classes with two jobs:

- **Imperative docs** — `CLAUDE.md` (root + per-layer), `rules/*`, `glossary.md`, `api/*`, `working-style.md`. Read *to act*: every line must change what an agent does the moment it reads it.
- **ADRs** — read *to decide*, in the rare moment an agent changes or challenges a recorded decision. An ADR holds the one thing code cannot: the road not taken.

This ADR governs both, and is the one place permitted to explain why the docs look like this — reached by number, exactly as every other rule reaches its rationale.

## Part A — Imperative docs carry imperatives

The early agent docs (`working-style.md`, the first rule shards) were written essay-first — each rule wrapped in the reasoning that justified it. That reasoning was load-bearing *while the doc system was being designed*; once built, the essay only competes with the imperative it surrounds. The same problem was settled one level down for code comments (the "cite, don't reason" 2×2): a comment's durable payload is the ADR *number* it points at; the prose around it is the minimum needed to decide whether to open the ADR. This lifts that rule from the comment to the doc.

**Decision:**

1. **Imperative docs carry direct-effect content only.** `CLAUDE.md` (root + per-layer), `rules/*`, `glossary.md`, `api/*`, `working-style.md` — every line must change what an agent does at the moment it reads it. One imperative per bullet; definitions live in the glossary; the *why* lives in an ADR cited by number.

2. **The line is applicability, not justification.** Keep the clause that tells an agent *when a rule fires or when its exception hits* — that has direct effect. Cut the clause that argues *why the rule is correct* — that goes to an ADR. Test per clause: "does this change what I do this turn, or does it explain why the rule is good?"

3. **Two whys, two homes.** Why the *doc system* exists and how an agent traverses it (root `CLAUDE.md` → per-layer `CLAUDE.md` → `glossary.md` + `rules/index.md` → ADR by number) lives here, in this root ADR. Why a *given rule* is what it is lives in that rule's own subject ADR, cited by number. This ADR is not a sink for all rationale — only the doc system's own.

4. **ADRs are the designated prose home — the rule inverts there.** An ADR is *allowed* to reason; that is its job (bounded by Part B: it reasons about decisions, not spec). Transient docs (issue tracker, PRDs, disposal memos) are exempt. The imperative-only rule binds the doc classes in #1, nowhere else.

5. **Strip-and-relocate, never strip-and-drop.** A "why" removed from an imperative doc must first land in an ADR — with a number the doc can cite — or the knowledge is lost.

**Why:**

1. **Generation-time attention is the scarce resource.** A rule read at the moment of editing outweighs an argument read 200 lines ago; padding the rule with its own justification spends that attention on something the agent never acts on.
2. **The number is the stable join.** Rationale relocated to an ADR stays reachable by a number that never renumbers (ADR-0011 §5, the join-key rule), so cutting prose from a doc never severs it from its reasoning.
3. **The doc system obeys its own rule.** The one place permitted to explain why the docs look like this is an ADR — this one — reached by number, exactly as every other rule reaches its rationale.

**Consequence:**

- New rule docs are written imperative-first; the rationale is filed as (or appended to) an ADR and cited by number. A doc that needs a paragraph to justify itself is the signal that the rationale belongs in an ADR.
- Trimming an existing essay-doc is a two-part move: promote its argument into an ADR, then cut the doc to imperatives. `working-style.md` is the first instance — its founding observation, *"agents are dominated by what they read at generation time, not by what they were told earlier,"* is promoted here as this ADR's opening.
- Enforcement is judgment, not regex: the Stop drift sentinel's narrative-comment arm extends to essay prose in a rule doc; `check-conventions.mjs` cannot see prose. Treat the rule as a sentinel-backed convention, not a mechanical gate.
- `session-flow.md` is retired under this ADR — its navigation half was superseded by the traversal chain in Decision #3, and its unique half (the enforcement gate + before-done checklist) folded into `working-style.md`.

## Part B — ADRs carry decisions, not spec

An ADR records a **decision and the road not taken**. It is not a running spec mirror. The current behaviour of the system — which tokens, which levels, which members ship — already lives in code, tests, and the imperative docs; re-encoding it in an ADR is double-bookkeeping that decays the moment code moves. What code can *never* recover is the rejected alternative: the branch that is not in the codebase, the reason we deliberately did not do the obvious thing. That is the ADR's irreplaceable payload, and everything below protects it.

**Decision:**

6. **Decisions and rejected alternatives only.** Write or amend an ADR when a decision is *made or reversed* — never to track implementation drift. The test for a sentence: *could code, a test, or a rule carry this?* If yes, it lives there and the ADR cites it by reference. Only "why this and not that" stays in the ADR.

7. **Lead with current truth; one read at every anchor.** An ADR must resolve to its *current* decision at every cited anchor (`ADR-N`, `c.M`, amendment date) without the reader scanning above or below it. A body that states a superseded fact and corrects it further down is a defect: it makes an agent act on a falsehood at the most expensive moment — when it opened the file precisely because it is changing something load-bearing. Bodies are living current truth, not frozen chronologies. Fold a decision-refinement into the body where it now reads true, and keep the rejected alternative beside it as reasoning — not as a dated patch the reader must replay to reconstruct the present.

8. **Anchors are an API — never renumber, never orphan.** Code and docs cite `ADR-N c.M` and `ADR-N amendment <date>` as join keys; the number never renumbers (ADR-0011 §5). Commitment numbers and any cited amendment date are part of that API: the prose under an anchor may be rewritten freely, but the anchor is preserved or explicitly redirected. A superseded ADR collapses to a short stub at its own number — `Superseded by ADR-K — <one-line why>; reasoning moved there` — reachable in one hop, never a full dead doc left in the read path.

9. **Executable truth over prose.** If a fact can be a test or an assertion, the ADR cites the test and the test is the truth (e.g. the drift-guard baseline `globals.css === formatCss(deriveTheme(DEFAULT_INPUTS))`). Prose decays silently; assertions fail loudly. Reserve ADR prose for what has no executable form — the decision and its alternatives.

10. **Declare the edges.** An ADR states its open questions and deferred scope explicitly, by issue number, so a reading agent knows where the decision stops and when to stop trusting it.

11. **A decision is reachable from the surface it governs.** c.8 keeps every citation resolving *forward* to a live ADR; this keeps every active ADR resolving *back* to the code surface an agent enters from. Each active ADR carries a **`Code anchors:`** footer naming the file(s) where an agent editing this decision lands first, and each named file carries an `ADR-N` breadcrumb on that surface. An ADR with no single code home declares `none — <reason>`; silence is the defect, because a decision no sweep reaches is one an agent reverses without ever seeing it. Agents enter at the code symptom and sweep *sideways*, not down from `CLAUDE.md` — the breadcrumb is what turns that sweep into a one-hop read.

**Why this replaces the prior model:**

ADRs were previously *frozen rationale* kept in sync with reality by discipline — every body carried `Edit body when reality overtakes prose`, and evolutions were appended as dated amendments preserved as audit trail (ADR-0022's doc-lifecycle note). That model is rejected on its own evidence: the sync discipline was never paid (ADR-0018 accreted five reconciliation amendments, its body still naming a `'none'` member that never shipped), chronological append violates one-read locality (Decision 7), and spec-in-an-ADR double-books what code already owns (Decision 6). The cost of the old model fell on the agent at generation time, repeatedly; the cost of the new one falls once, on the author, at decision time — which is where it belongs.

**Consequence:**

- The `> **State:**` directive headers are retired from **every** doc — ADRs and imperative docs alike. The ADR forms (`Edit body when reality overtakes prose` / `Append amendment blocks only`) encoded the rejected sync-and-freeze model; the imperative-doc form (`Living. Edit when X changes`) was a staleness trigger — meta-maintenance, not the direct-effect content Decision 1 requires. An active ADR now opens at its H1, a superseded ADR at its one-line redirect stub (Decision 8), an imperative doc at its H1. Where a retired header named a concrete update-trigger (e.g. `api/core-surface.md`'s source paths), that fact is recoverable from git and re-homed into the doc's prose only if it proves load-bearing.
- ADR-0022's "Doc lifecycle note" is superseded by Decisions 6–7. A *new decision* still gets a new ADR with a supersession redirect (the `ADR-0014 → ADR-0022` chain stands), but a decision's *current statement* lives as current truth in its own body, never reconstructed from a frozen body plus an amendment chain.
- Existing amended ADRs are reshaped to Decision 7: decision-bearing amendments fold into the body with anchors and rejected-alternatives preserved; pure spec-drift amendments are dropped to the code and tests that already carry them.
- `scripts/check-adr-citations.mjs` (`pnpm check:adr`) enforces Decision 8 — every `ADR-N c.M` / `ADR-N amendment <date>` cited in code or docs must resolve to a live anchor (the ADR file exists, the commitment number is declared, the amendment date is still present). It is the harness that makes aggressive folds safe: rewrite prose, then prove no cited anchor was dropped. It runs whole-tree in CI (the only scope that catches an ADR edit orphaning a citation elsewhere) and file-scoped in lint-staged on staged `.ts/.tsx/.md`. The same guard enforces Decision 11 in reverse — every active ADR must declare a `Code anchors:` footer, and each named file must exist and carry the `ADR-N` breadcrumb (or the ADR declares `none — <reason>`). Coverage reads the declared paths directly, so it reaches files the citation scan skips (vendored `packages/mcu/`, any `.json`): the breadcrumb a sweep needs is proven present on the surface it lands on.

**Code anchors:** `scripts/check-adr-citations.mjs` — the guard that enforces c.8 and c.11.
