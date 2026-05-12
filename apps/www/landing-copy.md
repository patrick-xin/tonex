# tonex landing copy — revised draft

**Status:** Draft v1. Built against competitive scan (material-shadcn, img2m3) and Patrick's three advantages (shadcn token depth from Lumi, UX care, aesthetic polish). Pending Patrick resolution on three open questions at the bottom before handoff to CC.

**Scope:** `/` route only — hero block, 3-card features grid, CTA. Same shape as current site; word-level replacement. Variant notes at the end if the surface expands.

**Voice anchors carried in:** "real HCT math, not an approximation" · "no second pass" · "the full engine with no shortcuts" · "both layers stay in sync" · em-dashed structural rationale · lowercase `tonex` per label conventions.

---

## Strategic frame

The competitive scan changed nothing about the engine. It changed what the copy needs to do.

material-shadcn ships the same headline tools — 9 of 10 MCU variants, image source, shadcn token mapping, components + charts preview, CSS export. Their copy line is *"One color in, entire palette out."* That's the floor of the category. img2m3 owns the image-extraction SEO slot.

If tonex's hero copy matches *their* category framing, audiences can't tell the products apart at a glance. The wedge has to be visible above the fold.

What competitors structurally cannot match (today):

- Override the algorithm at 5 layers, not 0
- Contrast as a per-pair audit, not a binary gate
- CMF (2026-spec, dual source for tertiary + error)
- Surface treatments — cards/elevation actually look right
- ARGB-canonical preview ≡ export
- Generates shadcn tokens alongside MD3 — *no second pass*

The three advantages you named — shadcn token depth from building Lumi, UX care, aesthetic polish — work best when they're **shown via card 3 and the screenshots**, not asserted. Aesthetic claims in copy land flat (everyone says they're polished); the gallery proves it.

---

## Hero block

### Recommended

> **The MD3 engine. With dials.**
>
> Real HCT math, not an approximation. Per-role pins layered on top. Contrast audited across every token pair the page uses. shadcn tokens emit alongside the MD3 theme — no second pass.
>
> [Try tonex →]  [Read the docs]

### Why this works

- **"With dials"** is the wedge in two words. Every other generator hides the algorithm. This line says the dials are exposed without going combative ("unlike X…").
- **Subhead carries four moats** in one breath: HCT math, override stack, contrast audit, shadcn-alongside. Anyone scanning gets all four before they decide to scroll.
- **No marketing verbs.** "Emit," "audit," "pin" — all engineering terms. Reads as written by someone who built it, not someone selling it.

### Alternative — sharper wedge against competitors

> **MD3 coherence. Manual control. Both layers stay in sync.**
>
> The MCU engine ports straight from Google. The override stack is yours: fine-tune palettes, pin individual roles, remap shadcn bindings. Every override is reversible; every contrast pair is audited. Generates shadcn tokens alongside the MD3 theme — no second pass.

This version leads with the philosophical bet (coherence + control + sync) rather than the dial metaphor. Slightly more abstract for the hero scan, slightly more on-brand for the voice anchors.

---

## Features grid (three cards)

### Card 1 — Override the algorithm

> **Five layers between seed and output.**
>
> Fine-tune the MCU palettes. Add named custom colors with optional harmonization. Pin individual roles per mode. Override shadcn roles. Remap which MD token feeds each shadcn role.
>
> Every layer is reversible. The contrast checker tells you what broke.

**What this shows:** the agency stance, plus the surface area of the override stack. Competitors have zero of these; you have five. Screenshot pairs well: FineTuneColors popover + ColorRolesList side by side.

### Card 2 — Contrast is an audit, not a gate

> **Most theme tools enforce contrast — they refuse to let you ship a 4.4:1 ratio.**
>
> tonex shows you every token pair the page uses, groups them as failing, passing, or decorative, and lets you ship with full awareness. The algorithm informs. You decide.
>
> AA and AAA toggle. Chart colors checked against both the background and the card surface.

**What this shows:** the agency-over-enforcement bet, made concrete. The "4.4:1" detail is the kind of specificity competitors won't match because they haven't actually implemented per-pair evaluation. Chart-pair check is the new rigor from the labelling pass — worth surfacing here.

**Screenshot:** ContrastChecker dialog open, with the Failing/Passing/Decorative grouping visible.

