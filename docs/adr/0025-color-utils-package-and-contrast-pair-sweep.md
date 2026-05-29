> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# `@tonex/color-utils` — workspace boundary and contrast pair sweep

The contrast-checking feature surfaced two coupled decisions. First: where does color math beyond MCU's spec live? Today it is split — `oklch.ts` (180 lines, hand-rolled OKLab matrices) inside `@tonex/core`, contrast utilities (`relativeLuminance`, `contrastRatio`, an 18-pair MD list) duplicated in `apps/www/src/features/color-roles-list/contrast-utils.ts`. Second: when contrast checking expands to shadcn pairs, ships an app-level pre-flight, and may eventually grow APCA — every one of those features wants utilities (deltaE, gamut mapping, perceptual contrast) that compound poorly when hand-rolled. The decisions interact: the home for color math is the home where contrast checking grows.

ADR-0012 settled the same boundary question for MCU by vendoring at a workspace package (`packages/mcu/`) with three reasons: arm's-length isolation, spec-version pinning, strict-mode containment. That pattern fits MCU because MCU is a spec implementation, was unreleased on npm at the time, and its source files do not pass tonex's strict TS. None of those conditions apply to general-purpose color libraries (culori, colorjs.io, apca-w3): they are released, semver-versioned, well-typed. Vendoring would forfeit those properties; ad-hoc npm dependencies in `@tonex/core` would forfeit the first two ADR-0012 reasons.

**Decision:** ten commitments, organized from boundary to evaluation.

## 1. `@tonex/color-utils` is the workspace boundary for color libraries

A new workspace package, `packages/color-utils/`, exposed as `@tonex/color-utils`. It is the **only package in the workspace allowed to take npm dependencies on color libraries** — culori today, `apca-w3` when APCA ships, deltaE / gamut / interpolation libs in any subsequent slice. Consumers (`@tonex/core`, `apps/www`) import from `@tonex/color-utils`; they never `import { ... } from 'culori'` directly. Adding a new lib is a single-package change. Migrating off one is a single-package change.

This formalizes ADR-0012's "arm's length" rule for the npm-installed lib class. ADR-0012's vendoring stays the right shape for MCU (unreleased spec, strict-mode incompatibility); the workspace re-export package is the lighter analog for maintained npm libraries.

**Why:** the alternatives — direct `culori` deps in `@tonex/core` and consumers — exposes the lib's full surface (~100 functions including parsers, naming tables, gamut mappers we don't use), creates ~80 import sites that would need rewriting on a future lib migration, and provides no chokepoint for spec-version pinning. The workspace package is the chokepoint.

## 2. culori is the initial dependency

The first occupant of `@tonex/color-utils` is culori. Selected over colorjs.io, chroma-js, color2k because culori is tree-shakable, oklch-native, MIT-licensed, and well-typed without strict-mode gaps.

culori does not ship APCA. When APCA lands as a feature (commitment 10), `apca-w3` joins culori inside `@tonex/color-utils`. The boundary is unchanged.

**Why:** the alternative was hand-rolling continued color math in `@tonex/core/theme/oklch.ts`. That worked for the in-gamut sRGB↔OKLCH path but compounds against future features (deltaE, gamut mapping, P3, perceptual contrast). Battle-tested implementations that pass spec tests across the ecosystem outperform per-function in-tree implementations on error rate, especially for math whose precision is load-bearing for our drift-guard.

## 3. Firewall canonicalization — tonex owns the string form

`@tonex/color-utils` exports `oklchString(argb)`, `hexString(argb)`, `relativeLuminance(argb)`, `argbComponents(argb)`, and the hex/oklch round-trip helpers — same surface as today's `@tonex/core/theme/oklch.ts`. Internally these wrap culori's primitives with a tonex-owned canonicalization layer:

