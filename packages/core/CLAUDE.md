> **State:** Living. Edit when a working rule for `packages/core/` is added, refined, or retired.

# `@tonex/core` — working rules

Auto-loaded when you touch `packages/core/`. These are **generation-time rules** — the *what to do* that follows from a decision. The *why* is in the cited ADR (`docs/adr/`); follow the citation only when you need the trade. Importer-side rules (www layout, features) live in `apps/www/CLAUDE.md`.

Scope: the engine, spine, source store, schema, sinks, derivation, seed, variants, surface treatment, override layer, chart palette, and internal token contracts.

## Engine — MCU is the only generator
MCU is fixed; pluralising the engine would force the UI to abstract over engine differences and dilute the live mood-shift demo that is the product wedge.

- **No `ColorEngine` slot.** Don't introduce an abstraction or alternate generator (Radix-as-engine, custom palette algorithms). _(ADR-0001)_
- **"Add Radix" means palette-library only.** A third-party color library joins as a palette source (the `ColorSystem` slot in `CONTEXT.md`), never as an engine swap. _(ADR-0001)_
- **No user-facing engine picker.** Mood-shift via variant is the product surface, not "MCU vs other." _(ADR-0001)_

## Architecture — no facade
Public surface is a hook + a pure derive function + sink functions. Collapsing them under a facade defeats the slot-fill goal and makes derivation untestable without mocking effects.

- **No facade class.** Don't wrap `deriveTheme`, `applyDom`, and exporters behind one `ThemeSystem.apply()` / `.toCSS()` API. The surface stays `useResolvedTokens` + `deriveTheme` + sink functions. _(ADR-0005)_
- **`deriveTheme` is pure.** Zero React imports, zero side effects, zero DOM access. `(source) → output`, testable with real fixtures. _(ADR-0005)_
- **Higher file count is the shape, not a smell.** A "many imports" complaint motivates the facade — refuse it. Callers import the public surface, not the file tree. _(ADR-0005)_
- **CSS serialisation lives in `exporters/*`, not on the spine.** `deriveTheme`'s output carries no `css` field. _(ADR-0005; amended by ADR-0017)_

## Domain types — the CLI test
Domain types/constants live in `@tonex/core`; app-only types live in www. Without the rule, inline `type Mode = 'light' | 'dark'` in feature files becomes the de facto vocabulary and core's authoritative type becomes one of several.

- **Apply the CLI test.** Anything a CLI or future second app would consume (modes, variants, token names, role names, defaults, runtime tuples) belongs in `@tonex/core`. UI panel state, routing strings, display labels stay in www. _(ADR-0016)_
- **Add to core first; don't inline-and-lift later.** Missing runtime tuple → add it to core, then import. "I'll lift it later" is the precedent the rule blocks. _(ADR-0016)_
- **Both type and runtime value when both are needed.** Iterating modes in UI requires `MODES`, not just the `Mode` union — export the tuple alongside the type. _(ADR-0016)_
- **Use the declared subpaths.** Import from `@tonex/core` or a named subpath; reaching into `@tonex/core/src/...` is refused. Truth-source: `@tonex/core/package.json#exports`. _(ADR-0016)_
- **No inline `'light' | 'dark'` unions** outside `packages/core/src/theme/mode.ts` — use `import type { Mode }`. Lint-enforced. _(ADR-0016)_

## Variants — one widened interface
Variants are named MCU scheme strategies in a `Record<string, VariantStrategy> as const satisfies` map. `VariantStrategy` is a single widened interface (optional `secondHct`, read only by `cmf`), not a discriminated union — YAGNI until a third two-source variant appears.

- **One file per variant, registered in a barrel.** New variant = one file in `packages/core/src/variants/`, exported from `index.ts`. Single-source → model on `tonalSpot.ts`; two-source → model on `cmf.ts`. _(ADR-0010)_
- **Single widened interface, not a discriminated union.** Don't split into `SingleSourceVariant | TwoSourceVariant`. The optional `secondHct` is the contract until a third two-source variant earns the split. _(ADR-0010)_
- **`derive.ts` is the only variant-name translator.** camelCase → MCU's SCREAMING_SNAKE happens once via the strategy's `mcuVariant` field. Don't sprinkle conversions. _(ADR-0010)_
- **Engine accepts what source says; UI disables invalid combos.** Don't emit runtime warnings for invalid interaction states; prevent the invalid input up-front in UI. _(ADR-0010)_
- **`cmfSecondSourceHex` is a flat field on `PortableTheme`.** Threads through `derive.ts` into `cmf.build`; other variants pass through with `secondHct` unset. _(ADR-0010; per ADR-0006)_

