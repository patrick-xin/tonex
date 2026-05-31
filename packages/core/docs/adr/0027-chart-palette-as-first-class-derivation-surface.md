# Chart palette as a first-class derivation surface

ADR-0024 introduced `chartMode: 'mono' | 'multi'` to split chart derivation along intent (coherent vs distinct series). That decision was right for the immediate question — one algorithm could not serve both intents — but the schema shape it landed under is too narrow for the design surface we now want to invest in. Two pressures push us to restructure:

1. **Chart override layer (issue #31)** extends ADR-0026's literal-pin pattern to `--chart-N`. The override layer is terminal and robust to any upstream derivation. The pressure lives on the *derivation side* — and `chartMode` is a flat, binary field with implementation-flavored names (`mono`/`multi`) that don't extend cleanly to the schemes we want.
2. **Chart palette generation is under-served algorithmically** in the broader palette-tool ecosystem. Most tools generate role colors competently and treat charts as primary-tone-stepped afterthoughts (which is what `mono` is today) or as hand-curated overrides. Programmatic generation with perceptual guarantees — categorical, sequential, diverging — is rare. The HCT space (ADR-0001) and contrast-pair machinery (ADR-0025) we already have put us in position to do this well. The shape of the chart-derivation surface should reflect that we intend to develop it.

This ADR reserves the namespace, renames the existing axis, and records the trajectory. It does not pre-build axes — those land as future slices when concrete asks materialize.

**Decision:** five commitments.

## 1. Nested `chart` namespace replaces flat `chartMode`

`PortableTheme` gains a `chart` namespace replacing the flat `chartMode`; the renamed axis is `chart.scheme: 'categorical' | 'sequential' | 'diverging'`. Future derivation axes (`seedPalette`, `count`, `tones`, `hueSpread`, `chroma`) slot in as additional properties on the `chart` object, one slice per concrete user-driven ask.

**Why:** the rename is cheap under the pre-launch schema-mutability policy (one slice, no migration plumbing). Nesting reserves the shape so each subsequent axis is a property addition on an existing object rather than another flat field on `PortableTheme`. Flat would also work (`chartScheme`, `chartSeedPalette`, …) but the chart-prefixed cluster reads cleaner as a namespace once it grows past two fields, and the singular `chart` matches the conceptual unit ("the chart palette") more closely than the alternative `chartConfig` did in discussion.

## 2. Scheme names align with data-viz vocabulary

The three scheme values are drawn from established palette-classification tradition (Cynthia Brewer's ColorBrewer, picked up by Tableau, Vega, D3, Observable):

- **`categorical`** — N distinct hues for nominal data. No ordering implied. Maps to today's `multi` branch.
- **`sequential`** — single-hue ramp from light to dark for ordered/quantitative data. Maps approximately to today's `mono` branch (see commitment 3).
- **`diverging`** — two-hue gradient meeting at a neutral midpoint for data with a meaningful center (positive/negative, above/below average). Not currently implemented; reserved for a future slice.

**Why:** scheme is the central concept in data-viz palette theory; using the standard vocabulary makes the field self-documenting for the audience that cares (data-viz consumers) and removes the implementation-flavored `mono`/`multi` names that were never meant as user-facing terms. The picklist is forward-extensible — ColorBrewer's full classification includes qualitative as a fourth (close cousin of categorical, optimized for nominal data); adding it later is a picklist extension, not a restructuring.

## 3. `sequential` commits to perceptual uniformity (trajectory, not immediately)

Today's `mono` reads `primaryPalette.tone(N)` at hardcoded tones (`CHART_TONES_LIGHT/DARK` from ADR-0024). The output is *approximately* sequential — palette tones are monotonic in MCU's tone scale — but proper sequential schemes (per ColorBrewer) require perceptually uniform *intervals*, not just monotonic tone numbers. MCU's tone scale is not L\*-uniform across all hues; identical tone steps can produce visually non-uniform jumps.

This ADR commits to the name `sequential` and accepts the implied trajectory: the rename slice lands with today's tone-stepped math (rename-only, no math change), and a follow-up slice tightens to perceptual uniformity (likely by sampling at uniform L\* intervals via HCT-from-LCh conversion). The follow-up is *not* gated on this ADR — it lands when chart-palette quality becomes the active investment.

**Why:** under-promising by calling it `tone-stepped` would lock the schema into the lesser shape. Naming it `sequential` and recording the trajectory means the math evolves under a stable schema; consumers don't see a rename when the math improves. Consumers reading the schema get a name that means what data-viz tradition says it means, with our commitment to make the implementation honest about that meaning over time.

## 4. Override layer is terminal and scheme-agnostic

Chart overrides (extending ADR-0026's pattern, scoped under issue #31) apply post-`rebrandChart`, after the scheme-driven derivation. Pins are scheme-agnostic: if a user pins `--chart-3` to a literal hex under `scheme: categorical` and later switches to `scheme: diverging` (where `--chart-3` is by convention the neutral midpoint), the pin still wins.

The cost: under `diverging`, a literal pin on the midpoint slot can break the scheme's visual contract. We accept this and surface it in the override UI as a soft informational note — "this slot is the neutral midpoint of your diverging scheme; values close to neutral are expected here." The note is informational; the override stands.

**Why:** this mirrors `shadcnRoleOverrides` precedence semantics exactly (ADR-0026 c.4 — override beats binding and md-layer override). Scheme-aware override clearing (auto-deleting pins on scheme change) would be a stronger statement about user intent than we have any basis to make: the user may switch scheme as a what-if without intending to discard their pins. Override is the commitment knob; we keep it stable across what-if exploration. The UI surface is the right place to communicate the interaction.

## 5. Properties the derivation must preserve

The trajectory under this namespace is justified by properties the foundation gives us. Each is a constraint any future chart-derivation slice must respect — together they form the rubric:

- **Perceptual uniformity in HCT** — categorical hue rotation in HCT space produces visually equally-spaced colors. HSL hue rotation, the conventional approach in lightweight palette tools, does not (HSL's hue dimension is not perceptually uniform). The difference is whether five colors feel "five distinguishable" or "five equally weighted to a viewer." Tests can assert HCT hue spacing on categorical schemes.
- **Contrast-pair coverage extends to chart-vs-chart** — ADR-0025's 3:1 non-text contrast pair machinery treats any two role tokens as a pair. Applying the same evaluator chart-vs-chart and chart-vs-background yields accessibility-validated palettes by construction. Tests can assert minimum contrast across chart token pairs.
- **Light/dark variants from a shared scheme contract** — `chart-1` in light mode and `chart-1` in dark mode are derived from the same scheme step, not chosen independently. The semantic ("category A is the same series whether the viewer is in light or dark") is preserved by construction. Tests can assert the contract under mode toggle.
- **Override layer for last-mile control** — the algorithmic foundation never becomes a cage. Users who need a specific brand color in a chart slot pin it (commitment 4), and the rest of the scheme stays consistent around it.

**Why:** explicit commitments give future slices their acceptance criteria. A "categorical scheme" slice that ships HSL hue rotation fails the HCT-uniformity test; a "diverging scheme" slice that ignores contrast-pair coverage fails ADR-0025's extension; a "count axis" slice that re-derives light and dark independently fails the shared-contract test. Naming the rubric in the ADR keeps slice work honest about what the surface is *for*.

## Out of scope (named for clarity, not commitment)

- **Chart override slice** — extends ADR-0026's pattern as a sibling axis. Doesn't need its own ADR; issue #31 tracks it. Override layer is terminal per commitment 4.
- **`chart.seedPalette` axis** — pick whether derivation anchors on `primary`, `secondary`, `tertiary`, `neutral`, or a custom hex. Future slice when a concrete consumer reaches for it.
- **`chart.count` axis** — variable N (3–12 typical). Future slice; requires extending `SHADCN_CHART_TOKEN_NAMES` and a UI strategy for dynamic token surface.
- **`chart.tones` / `chart.chroma` / `chart.hueSpread`** — fine-tuning knobs likely gated behind an "advanced" disclosure in UI. Future slices.
- **Brand-preset palettes** — pre-curated chart templates ("Stripe-like", "Material-default", etc.). Separate concern: presets *configure* the algorithmic surface this ADR scopes, they don't replace it.
- **Format-specific export** — D3 ordinal scale, Vega scheme dict, `.gpl`/`.aco` files. Generic CSS-variable export covers most consumers; format-specific export earns its own consideration.

---

ADR-0024's `chartMode` axis is superseded by this ADR's `chart.scheme` axis. The two-mode split established by 0024 (intent: coherent vs distinct series) is preserved verbatim; what changes is the namespace shape, the names (`mono`→`sequential`, `multi`→`categorical`), the reserved third value (`diverging`), and the perceptual-uniformity trajectory for `sequential`.
