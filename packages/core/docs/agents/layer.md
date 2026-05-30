> **State:** Living. Edit when a layer-emission rule changes; the why lives in the cited ADR.

# Layer architecture — four class-scoped blocks

Governs `theme/applyDom.ts`.

- **Both layers class-scoped, no `:root`.** Symmetry is non-negotiable. Reject "one layer at `:root`, the other in a class." _(ADR-0013 c.3)_
- **Single `<style id="tonex-tokens">` in `<head>`,** appended once after `globals.css` so the cascade wins; updates replace `textContent`. _(ADR-0013 c.5)_
- **Body class is `md`; shadcn is a class-scoped subregion.** `<body class="md">` in the root layout; wrap shadcn regions in `<div class="shadcn">`. _(ADR-0013 c.1, c.2)_
- **No re-derivation on mode toggle.** All four blocks emit regardless of mode; flipping `<html class="dark">` selects the winning pair. _(ADR-0013 c.4)_
- **Route groups are organisational, not layer multiplexers.** Reject `(shadcn)/` / `(md)/` groups multiplexing the same URL. _(ADR-0013)_
- **No runtime `<Layer>` context that swaps primitives.** Route-level segmentation (ADR-0019) is the layer mechanism. _(ADR-0013)_
- **No "single layer" framing.** Both scopes coexist day one. _(ADR-0013)_
- **Tailwind v4 bridge lives in `globals.css`, not engine code.** `derive.ts` stays pure. _(ADR-0013)_