## Source store + lock — flat store, boolean gate
One zustand store with a flat top-level shape; categorisation is field-name prefixes (`md3*`, `shadcn*`, `surface*`, `cmf*`), not nested slices. Lock is a boolean source-input gate, not a derived-side snapshot.

- **One flat zustand store, no slices.** New state = flat field with a prefixed name; don't propose `createXSlice`, sub-stores, or `useXStore`. Exception bar is a real lifecycle boundary (e.g. ephemeral state that must not persist). _(ADR-0006)_
- **Categorisation via prefix, not nested structure.** Prefix is the taxonomy; shape stays flat. Mode-keyed `{ light, dark }` records are *values*, not slices. _(ADR-0006)_
- **Actions bundled under a single `actions` key.** Stable identity, single import target. Runtime-only fields (`_hydrated`, `actions`) are stripped from the persisted shape via `selectPortable`. _(ADR-0006)_
- **Lock is a boolean input gate.** Every seed-mutation pathway (`setSeedHex`, `setSeedHue`, `setSeedChroma`, `setSeedTone`, image-extraction picker) early-returns when `seedHexLock === true`. A forgotten gate leaks the lock. _(ADR-0007)_
- **Lock ≠ snapshot.** Don't store rendered values; the gate blocks input writes, so the locked seed stays at its lock-time value. _(ADR-0007)_
- **Future "lock another input" → new boolean field.** Don't reach for a struct (`lockedSnapshot`) or per-token map. _(ADR-0007)_
- **Reset bypasses the gate.** `reset()` restores `DEFAULT_INPUTS`; locking does not survive reset. _(ADR-0007)_
- **Disable invalid states up-front in UI.** Lock-aware setters and the lock toggle consume the same boolean source-of-truth; don't allow the action then emit a runtime warning. _(ADR-0007)_

## Seed — canonical HCT, optional exact hex
`PortableTheme.seed` is `{ hue, chroma, tone, exactHex? }`. HCT is the source of truth; `exactHex` preserves the user's exact bytes when seed-write came through a hex path. In the low-chroma regime `hexFromHct → hctFromHex` is not an identity and rotates hue silently.

- **HCT is canonical; `exactHex` is optional preserve.** Persist `seed: { hue, chroma, tone, exactHex? }`. **Don't reintroduce a top-level `seedHex` field.** _(ADR-0028 c.1)_
- **Slider setters clear `exactHex`.** `setSeedHue/Chroma/Tone` write the HCT axis directly and drop `exactHex` — the prior pasted hex is no longer live intent. _(ADR-0028)_
- **Hex-input setters write both.** Paste, native picker, image extraction write `seed = { ...hctFromHex(hex), exactHex: hex }`. _(ADR-0028)_
- **`seedHex` is a derived selector** — `s.seed.exactHex ?? hexFromHct(s.seed)`. No `hctFromHex(s.seedHex)` in product code. _(ADR-0028)_
- **No dual canonical with `lastTouched`.** Storing both `seedHex` and `seedHct` plus a discriminator was rejected; `exactHex?` is the single-direction lean. _(ADR-0028)_
- **`seedHexLock` gates the canonical seed** identically across HCT-axis setters, hex-input setters, image extraction, and any future seed source. _(ADR-0028 c.2)_

## Schema / PortableTheme — wire shape + valibot
`PortableTheme` is the wire shape (localStorage / files / network). A valibot schema validates rehydrated state; setters and schema share field-level predicates so write-time and read-time can't disagree.

- **Adding a field extends `PortableThemeSchema`, defaults, and the round-trip fixture.** Forgetting won't corrupt rehydrate (extras accepted; missing fall back to `DEFAULT_INPUTS`) but the field goes unvalidated. _(ADR-0009)_
- **valibot, not zod.** `@tonex/core` publishes to npm; the bundle delta isn't worth lingua-franca familiarity. _(ADR-0009 c.1)_
- **Schema validates current shape; `migrate` lifts across versions.** Two responsibilities, two pieces of code. _(ADR-0009)_
- **Validation runs post-rehydrate inside `onRehydrateStorage`.** Migrate runs first; schema validates the result, never a `Partial<>`. _(ADR-0009 c.3)_
- **Field-level predicates are shared.** A new constraint adds a `v.check` refinement and the setter calls the same predicate. _(ADR-0009 c.5)_
- **Recovery is all-or-nothing reset.** On parse failure the handler calls `state.actions.reset()` then flips `_hydrated`. No per-field fallback. _(ADR-0009 c.4)_
- **Schema is the truth-source for allowed-value tuples** (`VARIANT_NAMES`, `SURFACE_ALGOS`, `NEUTRAL_PALETTE_NAMES`, …); restating the values is the drift class. _(ADR-0009)_

