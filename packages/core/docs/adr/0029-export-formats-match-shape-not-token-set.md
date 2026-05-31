# Export formats match the target tool's shape, not its token set

ADR-0021 c.9 committed to non-CSS formatters (JSON, TS, Dart) without stating their fidelity target; c.10 parked Material Theme Builder (MTB) compatibility as a hypothetical separate preset. The first real formatter forces the question MTB's export raises: a tonex theme and an MTB theme are not the same object. We derive a newer token set — the cmf / 2025-spec families and the per-family `*-dim` tokens — plus a sixth tonal palette (error) that MTB's JSON schema omits; MTB in turn emits deprecated tokens (`background`, `onBackground`, `surfaceVariant`) we dropped from the modern set deliberately (ADR-0021 c.2). Byte-for-byte parity would force a choice between degrading our output to MTB's older surface or fabricating tokens we don't stand behind. We take neither.

**Decision:** an export reproduces the target tool's *structural shape* — top-level keys, grouping, naming convention, value encoding, section layout — populated with **tonex's own derived tokens and values**. "Match the format" means a tool that consumes the target's files can consume ours, and an operator reads ours the way they expect; it does **not** mean an identical token roster or identical colors. Where our set is wider, we emit the extra entries in their natural slot. Where the target carries tokens we don't derive, we omit them. We never widen the derived surface solely to fill a competitor's slot.

**Why structural, not literal:** the value of "exports like MTB" is downstream-tool compatibility and operator familiarity — neither needs the same roster. Our roster is a product decision already made upstream (ADR-0021 c.2); an exporter that quietly reverted it would make the export disagree with the live theme, which is the preview/export drift ADR-0017 forbids, surfaced one layer further out.

**Why not add the legacy tokens upstream:** adding `background` / `onBackground` / `surfaceVariant` to the derived surface to satisfy one exporter would leak deprecated aliases into every other sink for zero product benefit, and re-open a partition we closed on purpose. A format that wants a competitor's legacy slot fills it from data `deriveTheme` already returns, or omits it.

**Why this binds future formats:** TS, Dart, and any later target inherit the contract — mirror the shape, ship our tokens. "Add a format" stays a pure formatting task (ADR-0008) with no upstream token negotiation, and every export stays honest to the one derived theme.

**Consequence:**

- A formatter may read any field `deriveTheme` returns and reshape, rename, or re-encode it — that is formatting. It may not compute a color, infer a role-to-tone mapping, or invent a token absent from the derived theme — that is derivation, and stays upstream (ADR-0017, ADR-0021 c.1).
- Faithfulness is judged against the target's *schema*, not a captured file. A reference export is a shape fixture, not a value oracle: our colors will differ from any given sample (different seed default, variant, possibly MCU revision), and that divergence is expected.
- Divergence between our roster and the target's is visible by construction — extra keys present, absent keys absent — never hidden behind fabricated values. The artifact reads as a target-shaped tonex theme, which is exactly what it is.

**Two refinements the first non-CSS / non-Material target surfaced.** DESIGN.md (a role-keyed YAML doc for coding agents; ADR-0033 governs why it is color-only and never inbound) is the first formatter whose target is neither CSS nor Material-derived JSON. It confirms the shape-match contract binds that far out, and extends "match the shape" two ways — both still pure formatting (ADR-0008), reading fields `deriveTheme` already returns, computing no color at the seam:

- **The target may lack an axis we always carry.** DESIGN.md has no light/dark dimension, but `deriveTheme` co-derives both modes (ADR-0017 c.2). Shape-match extends from "omit the tokens the target lacks" to "project the always-co-derived pair down to the single mode the caller selects" — a seam choice, not a re-derivation.
- **The target may dictate value encoding, overriding a user option.** DESIGN.md's Color type is sRGB hex, so the exporter emits hex regardless of the `colorFormat` (oklch) option — a format-mandated encoding overrides the user-facing toggle rather than honoring it.

**Amendment anchors** — folded into the body above; no external date-citation:

- **2026-05-29** — DESIGN.md (ADR-0033) confirmed the shape-match contract binds to a non-CSS / non-Material target and added the two refinements above.

**Code anchors:** `packages/core/src/theme/exporters/json.ts` — export formats match shape, not token set.
