> **State:** Living. Edit when a surface-treatment rule changes; the why lives in the cited ADR.

# Surface treatment — chrome only

Governs `theme/surface/`.

- **Treatment touches surface tokens only.** Component tokens (md `primary/secondary/tertiary`; shadcn `muted/accent/border/secondary/ring/input`) keep MCU values unconditionally. The asymmetry is intentional. _(ADR-0002; ADR-0018)_
- **Algorithmic, not palette-sourced.** No palette dependency, no `SurfaceProvider`. Pure free functions, per-token hex in → out. _(ADR-0018)_
- **Algorithms are mutually exclusive.** `surfaceAlgo: 'tint' | 'desaturate'` selects one — composing them is not a feature. There is no `'none'` member; identity is `desaturate` at level 0. _(ADR-0018; Amendment 2026-05-30)_
- **Treatment runs after MCU emit, before shadcn binds.** Any shadcn role bound to a treated surface reflects the treated value. _(ADR-0018)_
- **Levels are per-mode scalars.** `surfaceTintLevel`, `surfaceDesaturateLevel` — `Record<Mode, number>` in `0..1`; zero is the no-op. _(ADR-0018)_
- **Adding an algorithm = one file in `surface/` + one `SURFACE_ALGOS` string + a branch in `applyTreatment`.** `applyTreatment` is a two-way fall-through today (`tint`, else `desaturate`), so a 3rd algo must restructure it to an explicit `switch` with a level-0 → identity short-circuit, keeping the drift-guard baseline green. _(ADR-0018)_
- **Each algorithm declares its token-coverage subset** via a `// why:` block naming which surface tokens it touches. _(ADR-0018 Amendment 2026-05-05)_
- **The neutral ramp may visibly disagree with itself.** Clean background next to an MCU-neutral muted is the accepted trade-off — the wedge is "clean chrome + MCU-tinted components." _(ADR-0002)_
