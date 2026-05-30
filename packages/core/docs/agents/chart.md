> **State:** Living. Edit when a chart-palette rule changes; the why lives in the cited ADR.

# Chart palette derivation

Governs `chart/`.

- **Chart axes nest under `chart.*`.** Don't add flat `chart*` fields. Future axes (count, tones, hueSpread, seedPalette) extend the namespace. _(ADR-0027 c.1)_
- **Chart overrides are terminal and scheme-agnostic.** Don't auto-clear pins on scheme switch. _(ADR-0027 c.4; mirrors ADR-0026 c.4)_
- **Categorical hue rotation runs in HCT, not HSL.** HSL breaks perceptual uniformity — an HSL-rotation slice fails acceptance. _(ADR-0027 c.5)_
- **Contrast-pair coverage extends to chart tokens** (chart-vs-chart and chart-vs-background via the ADR-0025 evaluator). _(ADR-0027 c.5)_
- **Light/dark `chart-N` derive from a shared scheme contract** — a mode toggle must not change which series `chart-N` represents. _(ADR-0027 c.5)_
- **Override layer is last-mile only.** Never gate algorithmic generation on override state. _(ADR-0027 c.5)_
