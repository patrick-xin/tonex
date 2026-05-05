> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Post-MCU surface treatment is algorithmic, not palette-sourced

ADR-0002 framed surface treatment as **palette-sourced**: the user picks a palette library (TW, future Radix), surface-role tokens are then sourced from that palette while components keep MCU. That framing coupled the feature to ColorSystem (ADR-0004), required a `SurfaceProvider` abstraction, and introduced asymmetric tint controls (chrome vs component) that could not be unified. Shipping it as specified would have blocked the feature on infrastructure that has no second consumer yet.

**Decision:** Surface treatment is a **post-derive algorithmic transform** applied inside `deriveTheme`. It has no palette dependency. Shape:

- `surfaceAlgo: 'none' | 'tint' | 'desaturate'` selects a single algorithm. Mutually exclusive — composing tint and desaturate is not a product feature.
- `surfaceTintLevel: number` (0..1) — strength when `surfaceAlgo === 'tint'` (0 = neutral zinc, 1 = full primary character).
- `surfaceDesaturateLevel: number` (0..1) — strength when `surfaceAlgo === 'desaturate'` (0 = MCU as-is, 1 = chroma stripped).
- Treatment touches the **md surface family only** (`--color-surface`, `--color-surface-container`, `--color-surface-container-high`, `--color-on-surface`). The primary family stays MCU. The surface/component asymmetry from ADR-0002 is preserved — only the *mechanism* changed.
- Treatment runs after MCU emit and before shadcn binds, so any shadcn role bound to a treated surface token automatically reflects the treated value.

Algorithms live as free functions: `applySurfaceTint(layer, mode, level)` and `applySurfaceDesaturate(layer, level)` in `packages/core/src/theme/`. No registry abstraction yet (see issue #3 for the deferred-abstraction rationale).

**Why this won out over ADR-0002's mechanism:**

1. **WYSIWYG (ADR-0017) is trivially preserved.** A post-derive transform inside `deriveTheme` is consumed identically by `applyDom` and `exporters/*`. Palette-sourced surfaces would have required either feeding palette data into derive (cross-cutting concern) or a separate compose step (second derive path = drift surface).
2. **No palette adapter needed to ship.** ADR-0002 coupled the feature to ColorSystem (ADR-0004). The rewrite has no `color-systems/` directory yet — feature would have been blocked on an abstraction with one (TW) speculative consumer. Algorithmic mechanism ships standalone.
3. **One scalar per algorithm beats two asymmetric tint controls.** ADR-0002's `tintLevel` (chrome) and `componentTintLevel` (component) created a four-way UI state space. The shipped one-scalar-per-algo collapses to a slider per algorithm — simpler editing UX, less product surface to explain.
4. **Default `'none'` is zero-cost.** The drift-guard baseline (`globals.css === formatCss(deriveTheme(DEFAULT_INPUTS))`) stays trivially green because the treatment branch is a no-op when `surfaceAlgo === 'none'`.

**Consequence:**

- ADR-0017's WYSIWYG commitment holds. The single `deriveTheme` path produces treated tokens; `applyDom` and `exporters/*` only format what derive returned. There is no second derive path for "treated" output.
- The chrome/component asymmetry from ADR-0002 survives in the *which tokens get touched* dimension. Treatment functions accept and return only the md surface family; primary/on-primary/etc. flow through MCU untouched.
- Adding a third algorithm (e.g. `'lift'`, `'dim'`) is one new file in `packages/core/src/theme/`, one entry in `SURFACE_ALGOS`, one branch in `applyTreatment`. No type-shape pressure until issue #3's second-consumer trigger fires.
- Future palette-sourced surfaces (the original ADR-0002 idea, now via ColorSystem's optional `surfaceShadeMap` per ADR-0004) remain possible as a separate, additive feature — picker-driven, not algorithm-driven. If/when shipped, it composes alongside (not instead of) the algorithmic treatments here.
- Issue #3 governs the abstraction question (a unified `SurfaceTreatment` registry). This ADR governs the mechanism. The two are independent: mechanism is decided now; abstraction waits for a concrete second consumer.
