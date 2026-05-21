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

## Amendment — 2026-05-21

The opt-in text accent deferred above (GH #92) shipped. Tint now also covers `on-surface` and `on-surface-variant`, driven by a **separate** `surfaceTintTextLevel` (`{ light, dark }`, default `{0,0}`). It is deliberately *not* coupled to `surfaceTintLevel`: the reachable target is "clean neutral surfaces + brand-accented text", which is impossible if text rides the surface slider. Only `surfaceAlgo='tint'` reads it.

Text follows the **same neutral→brand model as the backgrounds**, on its own knob — the design call that settled the slice. The first cut had text blend from its own MCU value (so `textLevel=0` was MCU-identical), reasoning that MCU already paints `on-surface` with brand hue+chroma so neutral was the wrong base. That broke the product promise: picking a neutral palette gives clean *surfaces* but left text quietly brand-tinted by MCU — "neutral" that wasn't neutral. So `textLevel=0` is now the chosen neutral palette sampled at the token's own tone (MCU's brand chroma drained out, exactly like the backgrounds), and `textLevel` lifts hue toward `--color-primary` and chroma toward a ceiling. `textLevel=0` is therefore *not* MCU-identical — but the drift-guard baseline is safe because `DEFAULT_INPUTS` is the desaturate algo, which never calls this path.

The one place text diverges from the background recipe is the chroma ceiling. Backgrounds cap at `TARGET_CHROMA` (8 — a whisper, surfaces must stay calm); text caps at `TEXT_CHROMA_CEILING_FRACTION` (**25%**) of the *primary's own* chroma — a deliberately stronger, seed-relative accent so a vivid seed pops and a muted one stays muted. The curve is linear (no easing). Both constants were settled by eye in the throwaway `/prototype-text-accent` lab across vivid and muted seeds: 25% is the most accent that clears the 4.5:1 floor on the canary token in both modes.

Responsible to expose only because the contrast audit is live: the `on-surface-variant`/`--color-surface` pair (the canary muted token, nearest the 4.5:1 floor) is already in `CONTRAST_PAIRS`, so user-pushed text-tint levels are scored automatically — no new pair was needed.

## Amendment — 2026-05-21 (outline coverage, GH #93)

The 2026-05-05 amendment's "each algorithm picks its own subset" left `--color-outline`/`--color-outline-variant` in neither treatment — they flowed straight from MCU's neutral-variant palette at chroma 16–39. So at either neutralizing extreme (desaturate maxed, tint at level 0) the surface went neutral while every border, divider and focus ring kept full brand chroma on it. These tokens feed `--border`/`--input`/`--ring`/`--sidebar-border`/`--sidebar-ring`, so the mismatch showed on every bordered component, not just md consumers.

Both treatments now cover the outline pair, **coherence-coupled** to the surface — *not* decoupled the way text (#92) is. The fork is the same coherence-vs-accent one as #91→#92, resolved the opposite way for borders: a brand-colored heading is a deliberate look (so text earned its own opt-in `textLevel`), but a brand-colored border on an otherwise-neutral card reads as a structural leftover, not an accent. So borders simply follow the surface — desaturate adds them to its uniform chroma-drain family; tint rides them on `surfaceTintLevel` with the backgrounds' resample recipe (level 0 → chosen neutral, level 1 → nudged back toward brand at `TARGET_CHROMA`). No new schema field.

Two consequences worth recording:

- **`--ring`/focus differentiation is a binding concern, deliberately out of scope here.** md has no distinct ring token — `--ring` is a shadcn binding onto outline. A brand focus ring on neutral borders is reachable by rebinding `--ring`→`--color-primary`, which is an override/binding decision, not a surface-treatment one. The treatment touches the two md outline tokens uniformly.
- **Outline now obeys the pipeline's treatment-over-pin order.** md3 token pins land before `applyTreatment` (derive.ts), so a pin on a treated token is then subject to the active treatment — long-standing for the surface backgrounds, now also true for outline. This is consistent, not a new rule: the surgical-pin guarantee was always "beats MCU and palette regen", never "beats the surface treatment".

Contrast-safe to make automatic: outline×surface pairs already sit in `CONTRAST_PAIRS` at the 3:1 structural floor, and chroma scaling preserves tone, so the live audit guards user-pushed levels. The body invariant (treatment touches the md surface family, primary stays MCU) is unchanged — outline is part of that family.
