# Post-MCU surface treatment is algorithmic, not palette-sourced

ADR-0002 framed surface treatment as **palette-sourced**: the user picks a palette library (TW, future Radix), surface-role tokens are then sourced from that palette while components keep MCU. That framing coupled the feature to ColorSystem (ADR-0004), required a `SurfaceProvider` abstraction, and introduced asymmetric tint controls (chrome vs component) that could not be unified. Shipping it as specified would have blocked the feature on infrastructure that has no second consumer yet.

**Decision:** Surface treatment is a **post-derive algorithmic transform** applied inside `deriveTheme`, with no palette dependency. Shape:

- `surfaceAlgo: 'tint' | 'desaturate'` selects a single algorithm — mutually exclusive; composing them is not a product feature. There is **no `'none'` member**: identity is `desaturate` at level 0, which short-circuits to its input. A future algorithm must short-circuit its own level 0 the same way.
- `surfaceTintLevel`, `surfaceDesaturateLevel` — per-mode scalars in `0..1`, strength for the corresponding algorithm. Zero is the neutral/no-op endpoint; one is full treatment.
- `surfaceTintTextLevel: { light, dark }` (default `{0,0}`) — a **separate** knob, read only under `surfaceAlgo='tint'`, tinting the two text tokens (`on-surface`/`on-surface-variant`). Deliberately decoupled from `surfaceTintLevel` so "clean neutral surfaces + brand-accented text" is reachable; if text rode the surface slider that target would be impossible.
- Treatment touches the **md surface family** — the 8 surface backgrounds, the `outline`/`outline-variant` pair, and (opt-in) the two text tokens. The primary family stays MCU; the surface/component asymmetry from ADR-0002 is preserved, only the *mechanism* changed. Each algorithm declares its exact token-coverage subset in a `// why:` block at the code site.
- Treatment runs after MCU emit and before shadcn binds, so any shadcn role bound to a treated surface/outline token reflects the treated value. md3 token pins land **before** `applyTreatment`, so a pin on a treated token is itself subject to the active treatment — the surgical-pin guarantee is "beats MCU + palette regen", never "beats the surface treatment". Escape hatch: a shadcn-layer override (runs after treatment) or a lower level.