- L/C precision: 4 decimals (matches shadcn v4 / tailwind v4 conventions)
- H precision: 2 decimals
- Trailing-zero stripping (defends against biome's CSS formatter, which would otherwise break the drift-guard test)
- Chromaless hue snap (`if (C < 1e-4) H = 0` — defends against float noise on near-neutral surfaces)

These rules are tonex commitments, not culori commitments. They are NOT delegated to culori's `formatCss` defaults.

**Why:** ADR-0017's drift-guard discipline pins emission strings byte-exact. If a culori minor version changed its `formatCss` precision, every tonex `globals.css` would shift silently across versions — a supply-chain WYSIWYG hazard even when underlying math is identical. The firewall makes culori's job math, not formatting; tonex owns formatting in tonex's source tree, with `// why:` lines pointing at this ADR.

## 4. Migration: thin re-export, drift-guard byte-identical

`packages/core/src/theme/oklch.ts` collapses to a thin re-export from `@tonex/color-utils` (or is deleted entirely with `@tonex/core/oklch` subpath shifted to re-export). The OKLab matrix constants, `srgbToLinear`, `linearToSrgb` migrate into culori's call-site implementation. The canonical-form rules (commitment 3) move into `packages/color-utils/src/oklch.ts`.

`globals.css` stays byte-identical post-migration. The drift-guard test continues to pass without rebake. If parity fails on any sample input, the canonicalization layer is the fix point — not `globals.css`.

**Why:** Shape A (rebake-and-accept) was rejected because it sets a precedent that every future culori upgrade is a potential rebake event. Shape C (parallel verification phase) was rejected as ceremony for a 180-line file replacement with full test coverage. Shape B (firewall + byte-identical migration) keeps the canonical form a tonex commitment in perpetuity.

## 5. Contrast math lives in `@tonex/color-utils`, not `@tonex/core`

`contrastRatio(fgArgb: number, bgArgb: number): number` ships from `@tonex/color-utils`. Backed by culori's `wcagContrast` (or a one-line implementation over `relativeLuminance` if the wrapper cost is lower). The previously-duplicated `relativeLuminance` and `contrastRatio` in www retire; UI files keep only UI-only helpers.

**Why:** contrast is color math. Color math lives at the boundary (commitment 1). Allowing contrast math to drift into `@tonex/core` or `apps/www` reproduces the duplication this ADR retires.

## 6. Pair definitions live in `@tonex/core/schema`, layer-tagged, intent-tagged

`ContrastPair` and `CONTRAST_PAIRS` are exported from `@tonex/core/schema`. Each pair carries foreground + background token references, the layer (`md` or `shadcn`), intent (`text` or `non-text`), and threshold (4.5 for text, 3 for non-text). The list ships closed with text pairs at threshold 4.5: md pairs cover every `on-X / X` pair, surface-on-variant against surface, inverse trio, and fixed family; shadcn pairs cover the `-foreground` / unsuffixed root convention across the shadcn role surface.

Adding a pair is a one-row schema edit. Removing one breaks any test asserting count.

`--destructive` does not gain a shadcn pair; destructive's contrast partner is bound through `--color-on-error` at the underlying md level, already covered by the md `on-error / error` pair.

**Why:** the pairs encode M3 spec semantics (`on-X` always pairs with `X`) and shadcn role-pair conventions (`-foreground` always pairs with the unsuffixed root). Both are domain knowledge per `apps/www/CLAUDE.md` (types live in `@tonex/core`). Allowing pair definitions to live in www would split domain across packages.

## 7. Pair shape bakes `intent` and `threshold` from day one

Slice 1 ships only `intent: 'text'` pairs at `threshold: 4.5`. Non-text pairs (`outline`, `border`, `input`, `ring`, `sidebar-border`, `sidebar-ring` against their backgrounds) at `threshold: 3` ship in slice contrast-3 with sectioned UI; the schema does not migrate.

**Why:** ADR-0023 commitment 6's scope-creep guard is about prefs, not domain shape. Two fields on `ContrastPair` cost nothing pref-shaped while removing reshape work from the next slice. Pre-baking shape for known-shape extensions is the cheap form of forward compatibility.

## 8. `evaluateThemeContrast` is downstream of `DerivedTheme`, not on the spine

`evaluateThemeContrast(theme: DerivedTheme): ContrastReport` is the analysis primitive — it returns per-pair results (ratio, pass/fail) keyed by mode. The shape lives in the contrast module; consumers read it directly.

`DerivedTheme` itself is unchanged — no `contrast` field, no widening. The spine continues to produce token values; analyses are pure functions over those values. Per-token UI consumers and app-level sweep consumers read from the same report; consistency is by construction.

Memoization layers via the existing derive cache pattern (issue #20): a sibling cache slot keyed by source identity returns the same report reference for repeated calls.

**Why:** ADR-0017's lean-spine principle. Adding `contrast` to `DerivedTheme` would set a precedent that any analysis (deltaE, gamut, future APCA) earns a spine slot, bloating the seam every consumer must handle. Keeping analyses downstream means each is a separate import; consumers that don't need contrast don't pay for it.

## 9. Built-in list closed; math primitive open

`CONTRAST_PAIRS` is a closed const tuple — modifying it requires schema edits. Persisted user-customized pairs (a `customContrastPairs` field on `PortableTheme`) are explicitly out of scope; that decision opens a separate ADR if ever proposed.

`contrastRatio(fg, bg)` is open by construction — any two argb inputs. Future ad-hoc UI tools (a "contrast inspector" letting users query arbitrary pair contrast) are pure UI work on top of the existing primitive — no schema or core changes required.

**Why:** persisted custom pairs would force a per-user data shape with no spec to back it. Built-in pairs encode M3 + shadcn spec semantics, which give them a non-arbitrary shape. The math primitive's openness covers all the legitimate "I want to check pair X" use cases without committing to persistence.

## 10. APCA deferred; `contrastAlgorithm` pref deferred

This slice ships WCAG 2 only. No `algorithm` field on `PairResult` or `evaluateThemeContrast`. No `contrastAlgorithm` pref in `useUiPrefs` (ADR-0023 commitment 1's anticipated example field stays anticipated, not shipped).

When APCA lands:
- `apca-w3` enters `@tonex/color-utils` (commitment 1 — same boundary)
- `apcaContrast(fgArgb, bgArgb): number` exports from color-utils as a sibling primitive (different return semantics — Lc value, not ratio — so the name is honest)
- `PairResult` widens additively with `algorithm` and a `value: number` field (covering both ratio and Lc semantics)
- `contrastAlgorithm: 'wcag2' | 'apca-w3'` enters `useUiPrefs` at the moment of the second consumer per ADR-0023 commitment 6, likely simultaneously with the APCA UI surface

**Why:** four reasons. (a) culori does not ship APCA, so committing to APCA is committing to a second lib decision tree we have not walked. (b) APCA's user-facing model is unstable — Lc thresholds depend on font weight/size, the recommended cutoffs have shifted twice since 2022, and tonex is a generation tool, not a compliance auditor. (c) WCAG 2 is the lingua franca: shadcn docs, M3 docs, accessibility blogs all talk in 4.5:1; matching that mental model lowers cognitive friction. (d) ADR-0023 commitment 6's second-consumer guard rejects the pref outright until a second surface materializes.

## Consequences

- `apps/www/src/features/color-roles-list/contrast-utils.ts` shrinks to UI helpers (`isDarkSwatch`, `roleDisplayName`); `relativeLuminance`, `contrastRatio`, `ROLE_CONTRAST_PAIRS`, `AA_THRESHOLD` retire. Consumers (`color-roles-list.tsx`, `role-editor.tsx`) read from `evaluateThemeContrast`.
- `@tonex/core/oklch` subpath stays as a public import path but re-exports from `@tonex/color-utils` (or shifts entirely; consumer-side import path may move). Subpath stability is a www-side concern; `docs/agents/core-surface.md` updates with the migration.
- The `ContrastPair` type's `MdTokenName | ShadcnRoleName` union is the first place outside `derive.ts` that crosses the md/shadcn name surfaces. If a future schema change widens those name spaces (chart token contrast, custom-color contrast), the pair union widens too.
- Drift-guard tests continue to pass byte-identical post-migration. The canonical-form pinning test in the color-utils package becomes the upstream-monitoring contract.
- ADR-0023 commitment 1's anticipated `contrastAlgorithm` and `showContrastWarnings` fields stay anticipated; ADR-0023 needs no amendment until APCA actually ships and an algorithm pref earns its second consumer.
- The cmf-vs-2025 spec memo's caveat (cmf primary tracks seed luminance; can fail against `--color-surface` in light mode) gains live shadcn-side coverage: `--primary-foreground / --primary` against a cmf-derived primary now surfaces the WCAG warning the memo warned about, instead of relying on the user noticing it visually.
- `packages/color-utils/` is auto-discovered by the existing `packages/*` glob in `pnpm-workspace.yaml` — no manual workspace entry required. `packages/color-utils/package.json` declares culori as a direct dep, exposes a single barrel, and inherits the strict tsconfig (per ADR-0012's third reason — strict-mode relax stays scoped to vendored packages, never to npm-dep packages).

## Amendment — 2026-05-17

Issue #47 surfaced three coverage gaps in slice contrast-3's non-text catalogue that the original body's "closed list" wording (commitment 7) implied were intentional but were actually scope omissions visible only once the contrast-checker table grouped pairs by family:

1. **`--input` / `--ring` on `--background`.** Body's commitment 7 lists `input` and `ring` against "their backgrounds" but the slice contrast-3 implementation chose `--card` only, with the rationale that form fields live in cards. They also render directly on `--background` (toolbar / header / standalone forms). The Surface family in the audit table had only `--border` as its non-text member, which made the gap obvious. Both `--card` AND `--background` partners are now pinned (the card pair is still correct; the background pair is additive).
2. **`--destructive` non-text pairs.** The body's commitment 6 dismissed `--destructive` as "covered by md `on-error / error`" — but that covers the TEXT case only (text on the error fill). `--destructive` used as a non-text UI element (icon-only destructive button, outline-style destructive border) against neutral surfaces is a separate WCAG 1.4.11 concern. Added `--destructive` against `--background` and `--card`. Text-pair exclusion (commitment 6) stands; the test pinning shadcn text pairs at 10 still holds.
3. **md outline against the surface-container ladder.** Body's commitment 7 listed outline + outline-variant against `--color-surface` only. Outlines also render inside every container variant (`--color-surface-container{,-lowest,-low,-high,-highest}`), and a dim outline that passes 3:1 on the base surface can fail on a high-tone container. Expanded outline + outline-variant coverage from 2 pairs to 12 (2 fg × 6 surface bgs).

Total: `CONTRAST_PAIRS` grows from 55 to 69 (14 new non-text pairs). Layer/intent splits update accordingly (md: 20→30; shadcn: 15→19; non-text: 27→41). Test count assertions in `packages/core/src/theme/contrast/contrast.test.ts` update in lockstep; no schema migration (`SCHEMA_VERSION` unchanged) because `CONTRAST_PAIRS` is a const tuple, not persisted state.

The grouping family declarations in `apps/www/src/features/contrast-checker/grouping.ts` did not need changes — shadcn pairs group by `pair.bg`, so the new `--input/--background`, `--ring/--background`, and `--destructive/--background` rows route into the existing `Surface` family; `--destructive/--card` routes into `Card`. The vestigial `Destructive` family entry stays empty (forward-looking — would only populate if a future pair used `--destructive` as background, which is not a standard rendering pattern).

Commitment 7's "Closed const tuple — adding/removing a row is a code change" stays true. The amendment expands the catalogue; it does not relax the closed-list discipline.

## Amendment — 2026-05-17 (link-variant role-as-text addendum)

Same-day follow-up to the issue #47 amendment above. Discovered while reviewing the freshly-expanded catalogue: shadcn's default Button `link` variant ships `text-primary underline-offset-4 hover:underline`, which renders `--primary` AS text on whatever neutral surface the button sits on. Same pattern for the `text-destructive` utility class (shadcn's standard for inline error text). The body's commitment 6 framed the shadcn text catalogue as the `-foreground / root` convention, which covers text-on-fill (e.g. `--primary-foreground` text on a `--primary` fill) but misses the inverse direction (a fill role used AS text on a neutral surface).

Failure mode this catches: a bright, saturated brand `--primary` can pass `--primary-foreground / --primary` at 4.5:1 (small white text on a saturated primary fill is usually fine) and still fail 4.5:1 when rendered as link text on `--background` (saturated colors are often illegible at body-text scale on light surfaces).

Added 4 text pairs at 4.5: `--primary` and `--destructive` each against `--background` and `--card`. Scope held tight to the two roles shadcn's *default templates* document as text — `--primary` (link variant) and `--destructive` (text-destructive utility). Opening "every role used as text" is out of scope; pair selection tracks documented usage patterns, not theoretical re-uses (`text-accent-foreground` against arbitrary surfaces, etc. — not added).

The shadcn `-foreground / root` text-cohort assertion in the test file splits into two cohort assertions so future drift on either axis surfaces independently: `-foreground / root` stays closed at 10 (filter: `fg.endsWith('-foreground')`); role-as-text closes at 4 (filter: `!fg.endsWith('-foreground')`). Test counts update accordingly: total 69→73, shadcn 19→23, text 28→32 (non-text 41 unchanged). The grouping family declarations need no changes — `--primary/--background` and `--destructive/--background` route into the existing `Surface` family by bg; `--primary/--card` and `--destructive/--card` route into `Card`.

The destructive overview block at the top of `pairs.ts` is rewritten to describe the new shape of destructive coverage (no `-foreground / root` pair; non-text fill pairs from the prior amendment; role-as-text pairs from this one). Both rewrites stay within `pairs.ts` — no ADR body prose changed.
