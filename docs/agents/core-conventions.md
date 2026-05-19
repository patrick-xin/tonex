> **State:** Living. Edit when a working rule for `packages/core/` is added, refined, or retired.

# Core conventions

Working rules for `packages/core/` — applied at generation time, not at decision time. Decisions live in `docs/adr/`; this doc holds the rule that follows from a decision and fires when an agent touches a relevant file.

**Scope:** rules governing the engine, spine, source store, schema, sinks, derivation, tonex-internal token contracts, and where domain code lives in `@tonex/core`. Rules about importer-side concerns (monorepo layout per ADR-0011, www structure per ADR-0014/0019/0022) live in `code-conventions.md` and `www-structure.md`.

**Status (2026-05-19 — Slice A complete).** Created by Slice A of the corpus cleanup ([issue #69](https://github.com/patrick-xin/tonex/issues/69)). Sections below cover generation-time rules from the audit-reviewed corpus. ADRs carrying only one-time architectural decisions (0011 monorepo, 0012 MCU-vendoring) and www-side rules (covered in `www-structure.md` and `code-conventions.md`) are intentionally absent. Each citation resolves to a current ADR on master.

## Engine

The color generation engine is fixed: Material Color Utilities (MCU). One seed → multiple well-conditioned palettes across distinct moods. The rules below keep MCU as the only engine — pluralising the choice would force the UI to abstract over engine differences and dilute the live mood-shift demo that is the product wedge.

- **No `ColorEngine` slot.** MCU is the only engine; don't introduce an abstraction or alternate generator (Radix-as-engine, custom palette algorithms). _(ADR-0001)_
- **"Add Radix" means palette-library only.** A third-party color library joins as a palette source (the `ColorSystem` slot in `CONTEXT.md`), never as an engine swap. _(ADR-0001)_
- **No user-facing engine picker.** A surface that exposes "MCU vs other" is out of scope; mood-shift via variant is the product surface. _(ADR-0001)_

## Architecture: no facade

The public surface for callers is a hook, a pure derive function, and sink functions — not a `ThemeSystem` class wrapping derivation and effects together. The rules below preserve the Source / Derived / Sinks layering. Collapsing the layers under a facade defeats the slot-fill goal and makes derivation untestable without mocking effects.

- **No facade class.** Don't wrap `deriveTheme`, `applyDom`, and exporters behind a single `ThemeSystem.apply()` / `.toCSS()` API. The public surface stays as a hook (`useResolvedTokens`), a pure derive function (`deriveTheme`), and sink functions. _(ADR-0005)_
- **`deriveTheme` is pure.** Zero React imports, zero side effects, zero DOM access. The function is `(source) → output`, testable with real fixtures. _(ADR-0005)_
- **Higher file count is the shape, not a smell.** A "many imports" complaint motivates the facade — refuse the refactor. Callers import the public surface, not the file tree. _(ADR-0005)_
- **CSS serialisation lives in `exporters/*`, not on the spine.** `deriveTheme`'s output carries no `css` field; the renderer and exporters serialise independently. _(ADR-0005; amended by ADR-0017)_

## Domain types

Domain types and constants live in `@tonex/core`; app-only types and constants may live in www. The judgment line is *"would a CLI or future second app care about this type/constant?"* — yes → core, no → app-only. Without the rule, inline `type Mode = 'light' | 'dark'` definitions in feature files become the de facto vocabulary and core's authoritative type becomes one of several.

- **Apply the CLI test.** Anything a CLI or future second app would consume (modes, variants, token names, role names, defaults, runtime tuples) belongs in `@tonex/core`. UI panel state, routing strings, display labels stay in www. _(ADR-0016)_
- **Add to core first; don't inline-and-lift later.** When a needed runtime tuple is missing from core, add it to core, then import. The "I'll lift it later" intention is the precedent the rule blocks. _(ADR-0016)_
- **Both type and runtime value when both are needed.** Iterating modes in UI requires `MODES`, not just the `Mode` union — export the tuple alongside the type. _(ADR-0016)_
- **Use the declared subpaths.** Import from `@tonex/core` or a named subpath; reaching into `@tonex/core/src/...` is refused. The truth-source for available subpaths is `@tonex/core/package.json#exports`. _(ADR-0016)_
- **Drift sentinel: no inline `'light' | 'dark'` unions.** Each hit outside `packages/core/src/theme/mode.ts` is either an `import type { Mode }` or a violation. _(ADR-0016)_

## Variants

Variants are named MCU scheme strategies registered as a `Record<string, VariantStrategy> as const satisfies` map. `VariantStrategy` is a single widened interface, not a discriminated union — the interface carries an optional `secondHct` parameter that only `cmf` reads. The rules below preserve YAGNI on the registry shape until a third two-source variant appears.

- **One file per variant, registered in a barrel.** New variant = one file in `packages/core/src/variants/`, exported from `index.ts`. Model a single-source variant on `tonalSpot.ts`; model a two-source variant on `cmf.ts`. _(ADR-0010)_
- **Single widened interface, not a discriminated union.** Don't split `VariantStrategy` into `SingleSourceVariant | TwoSourceVariant`. The optional `secondHct` is the contract until a third two-source variant earns the split. _(ADR-0010)_
- **`derive.ts` is the only variant-name translator.** camelCase variant names → MCU's SCREAMING_SNAKE convention happens at one site via the strategy's `mcuVariant` field. Don't sprinkle conversions elsewhere. _(ADR-0010)_
- **Engine accepts what source says; UI disables invalid combos.** Don't emit runtime warnings for invalid interaction states (e.g. tertiary palette override under `variant === 'cmf'`); prevent the invalid input up-front in UI. _(ADR-0010)_
- **`cmfSecondSourceHex` is a flat field on `PortableTheme`.** Two-source data threads through `derive.ts` into `cmf.build`; every other variant call passes through with `secondHct` unset. _(ADR-0010; per ADR-0006)_

## Source store + lock

The source-of-truth store is one zustand store with a flat top-level shape; categorisation lives in field-name prefixes (`md3*`, `shadcn*`, `surface*`, `cmf*`), not in nested slices. Lock is a boolean source-input gate that early-returns mutation pathways; it is not a derived-side snapshot. The rules below keep the input side from fragmenting (the mirror of ADR-0005 on the output side) and keep the lock orthogonal to override.

- **One flat zustand store, no slices.** New state = flat field with a prefixed name; don't propose `createXSlice`, sub-stores, or `useXStore` even for orthogonal concerns. The exception bar is a real lifecycle boundary (e.g. ephemeral state that must not be persisted). _(ADR-0006)_
- **Categorisation via prefix, not nested structure.** Prefix is the taxonomy; the shape stays flat. Mode-keyed `{ light, dark }` records are *values*, not slices. _(ADR-0006)_
- **Actions are bundled under a single `actions` key.** Stable identity, single import target. Runtime-only fields (`_hydrated`, `actions`) are stripped from the persisted shape via `selectPortable`. _(ADR-0006)_
- **Lock is a boolean input gate.** Every seed-mutation pathway (`setSeedHex`, `setSeedHue`, `setSeedChroma`, `setSeedTone`, image-extraction picker) early-returns when `seedHexLock === true`. Centralisation is load-bearing — a forgotten gate leaks the lock. _(ADR-0007)_
- **Lock ≠ snapshot.** Don't store rendered values; the gate blocks input writes and the locked seed stays at its lock-time value because those writes are blocked. _(ADR-0007)_
- **Future "lock another input" → new boolean field.** Don't reach for a struct (`lockedSnapshot`) or a per-token map. A narrower lock surface yields fewer surprises. _(ADR-0007)_
- **Reset bypasses the gate.** `reset()` restores `DEFAULT_INPUTS`; locking does not survive reset. _(ADR-0007)_
- **Disable invalid states up-front in UI.** Lock-aware setters and the lock toggle both consume the same boolean source-of-truth; don't allow the action and emit a runtime warning. _(ADR-0007)_

## Seed

`PortableTheme.seed` is a canonical HCT record with an optional `exactHex` slot — `{ hue, chroma, tone, exactHex? }`. HCT is the source of truth; `exactHex` preserves the user's exact bytes when seed-write came through a hex-input path. The rules below keep slider state honest in the low-chroma regime, where `hexFromHct → hctFromHex` is not an identity and rotates hue silently.

- **HCT is canonical; `exactHex` is optional preserve.** Persist `seed: { hue, chroma, tone, exactHex? }`. Don't reintroduce a top-level `seedHex` field. _(ADR-0028 c.1)_
- **Slider setters clear `exactHex`.** `setSeedHue`, `setSeedChroma`, `setSeedTone` write the HCT axis directly and drop `exactHex` — the user is manipulating HCT space now, so the prior pasted hex is no longer live intent. _(ADR-0028)_
- **Hex-input setters write both.** Paste, native picker, and image extraction write `seed = { ...hctFromHex(hex), exactHex: hex }`. _(ADR-0028)_
- **`seedHex` is a derived selector.** `s.seed.exactHex ?? hexFromHct(s.seed)`. Read sites needing hex call the selector; read sites needing HCT read the canonical fields directly. No `hctFromHex(s.seedHex)` in product code. _(ADR-0028)_
- **No dual canonical with `lastTouched`.** Storing both `seedHex` and `seedHct` plus a discriminator was rejected; `exactHex?` is the single-direction lean. _(ADR-0028)_
- **`seedHexLock` gates the canonical seed.** The lock applies identically to HCT-axis setters, hex-input setters, image extraction, and any future seed source — ADR-0007's centralisation rule unchanged. _(ADR-0028 c.2)_

## Schema / PortableTheme

`PortableTheme` is the wire shape — what gets serialised to localStorage, files, or the network. A runtime schema (valibot) validates rehydrated state; setters and the schema share field-level predicates so write-time and read-time validation cannot disagree. The rules below pin the responsibility split between migration (cross-version shape lift) and schema (current-shape contract).

- **Adding a field to `PortableTheme` extends `PortableThemeSchema`, defaults, and the round-trip fixture.** Forgetting won't corrupt rehydrate (extras are accepted; missing fields fall back to `DEFAULT_INPUTS`) but the new field's shape goes unvalidated. _(ADR-0009)_
- **valibot, not zod.** `@tonex/core` publishes to npm; the bundle delta over zod's surface isn't worth lingua-franca familiarity. _(ADR-0009 c.1)_
- **Schema validates the current shape; migrate lifts across versions.** Two responsibilities, two pieces of code. Don't fold version handling into the schema. _(ADR-0009)_
- **Validation runs post-rehydrate inside `onRehydrateStorage`.** Migrate runs first (lifts to current version); schema validates the result. Schema does not see `Partial<>` shapes. _(ADR-0009 c.3)_
- **Field-level predicates are shared.** A new constraint adds a `v.check` refinement to the schema, and the setter calls into the same predicate. Setter-side and schema-side don't get to disagree about "valid." _(ADR-0009 c.5)_
- **Recovery is all-or-nothing reset.** On parse failure the rehydrate handler calls `state.actions.reset()` and then flips `_hydrated`. No per-field fallback. _(ADR-0009 c.4)_
- **Schema is the truth-source for allowed-value tuples.** Docs and UI reference const tuples (`VARIANT_NAMES`, `SURFACE_ALGOS`, `NEUTRAL_PALETTE_NAMES`, …); restating the values is the drift class. _(ADR-0009)_

## Hydration

SSR/SSG renders before zustand-persist has loaded persisted state and before next-themes has resolved the active mode. Two independent flags guard the two failure modes: `_hydrated` on the source store, and `useActiveMode` over next-themes. The rules below keep the guards AND-ed and the flags un-persisted; either bypass is a defect class.

- **`_hydrated: boolean` lives on the source store, initially `false`.** Never persisted — stripped by `selectPortable`; explicitly excluded from the partialize blacklist. _(ADR-0015 c.1)_
- **Flip via `actions.setHydrated()`, never raw `set({ _hydrated: true })`.** The action-only convention keeps the partialize blacklist as the single truth-source for the persisted shape. _(ADR-0015 c.2)_
- **Derived consumers route through `useResolvedTokens`.** Returns `null` pre-hydrate; components render placeholders. Direct source-state reads (`useSource(s => s.someSourceField)`) are fine — what cannot bypass the guard is the *derived* output. _(ADR-0015 c.3)_
- **`applyDom` no-ops pre-hydrate.** The renderer has its own gate so non-React callers don't paint a stale theme. _(ADR-0015 c.3)_
- **`useActiveMode` is the only consumer of resolved theme mode.** Components reading `'light' | 'dark'` go through `useActiveMode`; event handlers that need to set the mode use `useSetMode`. Don't call `useTheme()` directly. _(ADR-0015 c.4; Amendment 2026-05-09)_
- **`next-themes` import allowlist.** Only files inside `features/theme-mode/` import from `next-themes`; the drift sentinel in `.claude/settings.json` rule #5 enforces. _(ADR-0015; Amendment 2026-05-09)_
- **Drift sentinel: raw `_hydrated` reads.** Outside the source store and `useResolvedTokens`, a raw `_hydrated` read is a bypass candidate. _(ADR-0015)_
- **"Remove the null check, it's annoying" → refuse.** The annoyance is the guard working; render proper placeholders instead. _(ADR-0015)_

## Layer architecture

`applyDom` emits four class-scoped blocks per layer: `.md` (light), `html.dark .md`, `.shadcn` (light), `html.dark .shadcn`. Both layers are class-scoped — no `:root` shortcut. Mode is owned by `next-themes` on `<html class="dark">`; switching mode flips the cascade, not the derivation. The rules below preserve symmetric scoping so md and shadcn can coexist without leaking into each other's namespaces.

- **Both layers class-scoped, no `:root`.** Symmetry is non-negotiable. Reject "one layer at `:root` and the other in a class." _(ADR-0013 c.3)_
- **Single `<style id="tonex-tokens">` in `<head>`.** Appended once after `globals.css` so the cascade wins; updates replace `textContent`. _(ADR-0013 c.5)_
- **Body class is `md`; shadcn is a class-scoped subregion.** Set `<body class="md">` in the root layout; wrap shadcn-targeted regions in `<div class="shadcn">`. _(ADR-0013 c.1, c.2)_
- **No re-derivation on mode toggle.** `applyDom` emits all four blocks regardless of mode; flipping `<html class="dark">` selects which pair wins via cascade. _(ADR-0013 c.4)_
- **Route groups are organisational, not layer multiplexers.** Reject `(shadcn)/` and `(md)/` route groups that try to multiplex the same URL. _(ADR-0013)_
- **No runtime `<Layer>` context that swaps primitives.** Route-level segmentation (ADR-0019) is the layer mechanism. _(ADR-0013)_
- **No "single layer" framing.** "The app is shadcn" or "the app is md" misses that both scopes coexist day one. _(ADR-0013)_
- **Tailwind v4 bridge lives in `globals.css`, not engine code.** Aliases between md `--color-*` tokens and shadcn classic names belong in the stylesheet; `derive.ts` stays pure. _(ADR-0013)_

## Sinks: renderer and exporters

`deriveTheme` returns `{ md, shadcn, warnings }`. Two consumers eat that output — the runtime renderer that writes CSS variables onto the DOM, and exporter functions that produce strings for human use. The rules below preserve the separation by role (renderer side-effectful and idempotent; exporters pure) and pin the export-pipeline boundaries that keep WYSIWYG visibility holding from preview through paste — colorspace at format-time, DOM-emitted vs data-only fields kept distinct, audience-routed tabs.

- **Renderer is single.** One `applyDom`, called once per source change, idempotent. Don't add a second runtime CSS writer. _(ADR-0008)_
- **Exporters are pure.** Files in `packages/core/src/theme/exporters/` return strings — no DOM access, no side effects. _(ADR-0008)_
- **Bake-time CSS uses `formatCss`, not `applyDom`.** Tools and CLIs never call the renderer. _(ADR-0008)_
- **Clipboard is an app-layer consumer.** Don't bundle DOM/clipboard calls into core exporters; the www app handles the clipboard call. _(ADR-0008)_
- **Adding a new exporter = new file + barrel export.** New format gets a file in `packages/core/src/theme/exporters/`, exported from the barrel. If the format takes options, extend `ExportOptions` in `bundle.ts`. The barrel + options pattern is the registry — no separate typed registry. _(ADR-0008)_
- **`DerivedTheme` token maps hold argb numbers.** Colorspace projection (argb → oklch or hex) is a format-time concern; `format.ts` owns it via `oklchString(argb)` and `hexString(argb)`. `applyDom` writes via `oklchString`; exporters branch on `colorFormat`. _(ADR-0021 c.1)_
- **Layer shape encodes semantics class.** `MdLayer` separates core role tokens (mode-aware, DOM-emitted), chart tokens (mode-aware, DOM-emitted, filter-gated for export), extended role tokens (data-only), and palette tones (mode/contrast-invariant, data-only). `applyDom` iterates only DOM-emitted fields; extended and palette are inspect-UI surfaces consumed via `useResolvedTokens()`. _(ADR-0021 c.3, c.4)_
- **Token-name partitions live as Sets on schema constants.** `MD_CORE_TOKEN_NAMES`, `MD_EXTENDED_TOKEN_NAMES`, `MD_PALETTE_TOKEN_NAMES`, `MD_CHART_TOKEN_NAMES`. Partitions are name-match Sets, not contiguous slices; order in baked CSS is unchanged. _(ADR-0021 c.2)_
- **`ExportOptions` defaults match single-contrast oklch.** `colorFormat: 'oklch'`, every `include*` filter off — the lean export most users actually paste. New options join the same bag in `bundle.ts`. _(ADR-0021 c.6)_
- **`applyDom` always emits the full functional theme.** WYSIWYG-visibility filtering happens at the inspect surface (the dialog's export-string pane), not at the renderer — strict applyDom-respects-toggles would break the editor's own chrome. _(ADR-0021 c.7)_
- **Audience routing by composition.** `<ExportButton tabs={ExportTab[]} />`; the route decides which tabs appear (md routes pass md formats; shadcn routes pass `['shadcn']`). No path-sniffing inside the dialog. _(ADR-0021 c.8)_
- **Contrast variants emit as one class-scoped CSS file.** `buildContrastBundle(source, { includeContrastVariants })` runs the 3× derive when needed; `exportCss(bundle, layer, options)` always takes a bundle (single-contrast wraps as `{ default: theme }`). _(ADR-0021 c.5)_
- **shadcn export uses `:root` + `.dark`, not class scopes.** Users paste-replace shadcn-cli's blocks rather than extending them; md export keeps its class-scoped output. `includeContrastVariants` is md-only — shadcn ignores it. _(ADR-0021 Amendment 2026-05-13)_
- **`includeHeader: boolean` is shadcn-only.** Prepends the Tailwind v4 incantation (`@import "tailwindcss"` + `@custom-variant dark`) for green-field projects. md ignores the flag. _(ADR-0021 Amendment 2026-05-13)_

## Surface treatment

Surface treatment is a post-derive algorithmic transform applied inside `deriveTheme`. It touches the md surface family only — primary/secondary/tertiary stay MCU-derived unconditionally. The rules below preserve the surface/component asymmetry that lets clean chrome coexist with MCU-tinted components without diluting MCU as the engine.

- **Treatment touches surface tokens only.** Component tokens (`primary`, `secondary`, `tertiary` on md; `muted`, `accent`, `border`, `secondary`, `ring`, `input` on shadcn) keep MCU-generated values unconditionally. The chrome/component asymmetry is intentional, not a missing feature. _(ADR-0002; ADR-0018)_
- **Algorithmic, not palette-sourced.** No palette dependency, no `SurfaceProvider` abstraction. Pure free functions transform per-token hex inputs to outputs. _(ADR-0018)_
- **Algorithms are mutually exclusive.** `surfaceAlgo: 'none' | 'tint' | 'desaturate'` selects one — composing tint and desaturate is not a product feature. _(ADR-0018)_
- **Treatment runs after MCU emit, before shadcn binds.** Any shadcn role bound to a treated surface token automatically reflects the treated value. _(ADR-0018)_
- **Default `'none'` is zero-cost.** The drift-guard baseline (`globals.css === formatCss(deriveTheme(DEFAULT_INPUTS))`) stays trivially green because the treatment branch is a no-op at the default. _(ADR-0018)_
- **Levels are per-mode scalars.** `surfaceTintLevel`, `surfaceDesaturateLevel` — `Record<Mode, number>` in `0..1`; zero is the no-op endpoint. _(ADR-0018)_
- **Adding an algorithm = one file + one enum entry + one branch.** New algorithm joins `packages/core/src/theme/surface/`, gets a string in `SURFACE_ALGOS`, and a branch in the treatment dispatch. _(ADR-0018)_
- **Each algorithm declares its token-coverage subset.** A `// why:` block at the code site names which surface tokens the algorithm touches — coverage is per-algorithm, not a uniform family. _(ADR-0018 Amendment 2026-05-05)_
- **The neutral ramp may visibly disagree with itself.** A clean background next to an MCU-neutral muted is the accepted trade-off — the wedge is "clean chrome + MCU-tinted components," not internal ramp coherence. _(ADR-0002)_

## Override layer

The shadcn layer carries two parallel cross-layer fields: `shadcnRoleBindings` (symbolic, fully populated, role → MD token name) and `shadcnRoleOverrides` (literal hex, sparse — an entry's presence means "pinned for this mode"). Bindings explore the MCU pipeline; overrides commit. The rules below keep the two axes separate and mirror the MD layer's `md3TokenOverrides` pattern.

- **Two axes, never conflated.** Don't fold the override into the binding as a `kind: 'hex'` discriminator — bindings stay symbolic, overrides stay literal. Symmetry with `md3TokenOverrides` is what's earning the storage. _(ADR-0026 c.1)_
- **Binding domain stays `MdTokenName`-only.** Palette tones and TW swatches aren't binding kinds; they enter the *override* picker as value sources whose current resolved hex is captured. _(ADR-0026 c.2)_
- **Override storage is per-mode partial map of role → hex.** `shadcnRoleOverrides: { light: {...}, dark: {...} }` with empty default. Mode-keyed because users pin light and dark independently. _(ADR-0026 c.3)_
- **Setter: `setShadcnRoleOverride(mode, role, hex | null)`.** `null` deletes the entry. Hex format validated at the seam via `isValidHex`; malformed throws. _(ADR-0026 c.3)_
- **Resolution precedence: override > binding-resolved md token.** Override-presence beats binding-resolution per (mode, role); hex parses at resolve time. A malformed binding pointer throws — same behavior as today's `bindShadcn`. _(ADR-0026 c.4)_
- **`bindShadcn` takes overrides as a third input.** The resolver consumes md-layer tokens, bindings, and overrides; one new parameter, one new branch — no surgery to the rest of derive. _(ADR-0026 c.5)_
- **Override picker is UI-side; storage is always hex.** The picker may source values from any combobox (md-token, palette-tone, TW swatch, native picker, hex input) but persists a single hex string. Sources that don't resolve to a hex would be a binding feature. _(ADR-0026 c.6)_
- **Reset is two independent operations.** "Reset override" (`setShadcnRoleOverride(mode, role, null)`) clears the override only; "reset binding" re-applies `DEFAULT_SHADCN_ROLE_BINDINGS`. Don't collapse them into one button. _(ADR-0026 c.7)_
- **Two scopes co-exist.** `md3TokenOverrides` pins an md token (propagates through every shadcn role bound to it); `shadcnRoleOverrides` pins one shadcn role only. Same mental model, different surfaces. _(ADR-0026)_

## Chart palette derivation

`PortableTheme.chart` carries chart-palette intent (`scheme: 'categorical' | 'sequential' | 'diverging'`). Derivation produces `--chart-1..N` tokens through scheme-driven generation; overrides apply on top. The rules below preserve the data-viz contract the scheme names commit to.

- **Chart axes nest under `chart.*`.** Don't add flat `chart*` fields on `PortableTheme`. Future axes (count, tones, hueSpread, seedPalette) extend the namespace. _(ADR-0027 c.1)_
- **Chart overrides are terminal and scheme-agnostic.** Don't auto-clear pins on scheme switch — the override is the user's commitment knob, stable across what-if exploration. _(ADR-0027 c.4; mirrors ADR-0026 c.4)_
- **Categorical hue rotation runs in HCT, not HSL.** HCT preserves perceptual uniformity; HSL does not. A categorical-scheme slice that ships HSL hue rotation fails acceptance. _(ADR-0027 c.5)_
- **Contrast-pair coverage extends to chart tokens.** Any chart-derivation slice validates chart-vs-chart and chart-vs-background contrast via the ADR-0025 evaluator. _(ADR-0027 c.5)_
- **Light/dark `chart-N` derive from a shared scheme contract.** A mode toggle must not change which series `chart-N` represents — the semantic ("category A is the same series in either mode") is preserved by construction. _(ADR-0027 c.5)_
- **Override layer is last-mile only.** Never gate algorithmic generation on override state; overrides apply on top of the scheme's derivation. _(ADR-0027 c.5)_

## Color-utils boundary

`@tonex/color-utils` is the workspace package for npm-installed color libraries (culori today, `apca-w3` when APCA ships). It is the only package allowed to take npm dependencies on color libraries; `@tonex/core` and `apps/www` import from it, never directly from culori. The rules below preserve the chokepoint that makes lib migration a single-package change and pins the canonical form against supply-chain drift.

- **`@tonex/color-utils` is the only package that depends on npm color libraries.** Consumers go through it — no direct `import { … } from 'culori'` in `@tonex/core` or `apps/www`. _(ADR-0025 c.1)_
- **Canonical-form rules are tonex commitments, not culori defaults.** 4-decimal L/C, 2-decimal H, trailing-zero strip, chromaless hue snap (`if (C < 1e-4) H = 0`). The firewall makes culori's job math, not formatting. _(ADR-0025 c.3)_
- **Contrast math lives in `@tonex/color-utils`.** `contrastRatio(fgArgb, bgArgb)` and `relativeLuminance(argb)` belong at the boundary, not duplicated in `@tonex/core` or in www. _(ADR-0025 c.5)_
- **`ContrastPair` and `CONTRAST_PAIRS` live in `@tonex/core/schema`.** Each pair carries foreground + background token refs, `layer` (`md` | `shadcn`), `intent` (`text` | `non-text`), and `threshold` (4.5 / 3). Pair definitions are domain — splitting across packages is the duplication this rule retires. _(ADR-0025 c.6, c.7)_
- **`CONTRAST_PAIRS` is closed; modifying it is a code change.** Persisted user-customized pairs are out of scope; the math primitive (`contrastRatio`) is open for ad-hoc UI tools. _(ADR-0025 c.9)_
- **`evaluateThemeContrast` is downstream of `DerivedTheme`, not on the spine.** Don't widen `DerivedTheme` with a `contrast` field; analyses are pure functions over derived values. _(ADR-0025 c.8)_
- **WCAG 2 only, until APCA ships.** No `algorithm` field on `PairResult`, no `contrastAlgorithm` pref in `useUiPrefs`. When APCA lands, `apca-w3` joins `@tonex/color-utils` (same boundary), `PairResult` widens additively, and the pref earns its second consumer per ADR-0023 c.6. _(ADR-0025 c.10)_

## How to extend this doc

Adding a new section follows the shape above:

- **One paragraph of context** per section — name the surface, name the primary ADRs, state what the rules are protecting.
- **Bullet list of rules** — each rule one sentence (two if a "Banned:" or "When X, do Y" clarification earns it), ending with `_(ADR-NNNN)_` or `_(ADR-NNNN c.N)_` citation.
- **Skip the rule** if it's a one-time architectural constraint that doesn't fire at generation time (the Q2 test — see [issue #69](https://github.com/patrick-xin/tonex/issues/69)).
- **Don't restate the why** — rationale is in the ADR. This doc says *what to do*; the citation lets the reader follow back if they need to understand the trade.
