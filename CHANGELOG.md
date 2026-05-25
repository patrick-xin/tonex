# Changelog

Slice-organized history. Each entry corresponds to a vertical-tracer increment per `docs/agents/slice-strategy.md`. Format loosely follows [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Slice per-mode-contrast — Contrast level splits to `{ light, dark }` (closes #123)

- `feat(core)`: `contrastLevel` on `PortableTheme` goes from a flat scalar to per-mode `{ light, dark }` (default `{0,0}`), mirroring the surface levels — dark mode can now carry its own baseline (e.g. OLED legibility). MCU already takes `contrastLevel` as a per-`build()` argument and `deriveTheme` calls `build()` twice, so each mode feeds its own value; the split is structural, not a workaround. New `[0,1]`-bounded mode-keyed valibot schema (the existing `ModeKeyedNumberSchema` is unbounded). `SCHEMA_VERSION` 2→3, no migration (pre-launch). The drift-guard baseline holds byte-for-byte: `{light:0,dark:0}` derives identically to the old scalar `0`.
- `feat(core)`: `setContrastLevel(mode, level)` — per-mode write, mirroring `setSurfaceTintLevel`. The touched signal `contrastTouched` stays a **single boolean** (touching either mode arms it), and `resolvePresetApply` expands a preset's **scalar** curated contrast to both modes at once — adopting a preset's contrast is one decision. Preset identity is unaffected (contrast is a source input, not a recipe field), so `preset.contrastLevel` stays scalar and ADR-0031 stays frozen.
- `refactor(core)`: the unified derive cache keys on the `{light,dark}` pair; `getDerivedTheme(source, uniformContrast?)`'s scalar override now means "uniform on both modes" — the authored per-mode baseline (default export tier) is separated from the uniform accessibility tiers (medium 0.5 / high 1.0), which stay scalar by definition.
- `feat(www)`: the contrast slider is now mode-scoped via `useActiveMode`, editing the active mode like surface-adjustment. The preset-switch dialog keeps one contrast row, showing `light/dark` only when the user's two modes diverge. The export header emits a single `contrast:` value when modes match and `light/dark` when they diverge, omitting it only when both are baseline.

### Slice native-css — Framework-agnostic Material CSS export

- `feat(core)`: `exportNativeCss(bundle, options)` — a new sink for the non-Tailwind / Material Web audience. System tokens emit under the MD3 spec namespace `--md-sys-color-*` (toggle `mdSysPrefix`, on by default; only the closed `MD_TOKEN_NAMES` set is renamed, so chart/custom slugs stay `--color-*`). One `:root` block, every token a `light-dark(L, D)` pair under `color-scheme: light dark` — a no-framework page auto-follows the OS, while `.dark` / `[data-theme]` switches flip `color-scheme` for class- and attribute-toggle stacks. `includeExtended` defaults **on** here (Material Web reads `*-fixed` etc.). Contrast tiers stack as `.contrast-medium` / `.contrast-high`. ADR-0017 sink discipline holds — projection-only, no recomputed color.
- `feat(www)`: **CSS** export tab beside Tailwind/JSON/Dart, with a `md-sys prefix` switch plus Format/Extended/Chart/Contrast. Same provenance header as the other CSS paths.

### Architecture
- ADR backlog filled — ADRs 0006–0008, 0010–0016 codify decisions previously held only in memory.
- ADR-0009 — runtime-validated `PortableTheme` via valibot; post-rehydrate parse with all-or-nothing reset on failure (closes #10).
- Domain-discipline rules graduated to `docs/agents/code-conventions.md` (primitive-shape diff, disable-over-warn).
- Triage labels aligned between `docs/agents/triage-labels.md` and GitHub.

### Slice tint-ramp — Surface tint covers the full ramp (closes #91)

- `fix(core)`: surface tint repainted only 3 of 8 surface-background tokens, leaving 5 to flow through MCU carrying brand chroma (6.5–38) — so neutral and brand-tinted steps alternated in one elevation ramp. Tint now covers all 8 backgrounds with one coherent neutral ramp.
- `refactor(core)`: tint mechanism swapped from literal-Tailwind-shade snapping (`SHADE_MAP`, structurally capped at 3 tokens — Tailwind's lightness ladder has no rung for most of MCU's narrow surface tone band) to **resampling** the chosen neutral palette onto each token's own MCU tone. `applySurfaceTint(layer, level, paletteName)` drops the `mode` param (tone carries the light/dark split), mirroring `applySurfaceDesaturate`'s per-token shape. `level=0` is now pure chosen neutral — the inspectable anchor. Text (`on-surface`/`on-surface-variant`) stays MCU-derived; brand-tinted text deferred to an opt-in accent (#92). ADR-0018 amendment 2026-05-20.

### Slice text-tint — Opt-in brand text accent for Tint (closes #92)

- `feat(core)`: `surfaceTintTextLevel: { light, dark }` on `PortableTheme` (default `{0,0}`), a **separate** level from `surfaceTintLevel` so "neutral surfaces + brand-accented text" is reachable. `applySurfaceTint` gains a 4th `textLevel` param covering `on-surface`/`on-surface-variant` under `surfaceAlgo='tint'`, following the **same neutral→brand model as the backgrounds**: `textLevel=0` drains MCU's brand chroma out to the chosen neutral palette at each token's tone (a genuinely clean baseline — neutral surfaces get neutral text), and `textLevel` lifts hue toward `--color-primary` and chroma toward a ceiling, tone pinned. The one divergence from the bg recipe is the ceiling: backgrounds whisper at `TARGET_CHROMA=8`, text accents at `TEXT_CHROMA_CEILING_FRACTION` (25%) of the primary's own chroma, linear — both settled by eye in the throwaway `/prototype-text-accent` lab as the most accent that clears 4.5:1 on the canary token. `textLevel=0` is *not* MCU-identical, but the drift-guard baseline is safe (`DEFAULT_INPUTS` is the desaturate algo). `findActivePreset` now compares the new field. No new contrast pair — `on-surface-variant`/`--color-surface` was already scored, so the live audit catches user-pushed levels. ADR-0018 amendment 2026-05-21.
- `feat(www)`: text-accent slider in the surface-adjustment popover, shown only under the tint algo, wired to `setSurfaceTintTextLevel`. Off by default.

### Slice outline-coverage — Surface treatments cover the border tokens (closes #93)

- `fix(core)`: neither treatment touched `--color-outline`/`--color-outline-variant`, so at the neutralizing extreme (desaturate maxed, or tint at level 0) the surface went neutral while borders/dividers/focus rings kept full brand chroma (c≈16 for md-purple, c≈39 for red) on a grey surface — and these feed `--border`/`--input`/`--ring`/`--sidebar-*`, so it showed on every bordered component. Both treatments now cover the outline pair, **coherence-coupled** to the surface (no new knob): desaturate adds them to `SURFACE_FAMILY` (uniform chroma drain); tint rides them on `surfaceTintLevel` with the backgrounds' resample recipe. Borders are structural, not foreground accents — unlike text (#92) they get no decoupled accent knob, since a brand edge on a neutral card reads as a structural leftover. `--ring`/focus differentiation left to the binding layer (rebind `--ring`→primary), out of scope. Re-baked `globals.css` (the default preset desaturates light at 0.3, so the two light-mode outline tokens drain). ADR-0018 amendment 2026-05-21.

### Slice preset-1 — Shadcn aesthetic presets (closes #36)

- `feat(core)`: `SHADCN_PRESETS` library — 7 curated aesthetic bundles (`default`, `stark`, `soft`, `warm`, `playful`, `monotone`, `tech`). Each holds the 6 structural fields a preset can pin: `variant`, `surfaceAlgo`, `surfacePaletteName`, `surfaceTintLevel`, `surfaceDesaturateLevel`, `shadcnRoleBindings`. Per ADR-0026, presets touch bindings only — no override fields.
- `feat(core)`: `DEFAULT_INPUTS` and `DEFAULT_SHADCN_ROLE_BINDINGS` now derive from `SHADCN_PRESETS.default` — single source of truth. New Default uses cmf variant + desaturate surface + `--primary` → `--color-primary-container` (light) / `--color-primary` (dark, link-safe asymmetric).
- `feat(core)`: `findActivePreset(theme)` predicate — deep equality across the 6 fields, returns preset name or `null` for diverged state. `setShadcnPreset(name)` action on the source store applies a bundle atomically.
- `feat(www)`: `ShadcnPresetPicker` popover in the shadcn nav-tabs row — 7 chips, active recipe filled-highlighted, click applies via `setShadcnPreset`. Mounted through a new `extras` slot on `NavTabs`.
- `feat(www)`: `/theme/shadcn/tuner` dev sink — mounts the 3-tab curator rail (bindings / overrides / changes) via pathname-based rail switcher in the shadcn layout. Persists post-slice as the editing surface for future preset library iterations.
- `refactor(www)`: tuner curator surface drops `advisoryOverrides` — ADR-0026 makes presets bundle-only, so the override-traceability artifact had no destination in core and is no longer captured.

### Slice 12 — Chart-color emission + chartMode axis

- `fix(core,www)`: chart-color runtime emission gap — `formatLayer` now spreads `lightChart`/`darkChart` into both `.md` and `.shadcn` blocks; `globals.css` `@theme inline` chart entries self-reference; `.md` block aliases shadcn-naming `--chart-N` to `--color-chart-N` so Tailwind utilities (`bg-chart-1`) and Recharts `var(--chart-1)` both resolve at runtime.
- `feat(core)`: `chartMode: 'mono' | 'multi'` axis on `PortableTheme`, default mono. Mono branch reads `scheme.primaryPalette.tone()` at fixed mode tones (variant-aware, palette-override-aware). Multi branch synthesizes 5 hue-rotated points via `Hct.from()` with offsets `[0, 120, 240, 60, 180]` at fixed chroma 50, mode-tone 50/60; achromatic seed (`chroma < 5`) falls back to hue 270. `SCHEMA_VERSION 9 → 10`; v9→v10 migration fills `'mono'`. Per ADR-0024.
- `feat(www)`: display-prefs popover gains chart-palette ToggleGroup (mono | multi). Primary editing surface intentionally deferred — this is the temporary surface until chart UX lands.
- ADR-0024 — chart-color derivation axis (mono vs multi); ADR-0021 amendment notes commitment 2's "fixed 5-tone mapping" is the mono branch under the new axis.

## Slice 11 — Palette-level overrides + fine-tune UI

- `feat(www)`: palette-override fine-tune UI (`4bf979b`)
- `feat(core)`: palette-level hex overrides (`80ab15d`)
- `feat(core)`: CMF second source color (`ae6cc80`)
- `feat(core,www)`: HCT sliders + custom colors (`1dc5031`)

## Slice 10 — Editor rail (production UI)

- `chore(www)`: enable react-compiler + cacheComponents (`d84e2ba`)
- `feat(core,www)`: editor rail — surface adjustment (`b83f34f`)
- `feat(core,www)`: editor rail — source color + scheme variants (`cb5abfe`)

## Slice 9 — Production UI blueprint (doc-only)

- `docs`: production UI blueprint (`835dbda`) — ADR-0019 (segmented routes), ADR-0020 (lift-vs-rewrite), `docs/agents/www-structure.md`, `docs/agents/slice-strategy.md` blueprint-slice provision.

## Slice 8 — Lock + reset structural coverage

- `test(core)`: lock + reset structural coverage (`bc8c16a`) — `reset()` restores every PortableTheme field; `seedHexLock` round-trip in applyDom proves source-only locks.

## Slice 7 — Surface tint palette picker

- `feat(core,www)`: surface tint palette picker (`8d35290`)

## Slice 6 — Generic md token override map

- `feat(core,www)`: generic md token override map (`12b5d3e`)

## Slice 5 — Variant breadth

- `feat(core,www)`: register all 10 MCU variants (`04d7d43`) — VariantStrategy widened with optional `secondHct?` (per ADR-0010).

## Slice 4 — Exporter seam

- `feat(core,www)`: `exportCss` + copy button (`c8ef555`) — single layer-discriminated exporter (per ADR-0008).

## Slice 3 — Custom colors

- `feat(core,www)`: customColors (`8e925c3`)

## Slice 2 — Full token + OKLCH

- `feat(www)`: card + button primitives — md and shadcn token canaries (`8e8c530`)
- `feat(core,www)`: hex → OKLCH emission (`c4f5a02`)
- `feat(core,www)`: full md + shadcn token expansion (`b67af17`)
- `feat(core,www)`: seedHexLock + reset-to-defaults (`681faa0`) — slice 2 preamble; lock pivot from snapshot to boolean per ADR-0007.

### Slice 2 spike

- `feat`: primary family + cross-layer mapping (`fb4a04d`)
- `feat`: surface-treatment algorithms — tint + desaturate (`ec6cf46`)
- `feat`: variant dispatch — tonalSpot + UI picker (`d9225b4`)
- `feat`: small-loop mutation group — global tint + contrast + primary hex lock (`94e8849`)

## Slice 1 — Tracer

- `feat`: slice 1 (`eb45dab`)
- `feat(www)`: slice 1 tracer wiring — layout + page + preview (`5175987`)
- `feat(www)`: bake globals.css + drift-guard (`2424a15`)
- `feat(core)`: useResolvedTokens hook + public barrel (`b53d3c8`)
- `feat(core)`: applyDom renderer + formatCss (`1432d33`)
- `feat(core)`: deriveTheme spine — both modes co-derived (`fbdb22c`)

## Foundation refactor pass (post-slice-1, pre-slice-2)

- `refactor(core,www)`: architecture audit — prune, split, hide (`329cd76`, closes #7) — barrel hygiene, MCU passthrough fix, lock-shape asymmetry resolved.
- `test(core)`: structural drift guards — round-trip + import discipline (`1ac9f57`)
- `refactor(www)`: testbed feature + `/sink` route — clean `/` + push `'use client'` down (`efdee43`)
- `refactor(core)`: drop mdTinted/mdDesaturated from DerivedTheme — lean spine (`c7af5c2`)
- `refactor(core)`: export `SHADCN_ROLE_NAMES` — schema canonical for role iteration (`d6cf464`)
- `refactor(core)`: `selectPortable` helper — single SourceState→PortableTheme projection (`22cca8c`)
- `test`: persistence round-trip — structural coverage of partialize blacklist (`38d1144`)

## Performance

- `perf(core)`: collapse streaming-input cost (`2f24edf`, closes #9) — debounced storage, `flushPersist()` seam.

## Bug fixes (post-foundation)

- `fix(core)`: strip OKLCH trailing zeros so drift-guard survives biome formatting (`0e3ad38`)
- `fix(core,www)`: restore `--card` asymmetric defaults (`f4d83b1`, regressed in `04c21ff`)
- `fix(core,docs)`: post-audit cleanup (D1–D3, S1) + bake globals.css (`04c21ff`)
- `fix(core)`: v1 → v2 migration for shadcnRoleBindings expansion (`77af02a`)

## Per-mode surface levels

- `feat(core,www)`: per-mode surface levels (`cef65d9`, closes #2, #4, #8)

## Engineering scaffolding

- `chore(www)`: stop tracking next-env.d.ts (`1e34b4d`)
- `chore(www)`: add tailwind-merge (`4531965`)
- `refactor(core)`: surface/ folder + Mode shared type (`be6cfb8`)
- `chore(hooks)`: install drift-prevention layer (`3044962`)
- `fix(hooks,docs)`: harden boundary patterns + normalize CONTEXT.md header (`e04925f`)

## ADRs

- `docs(adr)`: install lifecycle policy — frozen ADRs, living glossary, agent docs in repo (`9cc5c79`)
- `docs(adr)`: reference-fix amendments — 0003 draft buffer, 0004 color-systems paths, 0005 theme dir (`9d97c64`)
- `docs(adr)`: ADR-0018 (algorithmic treatment); defer ADR-0002 (`f84f685`)