## Hydration — two AND-ed guards
SSR/SSG renders before zustand-persist loads and before next-themes resolves the mode. Two un-persisted flags guard the two failure modes: `_hydrated` on the source store, `useActiveMode` over next-themes. Either bypass is a defect class.

- **`_hydrated: boolean` on the source store, initially `false`.** Never persisted — stripped by `selectPortable`; explicitly excluded from the partialize blacklist. _(ADR-0015 c.1)_
- **Flip via `actions.setHydrated()`, never raw `set({ _hydrated: true })`.** Keeps the partialize blacklist the single truth-source for the persisted shape. _(ADR-0015 c.2)_
- **Derived consumers route through `useResolvedTokens`** (returns `null` pre-hydrate; render placeholders). Direct *source*-state reads are fine — only *derived* output cannot bypass the guard. _(ADR-0015 c.3)_
- **`applyDom` no-ops pre-hydrate.** The renderer has its own gate so non-React callers don't paint a stale theme. _(ADR-0015 c.3)_
- **`useActiveMode` is the only consumer of resolved theme mode.** Components reading `'light' | 'dark'` go through `useActiveMode`; setters use `useSetMode`. Don't call `useTheme()` directly — lint-enforced allowlist. _(ADR-0015 c.4; Amendment 2026-05-09)_
- **`next-themes` import allowlist.** Only files in `features/theme-mode/` import from `next-themes`. Lint-enforced. _(ADR-0015; Amendment 2026-05-09)_
- **Raw `_hydrated` reads** outside the source store and `useResolvedTokens` are bypass candidates. _(ADR-0015)_
- **"Remove the null check, it's annoying" → refuse.** The annoyance is the guard working; render proper placeholders. _(ADR-0015)_

## Layer architecture — four class-scoped blocks
`applyDom` emits four class-scoped blocks per layer: `.md`, `html.dark .md`, `.shadcn`, `html.dark .shadcn`. No `:root` shortcut. Mode is owned by next-themes on `<html class="dark">`; switching mode flips the cascade, not the derivation.

- **Both layers class-scoped, no `:root`.** Symmetry is non-negotiable. Reject "one layer at `:root`, the other in a class." _(ADR-0013 c.3)_
- **Single `<style id="tonex-tokens">` in `<head>`,** appended once after `globals.css` so the cascade wins; updates replace `textContent`. _(ADR-0013 c.5)_
- **Body class is `md`; shadcn is a class-scoped subregion.** `<body class="md">` in the root layout; wrap shadcn regions in `<div class="shadcn">`. _(ADR-0013 c.1, c.2)_
- **No re-derivation on mode toggle.** All four blocks emit regardless of mode; flipping `<html class="dark">` selects the winning pair. _(ADR-0013 c.4)_
- **Route groups are organisational, not layer multiplexers.** Reject `(shadcn)/` / `(md)/` groups multiplexing the same URL. _(ADR-0013)_
- **No runtime `<Layer>` context that swaps primitives.** Route-level segmentation (ADR-0019) is the layer mechanism. _(ADR-0013)_
- **No "single layer" framing.** Both scopes coexist day one. _(ADR-0013)_
- **Tailwind v4 bridge lives in `globals.css`, not engine code.** `derive.ts` stays pure. _(ADR-0013)_

## Sinks — renderer + exporters
`deriveTheme` returns `{ md, shadcn, warnings }`. The runtime renderer writes CSS vars onto the DOM (side-effectful, idempotent); exporters produce strings (pure). Colorspace projection is a format-time concern.

