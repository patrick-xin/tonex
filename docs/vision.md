# Tonex — vision

Tonex turns a seed colour into copy-paste-ready themes for both **Material 3** and **shadcn**, generated from one source in one call. Light and dark are co-derived; preview and export never drift (see ADR-0017).

## What it is

A local-first theme tool. The user picks a seed (or extracts one from a logo); the engine — Material Color Utilities (MCU) — produces a coherent palette; tonex emits CSS variables for both Material 3 and shadcn token shapes. Both are editable through variant choice, contrast level, surface treatment, and per-token overrides.

## Who it's for

- **Designers** porting a brand colour to a component system and needing accessibility-aware light/dark behaviour without picking each shade by hand.
- **Developers** adopting a component system on a new project and needing copy-paste fidelity from preview to shipped CSS.
- **Teams** running both Material 3 (e.g. on iOS) and shadcn (on web) who want one source of truth across both ecosystems.

## What makes it distinct

- **Edit once, export both.** Single source store, two coherent token sets. Switching between MD3 and shadcn views does not re-derive — both are always live.
- **MCU-grounded.** Hue / Chroma / Tone (HCT/CAM16) gives perceptually consistent palettes. Surface treatments (tint, desaturate) and contrast level are first-class.
- **WYSIWYG.** What you see in the canvas is exactly what `exportCss` produces. The drift-guard test asserts this contract on every change.

## Non-goals

- **No backend.** Local-first, no sync, no auth, no server-side colour math.
- **No engine swap.** MCU is the engine; alternative palette generators (custom algorithms, linear lightness ramps) are out of scope (see ADR-0001).
- **No multi-user collaboration in v1.** Single-user editing.
- **No mobile-first editor.** Mobile preview of tokens is fine; mobile editing affordances are not on the v1 path.

## Where it's going

- More export formats (json, dart, ts) when there's demand for them.
- Integration with upstream design-spec sources, so a spec generated elsewhere can flow through tonex's refinement step into shippable CSS.
- More variants and palette libraries (Tailwind, Radix) as `ColorSystem` plugs (see ADR-0004) — not as engines.

## Decisions of record

This doc carries the *positioning*. Architectural commitments live in `docs/adr/`:

- ADR-0001 — MCU is the fixed colour engine
- ADR-0017 — WYSIWYG, no preview/export drift
- ADR-0019 — Production UI: layer-segmented routes, layer-unified engine
- ADR-0020 — Lift vs rewrite standard for legacy code

Read the ADR index for the full set.