**Mechanism — both algorithms are per-token and binding-independent**, differing only in direction: desaturate drains brand chroma out toward grey; tint resamples a chosen neutral palette in. Tint reads the neutral palette's hue+chroma at each token's own MCU tone, keeps the tone (so tone carries the light/dark split — there is no `mode` param), and blends the primary's hue back by level: `level=0` is **pure chosen neutral** (the inspectable anchor, "give me exactly this palette"), `level=1` nudges back toward brand at `TARGET_CHROMA` (a whisper; surfaces must stay calm). Outline rides `surfaceTintLevel` on the same recipe, coherence-coupled to the surface. Text follows the same neutral→brand model on its own `surfaceTintTextLevel`: `textLevel=0` is the chosen neutral at the token's tone (**not** MCU-identical), and `textLevel` lifts hue toward `--color-primary` and chroma toward `TEXT_CHROMA_CEILING_FRACTION` (a fraction of the *primary's own* chroma — a seed-relative accent, deliberately stronger than the background whisper), linearly.

Algorithms live as pure free functions transforming per-token hex in to hex out. No registry abstraction yet (see issue #3 for the deferred-abstraction rationale).

**Why this won out over ADR-0002's mechanism:**

1. **WYSIWYG (ADR-0017) is trivially preserved.** A post-derive transform inside `deriveTheme` is consumed identically by `applyDom` and `exporters/*`. Palette-sourced surfaces would have required either feeding palette data into derive (cross-cutting concern) or a separate compose step (second derive path = drift surface).
2. **No palette adapter needed to ship.** ADR-0002 coupled the feature to ColorSystem (ADR-0004). The rewrite has no `color-systems/` directory yet — the feature would have been blocked on an abstraction with one (TW) speculative consumer. Algorithmic mechanism ships standalone.
3. **One scalar per algorithm beats two asymmetric tint controls.** ADR-0002's `tintLevel` (chrome) and `componentTintLevel` (component) created a four-way UI state space. One scalar per algorithm collapses to a slider per algorithm — simpler editing UX, less surface to explain.
4. **The default is zero-cost.** The drift-guard baseline (`globals.css === formatCss(deriveTheme(DEFAULT_INPUTS))`) stays green because `DEFAULT_INPUTS` is `desaturate` and level-0 desaturate *is* the identity transform — the no-op is a level-0 short-circuit, not a separate `'none'` branch.

**Coverage is the road we walked, not a second spec.** It expanded by fixing visible defects; three forks are kept here because the code can't recover *why* a token is or isn't touched:

- **Backgrounds: all 8, by resampling — not 3, by snapping.** The first tint cut snapped each covered token to a literal Tailwind shade (`SHADE_MAP`), which structurally capped coverage at 3 of 8 (Tailwind's lightness ladder has no rung for most of MCU's narrow high-tone surface band) and left 5 ramp steps carrying MCU brand chroma beside the 3 neutral ones (GH #91). Resampling onto each token's own tone scales to the whole ramp, and `level=0` went from "MCU-as-is" to "pure chosen neutral" across all 8 — a faithful completion, since the 3 legacy tokens already anchored at the neutral.
- **Text is an accent (own knob); outline is coherence (no knob).** Same coherence-vs-accent fork, resolved opposite ways. A brand-tinted *border* on an otherwise-neutral card reads as a structural leftover, so outline just follows the surface (GH #93). A brand-tinted *heading* is a deliberate look, so text earned its own decoupled `surfaceTintTextLevel` (GH #92). Desaturate touches text automatically for coherence (chromatic text on a drained surface looks broken); that asymmetry is intentional.
- **Text neutralizes from the palette, not from MCU.** The first text cut blended from the token's own MCU value, so `textLevel=0` was MCU-identical — but MCU paints `on-surface` with brand hue+chroma, so "pick a neutral palette" left text quietly brand-tinted: neutral that wasn't neutral. `textLevel=0` is now the chosen neutral sampled at the token's tone, exactly like the backgrounds.

`--ring`/focus differentiation is deliberately out of scope: md has no distinct ring token (`--ring` is a shadcn binding onto outline), so a brand focus ring on neutral borders is a rebinding decision, not a surface-treatment one. The text constants (`TARGET_CHROMA`, `TEXT_CHROMA_CEILING_FRACTION`) were settled by eye in the throwaway `/prototype-text-accent` lab as the most accent that clears the 4.5:1 floor on the canary token (`on-surface-variant`/`--color-surface`, already in `CONTRAST_PAIRS`) in both modes; the live contrast audit scores user-pushed levels automatically.

**Consequence:**

- ADR-0017's WYSIWYG commitment holds. The single `deriveTheme` path produces treated tokens; `applyDom` and `exporters/*` only format what derive returned. There is no second derive path for "treated" output.
- The chrome/component asymmetry from ADR-0002 survives in the *which tokens get touched* dimension: treatment functions accept and return only the md surface family; primary/on-primary/etc. flow through MCU untouched.
- Adding a third algorithm (e.g. `'lift'`, `'dim'`) is one new file in `packages/core/src/theme/`, one entry in `SURFACE_ALGOS`, one branch in `applyTreatment`, plus its own level-0 identity short-circuit. No type-shape pressure until issue #3's second-consumer trigger fires.
- Future palette-sourced surfaces (the original ADR-0002 idea, via ColorSystem's optional `surfaceShadeMap`) remain possible as a separate, additive, picker-driven feature — composing alongside, not instead of, the algorithmic treatments here.
- Issue #3 governs the abstraction question (a unified `SurfaceTreatment` registry); this ADR governs the mechanism. Mechanism is decided now; abstraction waits for a concrete second consumer.

**Amendment anchors** — dates cited from code/docs; each decision is folded into the body above and kept here only so the citation resolves in one hop:

- **2026-05-05** — "treatment family" became a per-algorithm coverage subset declared at the code site (the original uniform-family wording was authored against slice 1's token set). Folded into the Decision's coverage bullet.
- **2026-05-20** — tint mechanism is resample-onto-MCU-tone, not `SHADE_MAP` snapping; coverage scaled 3→8 backgrounds and the `mode` param dropped. Folded into Mechanism + Coverage.
- **2026-05-21** — text accent (`surfaceTintTextLevel`, GH #92) and outline coverage (coherence-coupled, treatment-over-pin order, GH #93) shipped. Folded into the Decision shape + the Coverage forks.
- **2026-05-30** — confirms no `'none'` member ships; identity is level-0 desaturate. Folded into the Decision's first bullet.

**Code anchors:** `packages/core/src/theme/surface/tint.ts` — post-MCU algorithmic surface treatment.
