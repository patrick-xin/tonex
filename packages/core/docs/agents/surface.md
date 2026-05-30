> **State:** Living. Edit when a surface-treatment rule changes; the why lives in the cited ADR.

# Surface treatment — chrome only

Governs `theme/surface/`.

- **Treatment touches surface tokens only.** Component tokens (md `primary/secondary/tertiary`; shadcn `muted/accent/border/secondary/ring/input`) keep MCU values unconditionally. The asymmetry is intentional. _(ADR-0002; ADR-0018)_
- **Algorithmic, not palette-sourced.** No palette dependency, no `SurfaceProvider`. Pure free functions, per-token hex in → out. _(ADR-0018)_
- **Algorithms are mutually exclusive.** `surfaceAlgo: 'none' | 'tint' | 'desaturate'` selects one — composing them is not a feature. _(ADR-0018)_
- **Treatment runs after MCU emit, before shadcn binds.** Any shadcn role bound to a treated surface reflects the treated value. _(ADR-0018)_
- **Default `'none'` is zero-cost.** Keeps the drift-guard baseline (`globals.css === formatCss(deriveTheme(DEFAULT_INPUTS))`) trivially green. _(ADR-0018)_
- **Levels are per-mode scalars.** `surfaceTintLevel`, `surfaceDesaturateLevel` — `Record<Mode, number>` in `0..1`; zero is the no-op. _(ADR-0018)_
- **Adding an algorithm = one file + one enum entry + one branch** in `surface/`, with a string in `SURFACE_ALGOS`. _(ADR-0018)_
- **Each algorithm declares its token-coverage subset** via a `// why:` block naming which surface tokens it touches. _(ADR-0018 Amendment 2026-05-05)_
- **The neutral ramp may visibly disagree with itself.** Clean background next to an MCU-neutral muted is the accepted trade-off — the wedge is "clean chrome + MCU-tinted components." _(ADR-0002)_
