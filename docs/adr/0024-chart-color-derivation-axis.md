> **State:** Superseded by ADR-0027.

# Chart-color derivation axis — mono vs multi

ADR-0021 commitment 2 established chart tokens as "derived from the primary palette via a fixed 5-tone mapping." That commitment was right for slice 1 of charts, but it bakes in a single shape: charts always inherit the variant's tonal character. Real chart usage splits into two intents — *coherent series* (chart colors that feel like the theme) and *distinct series* (chart colors that maximize visual separation across data classes). One algorithm cannot serve both. This ADR introduces a `chartMode` axis that names the split and routes each intent through the algorithm that fits it.

**Decision:** five commitments.

## 1. The axis: `chartMode: 'mono' | 'multi'`, default mono

`PortableTheme` gains a `chartMode` field with two values:

- **mono** — the slice-1 behavior, retained as the default. Reads `scheme.primaryPalette.tone(N)` at fixed per-mode tones (`CHART_TONES_LIGHT/DARK`). Variant-aware (Vibrant / Expressive / Rainbow flavor flows through the palette). Respects `paletteOverrides` because the override mutates the primaryPalette in place upstream of chart derivation.
- **multi** — synthesizes 5 chart points via `Hct.from(hue, chroma, tone)` with hue offsets `[0, 120, 240, 60, 180]` from the seed's HCT hue. Fixed chroma (50) and tone (50 light / 60 dark). Variant-*bypassed* by design.

Default mono mirrors shadcn's default chart palette character — the wider ecosystem's expected baseline. Multi is opt-in for dashboards that need maximum series separation.

**Why:** naming the axis at the schema layer makes the intent visible to every downstream consumer. A single algorithm with internal heuristics would conceal the choice; two named modes surface it for migration, UI, telemetry, and tests.

## 2. Mono routes through `primaryPalette`; multi bypasses it

Mono and multi diverge in a single, sharp way: mono reads the palette, multi synthesizes from raw HCT.

- **Mono reads palette** — variant tonal-spotting (the choice of tones that defines tonalSpot vs vibrant vs expressive vs cmf) is the variant's whole point. A chart series sourced from palette tones inherits that character automatically. Palette-override pressure (user pinning primary to a specific hex) flows through identically.
- **Multi bypasses palette** — hue rotation around a base point is structurally incompatible with variant tonal-spotting. The variant chooses tones along a single hue's tonal palette; multi by definition steps to other hues. Routing multi through the variant palette would either (a) discard the offsets (defeating multi) or (b) sample tones from palettes that aren't the primary's (incoherent).

The split is permanent. Future variant additions extend mono's character without touching multi.

**Why:** the failure mode this commitment closes is a future agent "unifying" the two paths under one palette read. The unification is plausible at first glance (both produce 5 chart tokens), but it loses the property each path is built for. Pinning the divergence as load-bearing prevents that refactor.

## 3. Achromatic guard on multi

A near-achromatic seed (chroma < 5) has no usable hue. Under multi, the base hue falls back to **270** (purple) instead of multi-rotating around an unstable base.

The threshold (5) matches MCU's internal "essentially gray" comparisons. The fallback hue (270) matches shadcn's default chart palette starting point — gray-seed users get the shadcn-default-shaped chart, not an all-gray chart.

Mono has no equivalent guard: an achromatic seed produces a gray ramp (the palette tones are still well-defined; they just have low chroma). That's the documented mono behavior, and users opting into mono accept the consequence.

**Why:** without the guard, a user picking #808080 with multi mode gets 5 chart values that are all visually identical (chroma=0 collapses hue distinctions). Silent degradation is worse than fallback. The fallback is named in the ADR so a future "remove magic constants" pass doesn't strip it.

## 4. Same chart shape on shadcn layer

`shadcn.lightChart` / `darkChart` continue to mirror md chart values under shadcn naming (`--chart-N`). The chartMode axis applies once at md derivation; `rebrandChart` re-keys the same argb values. One source of truth, two namespaces — chart character can't drift between layers.

**Why:** this ADR is about the *algorithm* axis, not the namespace axis. Layered emission (ADR-0021 commitment 5) stays as-is; chartMode threads through unchanged because it produces a single argb-valued TokenMap that both layers consume.

## 5. Out of scope: chart-seed source, exposed tones

Future work is anticipated but explicitly **not** committed in this ADR:

- **Chart seed source** — letting the user pick whether multi rotates around primary, secondary, or tertiary's hue. Today multi reads `seedHct.hue` (== source seed's hue). A future axis `chartSeed: 'primary' | 'secondary' | 'tertiary'` is a separate ADR when its UI surface lands.
- **Exposed tones** — letting the user expose / pin individual chart tones for editing in the same shape `md3TokenOverrides` exposes core tokens. A future slice; same shape (`chartTokenOverrides: { light, dark }`), separate ADR, separate migration.

These are named here so future-me reads "the design space stayed open" rather than "we forgot." Neither is built into the current axis; both attach as adjacent fields when their consumers ship.

**Why:** YAGNI per `slice-strategy.md`. The current axis is what the current visible bug needed. Pre-building speculative axes would force schema migrations that no consumer exercises.

---

## Implementation pointers

- `packages/core/src/theme/schema.ts` — `CHART_MODES`, `ChartMode`, `chartMode` field on `PortableTheme`. `SCHEMA_VERSION = 10`.
- `packages/core/src/theme/source.ts` — v9→v10 migration fills `chartMode: 'mono'`. `setChartMode` action.
- `packages/core/src/theme/derive.ts` — `buildMdChart(seedHct, scheme, mode, chartMode)` branches.
- `packages/core/src/theme/derive.test.ts` — multi distinctness, achromatic-fallback, mono drift-guard.
- `packages/core/src/theme/source.test.ts` — v9→v10 migration test.

UI surface for the toggle is intentionally deferred (decision: "decide later"). Default mono keeps everything visually identical until the toggle lands.