- **Renderer is single.** One `applyDom`, called once per source change, idempotent. No second runtime CSS writer. _(ADR-0008)_
- **Exporters are pure.** Files in `exporters/` return strings — no DOM, no side effects. _(ADR-0008)_
- **Bake-time CSS uses `formatCss`, not `applyDom`.** Tools and CLIs never call the renderer. _(ADR-0008)_
- **Clipboard is an app-layer consumer.** Don't bundle DOM/clipboard into core exporters. _(ADR-0008)_
- **New exporter = new file + barrel export.** Options extend `ExportOptions` in `bundle.ts`. The barrel + options pattern is the registry — no separate typed registry. _(ADR-0008)_
- **`DerivedTheme` token maps hold argb numbers.** Projection (argb → oklch/hex) is format-time; `format.ts` owns it via `oklchString(argb)` / `hexString(argb)`. `applyDom` writes via `oklchString`; exporters branch on `colorFormat`. _(ADR-0021 c.1)_
- **Layer shape encodes semantics class.** `MdLayer` separates core role tokens (mode-aware, DOM-emitted), chart tokens (mode-aware, DOM-emitted, filter-gated for export), extended role tokens (data-only), palette tones (mode/contrast-invariant, data-only). `applyDom` iterates only DOM-emitted fields. _(ADR-0021 c.3, c.4)_
- **Token-name partitions live as Sets on schema constants** (`MD_CORE_TOKEN_NAMES`, `MD_EXTENDED_TOKEN_NAMES`, `MD_PALETTE_TOKEN_NAMES`, `MD_CHART_TOKEN_NAMES`) — name-match Sets, not contiguous slices; baked-CSS order unchanged. _(ADR-0021 c.2)_
- **`ExportOptions` defaults match single-contrast oklch** (`colorFormat: 'oklch'`, every `include*` off) — the lean export most users paste. _(ADR-0021 c.6)_
- **`applyDom` always emits the full functional theme.** WYSIWYG-visibility filtering happens at the inspect surface, not the renderer. _(ADR-0021 c.7)_
- **Audience routing by composition.** `<ExportButton tabs={ExportTab[]} />`; the route decides which tabs appear. No path-sniffing inside the dialog. _(ADR-0021 c.8)_
- **Contrast variants emit as one class-scoped CSS file.** `buildContrastBundle(source, { includeContrastVariants })` runs the 3× derive when needed; `exportCss(bundle, layer, options)` always takes a bundle. _(ADR-0021 c.5)_
- **shadcn export uses `:root` + `.dark`, not class scopes** (users paste-replace shadcn-cli blocks); md export keeps class-scoped output. `includeContrastVariants` is md-only. _(ADR-0021 Amendment 2026-05-13)_
- **`includeHeader: boolean` is shadcn-only** — prepends the Tailwind v4 incantation for green-field projects; md ignores it. _(ADR-0021 Amendment 2026-05-13)_

## Surface treatment — chrome only
A post-derive algorithmic transform inside `deriveTheme`, touching the md surface family only; primary/secondary/tertiary stay MCU-derived unconditionally.

- **Treatment touches surface tokens only.** Component tokens (md `primary/secondary/tertiary`; shadcn `muted/accent/border/secondary/ring/input`) keep MCU values unconditionally. The asymmetry is intentional. _(ADR-0002; ADR-0018)_
- **Algorithmic, not palette-sourced.** No palette dependency, no `SurfaceProvider`. Pure free functions, per-token hex in → out. _(ADR-0018)_
- **Algorithms are mutually exclusive.** `surfaceAlgo: 'none' | 'tint' | 'desaturate'` selects one — composing them is not a feature. _(ADR-0018)_
- **Treatment runs after MCU emit, before shadcn binds.** Any shadcn role bound to a treated surface reflects the treated value. _(ADR-0018)_
- **Default `'none'` is zero-cost.** Keeps the drift-guard baseline (`globals.css === formatCss(deriveTheme(DEFAULT_INPUTS))`) trivially green. _(ADR-0018)_
- **Levels are per-mode scalars.** `surfaceTintLevel`, `surfaceDesaturateLevel` — `Record<Mode, number>` in `0..1`; zero is the no-op. _(ADR-0018)_
- **Adding an algorithm = one file + one enum entry + one branch** in `surface/`, with a string in `SURFACE_ALGOS`. _(ADR-0018)_
- **Each algorithm declares its token-coverage subset** via a `// why:` block naming which surface tokens it touches. _(ADR-0018 Amendment 2026-05-05)_
- **The neutral ramp may visibly disagree with itself.** Clean background next to an MCU-neutral muted is the accepted trade-off — the wedge is "clean chrome + MCU-tinted components." _(ADR-0002)_

## Override layer — bindings vs overrides
The shadcn layer carries two parallel cross-layer fields: `shadcnRoleBindings` (symbolic, fully populated, role → MD token) and `shadcnRoleOverrides` (literal hex, sparse — presence = "pinned for this mode"). Bindings explore; overrides commit.

