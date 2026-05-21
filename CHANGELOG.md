# Changelog

Slice-organized history. Each entry corresponds to a vertical-tracer increment per `docs/agents/slice-strategy.md`. Format loosely follows [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Architecture
- ADR backlog filled — ADRs 0006–0008, 0010–0016 codify decisions previously held only in memory.
- ADR-0009 — runtime-validated `PortableTheme` via valibot; post-rehydrate parse with all-or-nothing reset on failure (closes #10).
- Domain-discipline rules graduated to `docs/agents/code-conventions.md` (primitive-shape diff, disable-over-warn).
- Triage labels aligned between `docs/agents/triage-labels.md` and GitHub.

### Slice tint-ramp — Surface tint covers the full ramp (closes #91)

- `fix(core)`: surface tint repainted only 3 of 8 surface-background tokens, leaving 5 to flow through MCU carrying brand chroma (6.5–38) — so neutral and brand-tinted steps alternated in one elevation ramp. Tint now covers all 8 backgrounds with one coherent neutral ramp.
- `refactor(core)`: tint mechanism swapped from literal-Tailwind-shade snapping (`SHADE_MAP`, structurally capped at 3 tokens — Tailwind's lightness ladder has no rung for most of MCU's narrow surface tone band) to **resampling** the chosen neutral palette onto each token's own MCU tone. `applySurfaceTint(layer, level, paletteName)` drops the `mode` param (tone carries the light/dark split), mirroring `applySurfaceDesaturate`'s per-token shape. `level=0` is now pure chosen neutral — the inspectable anchor. Text (`on-surface`/`on-surface-variant`) stays MCU-derived; brand-tinted text deferred to an opt-in accent (#92). ADR-0018 amendment 2026-05-20.

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
