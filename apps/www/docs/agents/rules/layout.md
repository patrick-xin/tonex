# Layout — chrome vs canvas, layer awareness

Governs `app/(app)/theme/…` layouts and how features read layer. Terms → [../../glossary.md](../../glossary.md). _(ADR-0019; 2026-05-08 amendment)_

- **Chrome is per-layer, never shared.** No `theme/layout.tsx`. Each per-layer layout is a Server Component providing `<LayerContext>` and rendering a tiny client wrapper (`_md-nav-tabs.tsx` / `_shadcn-nav-tabs.tsx`) that imports its colocated `_nav-config.ts` (typed `NavConfig`). _(ADR-0019)_
- **The client wrapper is load-bearing — don't collapse it into the Server layout.** `NavConfig` carries lucide forwardRef icons that aren't serialisable across the RSC boundary; the same config feeds `<SiteCommandMenu>` so the two surfaces can't drift. _(ADR-0019)_
- **Chrome → always `components/ui/`, every route.** Canvas → layer-segmented: md canvas → `components/ui/`, shadcn canvas → `components/shadcn/`. _(ADR-0019)_
- **Switch data, not components.** `layer === 'shadcn' ? shadcnTokens : mdTokens` is allowed (changes *what data*); `layer === 'shadcn' ? ShadcnButton : UiButton` is banned (changes *which component*) — route segmentation is the layer mechanism, not runtime primitive switching. _(ADR-0019)_
