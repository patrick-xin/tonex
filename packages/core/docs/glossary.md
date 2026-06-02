## Project domain

**Engine**:
The fixed color-generation library: MCU. Produces palettes from a seed using HCT/CAM16.

**ColorSystem**:
A palette-library slot for third-party libraries (Tailwind, Radix). Not an engine, but a source picker.

**Source**:
The persisted state — only what the user picked, never what was computed. `PortableTheme` in `packages/core/src/theme/schema.ts` is the wire shape; `SourceState` adds `_hydrated` and actions. HCT is the canonical seed representation, with the user's pasted hex preserved verbatim in `seed.exactHex` until they touch an HCT axis — see ADR-0028.

**Derived**:
Pure function of Source. `deriveTheme(source) → { md, shadcn, warnings }` in `packages/core/src/theme/derive.ts`. Both modes co-derive in one call. Never persisted. See ADR-0017.

**Sink**:
A consumer of Derived output. Today: `applyDom` (runtime renderer). Future: exporters in `packages/core/src/theme/exporters/` (slice 4). Each Sink only formats what `deriveTheme` returned — never recomputes. See ADR-0017.

**Spine**:
The single pure orchestrator: `deriveTheme(source) → { md, shadcn, warnings }`. See ADR-0005 (no facade) and ADR-0017 (lean spine).

**Variant**:
A named MCU scheme strategy (cmf, tonalSpot, etc.) registered in `packages/core/src/variants/`. Each entry implements `VariantStrategy` and feeds `deriveTheme` via a registry lookup. Not a chart axis — chart shape lives under `chart.scheme` (ADR-0027).

**Surface treatment**:
A post-MCU transform on the neutral ramp. `surfaceAlgo: 'tint' | 'desaturate'` selects at most one transform. Runs inside `deriveTheme` between md emit and shadcn bind so all consumers see the treated values.

**Lock**:
A boolean gate on a Source field that no-ops the corresponding setter while true. Today there is one: `seedHexLock` blocks every seed-write pathway (hex input, image extraction) at the store seam. Pinning a token to an exact hex is a separate concept — see `md3TokenOverrides` in `packages/core/src/theme/schema.ts`.

**Touched-state**:
A recorded per-field boolean signal that the user chose a Source input — NOT a comparison against the default value, so a user who deliberately picks the default is still "touched" (ADR-0031 #4). Today there are two, resolved independently at apply: `seedTouched` (set in the seed setters) and `contrastTouched` (set in `setContrastLevel`); both cleared by `reset`. It gates preset apply: an untouched (and, for the seed, unlocked) field adopts a Preset's curated value automatically; a touched one is preserved unless the user picks the preset's value in the apply dialog's per-field keep-vs-adopt choice (`preset-dialog.tsx`, ADR-0031 #6). The signal tracks user choices only — a curated value written by apply never sets it. See ADR-0031.

**Theme Preset**:
An adoptable identity for a whole theme: a *recipe* (variant + surface treatment + the 26-role binding map for both modes) plus the *curated source inputs* it was tuned against (a curated `seed` and `contrastLevel`). `findActivePreset` decides identity from the recipe only — never the source inputs (ADR-0031 #5). On apply, `resolvePresetApply` overwrites every recipe field and supersedes only an untouched, unlocked source field with the curated value. Library lives in `packages/core/src/theme/shadcn-presets.ts`; the apply resolver in `preset-apply.ts`. A binding-only starting point is *not* a preset — it carries no identity (ADR-0031 #1). See ADR-0026, ADR-0031.

**Binding / Override**:
Two parallel shadcn-layer fields. A *binding* (`shadcnRoleBindings`) is symbolic and fully populated — role → MD token. An *override* (`shadcnRoleOverrides`) is a sparse, per-mode literal hex pin (presence = "pinned for this mode"). Resolution precedence is override > binding-resolved token. Bindings explore; overrides commit. See ADR-0026.

**Chart palette**:
`PortableTheme.chart` carries chart intent — `scheme: 'categorical' | 'sequential' | 'diverging'`, with future axes nested under `chart.*`. Derivation produces `--chart-1..5` (N = 5 today; `chart.count` reserved); chart overrides pin on top, terminal and scheme-agnostic. See ADR-0027.