### Card 3 — shadcn from the inside

**Version A — if 3 role-binding presets ship on launch**

> **Three role-binding presets, built by someone who builds shadcn components.**
>
> Faithful maps MD3 roles to their shadcn equivalents straight through. Expressive pushes tertiary forward for accent and chart-1. Neutral flattens chroma in secondaries. Pick a preset, then remap any individual role.
>
> The editor itself runs on MD tokens + Base UI primitives — so what you see in preview is what production-grade components look like with your theme.

**Version B — if presets are coming soon (current state)**

> **shadcn token bindings, mapped from the inside.**
>
> Remap which MD token feeds each shadcn role. Built by someone who's also building a shadcn-flavored Base UI library, so the bindings track how shadcn tokens actually get used.
>
> The editor itself runs on MD tokens + Base UI primitives — so what you see in preview is what production-grade components look like with your theme.

**Why this is the right third card:** it folds in all three advantages you named — Lumi credibility, UX care (implied via "from the inside"), and aesthetic polish (implied via "what you see is what production-grade components look like"). It also closes the gap against material-shadcn's install-command lead by reframing the question: their install ships *a* mapping; yours ships *configurable* mappings authored by someone with domain authority.

---

## CTA block

### Recommended

> **Free while in preview. Open source on launch day.**
>
> [Try tonex →]  [Star on GitHub]

### With distribution tease (if brand-guideline export is V1.5 on the roadmap)

> **Free while in preview. Open source on launch day.**
>
> Brand guideline exports coming — one polished page, styled with your tokens, ready to share.
>
> [Try tonex →]  [Star on GitHub]

The tease earns its keep only if the V1.5 timeline is months, not quarters. Otherwise drop it.

---

## What changes if the surface expands to 5 cards

If you decide to expand from 3 cards to 4 or 5 (worth considering — the 3-card grid is dense and the wedge has more to say), the priority order I'd add in:

| # | Card | Why |
|---|---|---|
| 4 | **CMF + four-variant groups** | Only 2026-spec aware tool. Dual source for tertiary + error is unique. Screenshot pairs with the variant picker grouped by CMF / Standard / Expressive / Subdued. |
| 5 | **Preview ≡ export, structurally** | ARGB-canonical spine. What you see is byte-for-byte what you ship. ADR-0017 in product-marketing form. |

Card 4 is the higher-leverage addition. CMF is currently buried; surfacing it in landing copy makes it a recognized differentiator. Card 5 is more technical — keep in reserve for docs / X threads where the audience already knows what preview ≡ export means.

---

## Open questions before CC handoff

| # | Question | Recommendation |
|---|---|---|
| 1 | Are the 3 role-binding presets shipping on launch? | If yes, use Card 3 Version A. If no, use Version B and target presets for first post-launch release. Either way, the "from the inside" framing holds. |
| 2 | Is brand-guideline export V1.5 (months) or V2+ (quarters)? | If V1.5, include in CTA. If V2+, drop the tease — promising what isn't queued up reads as overreach on launch day. |
| 3 | Do we keep three cards or expand to four/five? | Three for launch (lower risk, easier to copy-edit, matches current shape). Expand to four post-launch once CMF gets its own showcase. |

---

## Implementation notes for CC

- All headings sentence case per `label-conventions.md`.
- `tonex` lowercase as mark and sentence-medial; `Tonex` capitalized only sentence-initial.
- Em dashes always spaced ` — `.
- No `Material Design 3` in chrome — `MD3` only. Long-form prose can use full name.
- "shadcn" lowercase always per their own house style.
- CTAs as `Try tonex →` (arrow inline) and `Read the docs` / `Star on GitHub`.

---

## What this draft deliberately does not do

- Does not name competitors. Direct callouts read as defensive at launch; the structural framing (override stack, audit, presets) does the comparison work without naming names.
- Does not claim "production-ready" as a phrase. It shows production-readiness through specifics (5 layers, per-pair audit, shadcn-alongside) instead.
- Does not claim aesthetic polish in words. Card 3's "what you see in preview is what production-grade components look like" invites the eye to the gallery without asserting.
- Does not lean on AI features or pipeline plans. Both are post-auth; landing copy should not advertise what isn't shipping.
