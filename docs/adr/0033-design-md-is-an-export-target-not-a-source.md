> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# DESIGN.md is an export target, not a source of truth

`@google/design.md` (DESIGN.md) is a YAML-frontmatter-plus-prose format for describing a design system to coding agents — colors, typography, radius, spacing, components, with rationale prose around each. It is tempting to adopt because the pipeline tonex sits in already produces it: Stitch hands users a DESIGN.md, agents read it, and tonex is positioned as the refinement layer between them. Two integrations were on the table:

- **Inbound** — treat DESIGN.md as a source the app authors and reads: pipe its tokens into our own chrome, or consume a user's file as theme input.
- **Outbound** — emit a DESIGN.md fragment from a tonex theme for the user to paste into their own file.

**Decision:** DESIGN.md enters tonex in exactly one direction — **outbound, color only**. It is never an inbound source, a second authoring surface, or a CSS-generation input. This is the stance *for now*: the format is alpha, and the rejection carries a re-open condition (§4).

## 1. A passive prose doc prevents no drift — and agent-driven work makes that worse

The reason to want DESIGN.md inbound is drift control: one authored spec the whole system tracks. It does not deliver that. The format's tooling is **intra-document only** — its `lint` validates a file against the spec, its `diff` compares two DESIGN.md files; nothing closes the doc↔code loop. A hand-authored DESIGN.md sitting beside hand-authored CSS is a **second source of truth**, which is drift-*generating*, not drift-preventing. Our own draft proved it: it declared one serif typeface while the code loaded another, and no tool in the format caught the divergence.

tonex's actual drift control is a different class: executable and auto-loaded — generation gated by integrity tests, a deterministic convention gate, nested rule docs that load on touch. That is the WYSIWYG principle of ADR-0017 (one derive path, every sink only formats it) generalized from tokens to docs: a guard that *runs* is strictly stronger than prose that must be *read and obeyed*. The agent-driven nature of the work cuts **against** the inbound doc, not for it — an agent acts on whatever the doc says as if current, so a stale prose source is more dangerous in an agent pipeline, not less.

## 2. The format is role-oriented; Tailwind is compositional — the mismatch is per-axis

Even setting drift aside, DESIGN.md and our output model only partly align, and the seam is different on each axis. DESIGN.md is **role-oriented** (the DTCG lineage: one intent-named token bundles family + size + weight + leading + tracking). Tailwind is **compositional** (primitives assembled at the call site; it deliberately rejects semantic role classes). They coincide cleanly on some axes and not others:

- **Color** — role *is* the utility namespace; clean both directions. This is the one axis we ship.
- **Radius** — clean only when the keys are Tailwind's own scale keys; at most a couple of overrides.
- **Spacing** — unforceable. Named tokens vs. a base × multiplier scale; the Tailwind default base already matches the intended unit, so there is nothing to carry.
- **Typography** — the worst. A faithful export manufactures exactly the `text-display-lg`-style role vocabulary our own conventions forbid, and cannot produce idiomatic `--font-serif / sans / mono` from a role-keyed block at all. Here the prose is **load-bearing** — it is the only record of the unmappable role→utility decision — so "compile the tokens, drop the prose" is safe for color and radius but quietly lossy for type.

Forcing the format into Tailwind's shape does not remove this loss; it **relocates** it (a messy export becomes a degraded source) and **inverts** source-of-truth: authoring a "tool-agnostic" document to fit Tailwind makes Tailwind the truth and the document a Tailwind-shaped reflection, which dissolves the multi-consumer premise that made the format worth adopting in the first place.

## 3. The one permitted direction is outbound color

Color is the single axis where the two models agree cleanly *and* where DESIGN.md carries no drift cost — the emitted block is an artifact the user pastes elsewhere, never a source the app reads back. So tonex emits a `colors:` block and nothing else: no prose, no type / spacing / radius, no inbound read. The shape mechanics of that block — hex-only, single-mode — are governed by ADR-0029 and its DESIGN.md amendment, because emitting a DESIGN.md fragment is the same "match the target's shape, ship our tokens" contract every other formatter obeys.

AI-authored color prose (rationale paragraphs around the emitted tokens) is a deferred follow-up, not part of this decision. It would still be outbound; it does not reopen the inbound question.

## 4. Deferred, not foreclosed

The rejection is conditional on the format's current state, not permanent. Reopen the inbound question if any of these change:

- the format matures past alpha and stabilizes its schema;
- it gains a doc↔code check that actually closes the loop (making it a guard, not just a second prose source);
- an AI-prose-authoring feature gives the prose a job that justifies a second authoring surface.

Until then, the design *prose* tonex wants to keep can live as ordinary `docs/` — it does not need the format to exist.
