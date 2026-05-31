> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# Agent docs carry imperatives; their rationale lives in ADRs

Docs here are read by agents at generation time, where they compete with the surrounding code for influence. An agent acts on what a doc *tells it to do*, not on the argument for why the rule is good. The early agent docs (`working-style.md`, the first rule shards) were written essay-first — each rule wrapped in the reasoning that justified it. That reasoning was load-bearing *while the doc system was being designed*; it argued the system into existence. Once built, the essay only competes with the imperative it surrounds.

The same problem was already settled one level down, for code comments (the "cite, don't reason" 2×2): a comment's durable payload is the ADR *number* it points at; the prose around it is the minimum needed to decide whether to open the ADR. This ADR lifts that rule from the comment to the doc.

**Decision:**

1. **Imperative docs carry direct-effect content only.** `CLAUDE.md` (root + per-layer), `rules/*`, `glossary.md`, `api/*`, `working-style.md` — every line must change what an agent does at the moment it reads it. One imperative per bullet; definitions live in the glossary; the *why* lives in an ADR cited by number.

2. **The line is applicability, not justification.** Keep the clause that tells an agent *when a rule fires or when its exception hits* — that has direct effect. Cut the clause that argues *why the rule is correct* — that goes to an ADR. Test per clause: "does this change what I do this turn, or does it explain why the rule is good?"

3. **Two whys, two homes.** Why the *doc system* exists and how an agent traverses it (root `CLAUDE.md` → per-layer `CLAUDE.md` → `glossary.md` + `rules/index.md` → ADR by number) lives here, in this root ADR. Why a *given rule* is what it is lives in that rule's own subject ADR, cited by number. This ADR is not a sink for all rationale — only the doc system's own.

4. **ADRs are the designated prose home — the rule inverts there.** An ADR is *allowed* to reason; that is its job. Transient docs (issue tracker, PRDs, disposal memos) are exempt. The imperative-only rule binds the doc classes in #1, nowhere else.

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