- **Two axes, never conflated.** Don't fold override into binding as a `kind: 'hex'` discriminator — bindings stay symbolic, overrides literal. _(ADR-0026 c.1)_
- **Binding domain stays `MdTokenName`-only.** Palette tones and TW swatches enter the *override* picker as value sources, not binding kinds. _(ADR-0026 c.2)_
- **Override storage is per-mode partial map of role → hex.** `shadcnRoleOverrides: { light: {...}, dark: {...} }`, empty default. _(ADR-0026 c.3)_
- **Setter: `setShadcnRoleOverride(mode, role, hex | null)`.** `null` deletes; hex validated via `isValidHex`, malformed throws. _(ADR-0026 c.3)_
- **Resolution precedence: override > binding-resolved md token,** per (mode, role); a malformed binding pointer throws (same as `bindShadcn`). _(ADR-0026 c.4)_
- **`bindShadcn` takes overrides as a third input** — one new parameter, one new branch. _(ADR-0026 c.5)_
- **Override picker is UI-side; storage is always hex.** May source from any combobox but persists one hex string. _(ADR-0026 c.6)_
- **Reset is two independent operations** — "reset override" clears the override; "reset binding" re-applies `DEFAULT_SHADCN_ROLE_BINDINGS`. Don't collapse. _(ADR-0026 c.7)_
- **Two scopes co-exist.** `md3TokenOverrides` pins an md token (propagates to every bound shadcn role); `shadcnRoleOverrides` pins one shadcn role. _(ADR-0026)_

## Chart palette derivation
`PortableTheme.chart` carries chart intent (`scheme: 'categorical' | 'sequential' | 'diverging'`); derivation produces `--chart-1..N`, overrides apply on top.

- **Chart axes nest under `chart.*`.** Don't add flat `chart*` fields. Future axes (count, tones, hueSpread, seedPalette) extend the namespace. _(ADR-0027 c.1)_
- **Chart overrides are terminal and scheme-agnostic.** Don't auto-clear pins on scheme switch. _(ADR-0027 c.4; mirrors ADR-0026 c.4)_
- **Categorical hue rotation runs in HCT, not HSL.** HSL breaks perceptual uniformity — an HSL-rotation slice fails acceptance. _(ADR-0027 c.5)_
- **Contrast-pair coverage extends to chart tokens** (chart-vs-chart and chart-vs-background via the ADR-0025 evaluator). _(ADR-0027 c.5)_
- **Light/dark `chart-N` derive from a shared scheme contract** — a mode toggle must not change which series `chart-N` represents. _(ADR-0027 c.5)_
- **Override layer is last-mile only.** Never gate algorithmic generation on override state. _(ADR-0027 c.5)_

## Color-utils boundary — the culori firewall
`@tonex/color-utils` is the only package allowed to take npm dependencies on color libraries (culori today, `apca-w3` when APCA ships). `@tonex/core` and `apps/www` go through it. The chokepoint makes lib migration a single-package change and pins the canonical form against supply-chain drift.

- **`@tonex/color-utils` is the only package depending on npm color libs.** No direct `import { … } from 'culori'` in `@tonex/core` or `apps/www`. Lint-enforced. _(ADR-0025 c.1)_
- **Canonical-form rules are tonex commitments, not culori defaults** — 4-decimal L/C, 2-decimal H, trailing-zero strip, chromaless hue snap (`if (C < 1e-4) H = 0`). _(ADR-0025 c.3)_
- **Contrast math lives in `@tonex/color-utils`** — `contrastRatio(fgArgb, bgArgb)`, `relativeLuminance(argb)`. Not duplicated in core or www. _(ADR-0025 c.5)_
- **`ContrastPair` and `CONTRAST_PAIRS` live in `@tonex/core/schema`** — each pair carries fg + bg token refs, `layer`, `intent`, `threshold` (4.5 / 3). _(ADR-0025 c.6, c.7)_
- **`CONTRAST_PAIRS` is closed; modifying it is a code change.** The math primitive (`contrastRatio`) is open for ad-hoc UI tools. _(ADR-0025 c.9)_
- **`evaluateThemeContrast` is downstream of `DerivedTheme`, not on the spine.** Don't widen `DerivedTheme` with a `contrast` field. _(ADR-0025 c.8)_
- **WCAG 2 only, until APCA ships.** No `algorithm` field on `PairResult`, no `contrastAlgorithm` pref. APCA later: `apca-w3` joins the same boundary, `PairResult` widens additively. _(ADR-0025 c.10)_

## Adding a section to this file
- **One why-line** per section — name the surface and what the rules protect.
- **Bullet rules** — each one sentence (two if a "Banned:" / "When X, do Y" clarification earns it), ending with `_(ADR-NNNN)_` or `_(ADR-NNNN c.N)_`.
- **Skip one-time architectural constraints** that don't fire at generation time.
- **Don't restate the why** — rationale is in the ADR; the citation lets the reader follow back.
