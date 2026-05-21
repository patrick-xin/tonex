> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# Post-MCU surface treatment is algorithmic, not palette-sourced

ADR-0002 framed surface treatment as **palette-sourced**: the user picks a palette library (TW, future Radix), surface-role tokens are then sourced from that palette while components keep MCU. That framing coupled the feature to ColorSystem (ADR-0004), required a `SurfaceProvider` abstraction, and introduced asymmetric tint controls (chrome vs component) that could not be unified. Shipping it as specified would have blocked the feature on infrastructure that has no second consumer yet.

**Decision:** Surface treatment is a **post-derive algorithmic transform** applied inside `deriveTheme`. It has no palette dependency. Shape:

- `surfaceAlgo: 'none' | 'tint' | 'desaturate'` selects a single algorithm. Mutually exclusive — composing tint and desaturate is not a product feature.
- `surfaceTintLevel`, `surfaceDesaturateLevel` — per-mode scalars in `0..1`. Strength for the corresponding algorithm. Zero is the no-op endpoint; one is the full-treatment endpoint.
- Treatment touches the **md surface family only**. The primary family stays MCU. The surface/component asymmetry from ADR-0002 is preserved — only the *mechanism* changed.
- Treatment runs after MCU emit and before shadcn binds, so any shadcn role bound to a treated surface token automatically reflects the treated value.

Algorithms live as pure free functions that transform per-token hex inputs to outputs; coverage is declared per-algorithm at the code site. No registry abstraction yet (see issue #3 for the deferred-abstraction rationale).

**Why this won out over ADR-0002's mechanism:**

1. **WYSIWYG (ADR-0017) is trivially preserved.** A post-derive transform inside `deriveTheme` is consumed identically by `applyDom` and `exporters/*`. Palette-sourced surfaces would have required either feeding palette data into derive (cross-cutting concern) or a separate compose step (second derive path = drift surface).
2. **No palette adapter needed to ship.** ADR-0002 coupled the feature to ColorSystem (ADR-0004). The rewrite has no `color-systems/` directory yet — feature would have been blocked on an abstraction with one (TW) speculative consumer. Algorithmic mechanism ships standalone.
3. **One scalar per algorithm beats two asymmetric tint controls.** ADR-0002's `tintLevel` (chrome) and `componentTintLevel` (component) created a four-way UI state space. The shipped one-scalar-per-algo collapses to a slider per algorithm — simpler editing UX, less product surface to explain.
4. **Default `'none'` is zero-cost.** The drift-guard baseline (`globals.css === formatCss(deriveTheme(DEFAULT_INPUTS))`) stays trivially green because the treatment branch is a no-op when `surfaceAlgo === 'none'`.

**Consequence:**

- ADR-0017's WYSIWYG commitment holds. The single `deriveTheme` path produces treated tokens; `applyDom` and `exporters/*` only format what derive returned. There is no second derive path for "treated" output.
- The chrome/component asymmetry from ADR-0002 survives in the *which tokens get touched* dimension. Treatment functions accept and return only the md surface family; primary/on-primary/etc. flow through MCU untouched.
- Adding a third algorithm (e.g. `'lift'`, `'dim'`) is one new file in `packages/core/src/theme/`, one entry in `SURFACE_ALGOS`, one branch in `applyTreatment`. No type-shape pressure until issue #3's second-consumer trigger fires.
- Future palette-sourced surfaces (the original ADR-0002 idea, now via ColorSystem's optional `surfaceShadeMap`) remain possible as a separate, additive feature — picker-driven, not algorithm-driven. If/when shipped, it composes alongside (not instead of) the algorithmic treatments here.
- Issue #3 governs the abstraction question (a unified `SurfaceTreatment` registry). This ADR governs the mechanism. The two are independent: mechanism is decided now; abstraction waits for a concrete second consumer.

## Amendment — 2026-05-05

The body's original "treatment family" was authored against slice 1's md token set. The surface ramp later expanded, and each algorithm now picks its own subset rather than the uniform family the body originally implied.

Each algorithm declares its token-coverage subset in its own `// why:` block at the code site. The desaturation algorithm covers the full ramp uniformly; the tint algorithm covers a subset (text-on-surface tokens stay MCU-derived since no shade map applies). Expansion of subset coverage is a product call best made when a UI surfaces the affected token set under treatment.

The "treatment touches the md surface family only — primary stays MCU" invariant from the body is unchanged. What changed is "family" is now a per-algorithm subset.

## Amendment — 2026-05-20

The tint subset (3 of 8 surface backgrounds) was the gap the 2026-05-05 amendment parked as "a product call when a UI surfaces it." GH #91 turned it into a visible defect: the 5 untouched ramp steps kept MCU's brand chroma (6.5–38) and alternated with the 3 snapped-neutral steps in one elevation ramp.

Tint now covers all 8 surface backgrounds. The mechanism changed from snapping each covered token to a literal Tailwind shade (`SHADE_MAP`, which can't scale — Tailwind's lightness ladder has no rung for most of MCU's narrow high-tone surface band) to **resampling** the chosen neutral palette onto each token's own MCU tone (read the palette's hue+chroma at that tone, keep the tone, blend the primary's hue back by level). Coverage now scales to the whole ramp, and the `mode` param drops out because tone carries the light/dark split. Tint is now per-token and binding-independent, mirroring desaturate — the two differ only in direction (desaturate drains brand chroma out toward grey; tint adds a chosen neutral in, optionally nudged back toward brand).

`level=0` is **pure chosen neutral**, not MCU-as-is — the inspectable anchor "give me exactly this palette." This already held for the 3 legacy tokens; the change extends it to all 8, so it is a faithful completion rather than a redirection.

Text (`on-surface`/`on-surface-variant`) stays MCU-derived. Desaturate touches text for *coherence* (chromatic text on a drained surface looks broken), which is a correctness fix and rightly automatic; tint touching text would be an *accent* (a deliberate brand pop in the foreground), which is a taste choice. Different intent → different UX, so brand-tinted text ships separately as an **opt-in accent decoupled from the surface level**, deferred to its own slice (GH #92), guarded by the live contrast audit.

Coverage is still declared per-algorithm at the code site; the body invariant (treatment touches the md surface family, primary stays MCU) is unchanged.
