> **State:** Living. Edit when a working rule for `packages/core/` is added, refined, or retired.

# Core conventions

Working rules for `packages/core/` — applied at generation time, not at decision time. Decisions live in `docs/adr/`; this doc holds the rule that follows from a decision and fires when an agent touches a relevant file.

**Scope:** rules governing the engine, spine, source store, schema, sinks, derivation, and tonex-internal token contracts. Rules about *how core integrates with importers* (where domain types live, monorepo layout) stay in `code-conventions.md` until Slice B reconciles the seam.

**Status (2026-05-17 — Slice A pilots).** This doc was created by Slice A of the corpus cleanup ([issue #69](https://github.com/patrick-xin/tonex/issues/69)). Currently populated by extractions from three pilot ADRs (0001, 0008, 0027). The remaining 24 ADRs are audited in a follow-up pass; sections below grow in place as that pass lands. Until then, rules in this doc cover the renderer/exporter split and chart-palette derivation only — other core work still consults its source ADR directly.

## Sinks: renderer and exporters

`deriveTheme` returns `{ md, shadcn, warnings }`. Two consumers eat that output — the runtime renderer that writes CSS variables onto the DOM, and exporter functions that produce strings for human use. The rules below preserve the separation by role: the renderer is side-effectful and idempotent; exporters are pure.

- **Renderer is single.** One `applyDom`, called once per source change, idempotent. Don't add a second runtime CSS writer. _(ADR-0008)_
- **Exporters are pure.** Files in `packages/core/src/theme/exporters/` return strings — no DOM access, no side effects. _(ADR-0008)_
- **Bake-time CSS uses `formatCss`, not `applyDom`.** Tools and CLIs never call the renderer. _(ADR-0008)_
- **Clipboard is an app-layer consumer.** Don't bundle DOM/clipboard calls into core exporters; the www app handles the clipboard call. _(ADR-0008)_
- **One format = one file until 2+ ship.** Don't pre-build a typed exporter registry. When the second exporter lands, lift to a registry that mirrors the variants registry shape. _(ADR-0008; companion to ADR-0010)_

## Chart palette derivation

`PortableTheme.chart` carries chart-palette intent (`scheme: 'categorical' | 'sequential' | 'diverging'`). Derivation produces `--chart-1..N` tokens through scheme-driven generation; overrides apply on top. The rules below preserve the data-viz contract the scheme names commit to.

- **Chart axes nest under `chart.*`.** Don't add flat `chart*` fields on `PortableTheme`. Future axes (count, tones, hueSpread, seedPalette) extend the namespace. _(ADR-0027 c.1)_
- **Chart overrides are terminal and scheme-agnostic.** Don't auto-clear pins on scheme switch — the override is the user's commitment knob, stable across what-if exploration. _(ADR-0027 c.4; mirrors ADR-0026 c.4)_
- **Categorical hue rotation runs in HCT, not HSL.** HCT preserves perceptual uniformity; HSL does not. A categorical-scheme slice that ships HSL hue rotation fails acceptance. _(ADR-0027 c.5)_
- **Contrast-pair coverage extends to chart tokens.** Any chart-derivation slice validates chart-vs-chart and chart-vs-background contrast via the ADR-0025 evaluator. _(ADR-0027 c.5)_
- **Light/dark `chart-N` derive from a shared scheme contract.** A mode toggle must not change which series `chart-N` represents — the semantic ("category A is the same series in either mode") is preserved by construction. _(ADR-0027 c.5)_
- **Override layer is last-mile only.** Never gate algorithmic generation on override state; overrides apply on top of the scheme's derivation. _(ADR-0027 c.5)_

## How to extend this doc

When the bulk audit lands a new section, follow the shape above:

- **One paragraph of context** per section — name the surface, name the primary ADRs, state what the rules are protecting.
- **Bullet list of rules** — each rule one sentence (two if a "Banned:" or "When X, do Y" clarification earns it), ending with `_(ADR-NNNN)_` or `_(ADR-NNNN c.N)_` citation.
- **Skip the rule** if it's a one-time architectural constraint that doesn't fire at generation time (the Q2 test — see [issue #69](https://github.com/patrick-xin/tonex/issues/69)).
- **Don't restate the why** — rationale is in the ADR. This doc says *what to do*; the citation lets the reader follow back if they need to understand the trade.
