# Contrast · color-utils boundary — the culori firewall

Governs `theme/contrast/` and every color-lib import in core.

- **`@tonex/color-utils` is the only package depending on npm color libs.** No direct `import { … } from 'culori'` in `@tonex/core` or `apps/www`. Lint-enforced. _(ADR-0025 c.1)_
- **Canonical-form rules are tonex commitments, not culori defaults** — 4-decimal L/C, 2-decimal H, trailing-zero strip, chromaless hue snap (`if (C < 1e-4) H = 0`). _(ADR-0025 c.3)_
- **Contrast math lives in `@tonex/color-utils`** — `contrastRatio(fgArgb, bgArgb)`, `relativeLuminance(argb)`. Not duplicated in core or www. _(ADR-0025 c.5)_
- **`ContrastPair` and `CONTRAST_PAIRS` live in `@tonex/core/schema`** — each pair carries fg + bg token refs, `layer`, `intent`, `threshold` (4.5 / 3). _(ADR-0025 c.6, c.7)_
- **`CONTRAST_PAIRS` is closed; modifying it is a code change.** The math primitive (`contrastRatio`) is open for ad-hoc UI tools. _(ADR-0025 c.9)_
- **`evaluateThemeContrast` is downstream of `DerivedTheme`, not on the spine.** Don't widen `DerivedTheme` with a `contrast` field. _(ADR-0025 c.8)_
- **WCAG 2 only, until APCA ships.** No `algorithm` field on `PairResult`, no `contrastAlgorithm` pref. APCA later: `apca-w3` joins the same boundary, `PairResult` widens additively. _(ADR-0025 c.10)_
