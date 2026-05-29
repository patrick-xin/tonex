> **State:** Living. Edit when a working rule for `apps/www/` is added, refined, or retired.

# `apps/www` — working rules

Auto-loaded when you touch `apps/www/`. Engine-side rules (`deriveTheme`, schema, sinks, seed) live in `packages/core/CLAUDE.md`; the `@tonex/core` export index is `docs/agents/core-surface.md`. Authoritative decisions are in `docs/adr/` — follow a citation only when you need the trade.

## Where types live — the CLI test
Domain types/constants live in `@tonex/core`; **never inline-define them in www.** Test: *would a CLI or future second app care about this?* yes → `@tonex/core` (import via a declared subpath — see `core-surface.md`); no → app-only is fine in www's `types.ts` / `constants.ts` / inline.

- Domain = `Source`, `Variant`, `ColorSystem`, `Mode`/`MODES`, MD3 token names, shadcn role names, scheme-variant enums, defaults, role-binding maps. App-only = UI panel state, routing strings, display labels, www-only prop helpers. _(ADR-0016)_
- **Add to core first; don't inline-and-lift later.** When debugging in www, the pull is to inline a type because core feels "far away" — that's the precedent the rule blocks. When in doubt, lean to core.

## State boundaries — four classes, four homes
Formalized in ADR-0023 (on ADR-0017 + ADR-0021). The judgment line decides the home:

- **Portable theme** (`useSource`, `@tonex/core`) — *changes what `deriveTheme` produces.* Seed, variant, contrast level, overrides, bindings. _(ADR-0017)_
- **Display preferences** (`useUiPrefs`, `lib/stores/ui-prefs.ts`) — *what the user sees in the app, not what the theme produces.* `showExtended`, inspect `colorFormat`, `showTwColorPicker`, `showContrastWarnings`. Surface in the Display popover (`features/nav-tabs/`).
- **Session state** (future store, no consumer today) — *bounds a working context that survives reload but isn't a pref.* File the store when the first consumer appears.
- **Job parameters** (React-local in the owning feature) — *scoped to one action* (e.g. `ExportOptions` toggles). **Never lift to a store**, no matter how many surfaces share the shape.

**`useUiPrefs` scope-creep guard:** a pref enters only when a *second consumer materially needs it, same intent*. Different intent → two named prefs, not one with override semantics. _(ADR-0023 c.3)_

## Porting from prior prototypes — lift UI, rewrite logic
- **UI components → LIFT verbatim.** md (base-ui) + shadcn primitives + layer chrome. They're instances of well-shaped external libs; they carry no tonex architectural drift. _(ADR-0020)_
- **Logic → REWRITE fresh.** Spine, store, schema, registries, exporters, importers, hook, applyDom. Old logic carries the old shape the redesign is escaping. Read the old file for *behavior reference* only; don't paste.
- **Category line:** mostly-JSX + external UI lib → lift; domain logic (color math, store actions, schema) → rewrite; mixed → split (lift JSX, rewrite logic).
- **Two near-duplicate legacy components → rewrite as one.** `HorizontalView`+`VerticalView` differing only in className is one component with a prop. Merge first, then lift the merged result.
- **The why-line rule applies to ported code too** — once a line is in this codebase it's new; framework-timing, try/catch, magic-string conditions earn a `// why:` regardless of origin.
- **Primitive-shape diff before lifting.** If a feature's data shape doesn't decompose 1:1 into core's current shape, STOP and surface the gap as a planning question — don't substitute the closest primitive and rationalize it as a UX simplification. Tells the gap is real: legacy comments saying "deferred / pruned / half-feature / future slice"; legacy type names with no tonex analog (`PaletteOverrides`, `paletteKey`); legacy single-value-per-key vs core mode-keyed-per-token. If missing, the response is "core needs X first." _(ADR-0020 row 2)_

## Disable invalid interactions; don't warn after the fact
When a state combination makes an input invalid, disable the affordance with an explanation (tooltip, greyed input). Don't allow the action then emit a `warnings: string[]` entry — warnings are post-hoc telemetry; disable shapes intent up-front.

- Prefer a single source-of-truth selector (e.g. `disabledReasonFor(input, source): string | null`) consumed by *both* the engine (skip the op) and the UI (grey out + tooltip).
- Reserve `warnings` for genuinely runtime-only failures the UI couldn't pre-empt. Pattern: tertiary-palette override is disabled when `variant === 'cmf'` (CMF builds tertiary from a second source, so the override would half-apply).

## Structure — six rules
`apps/www/src/` is feature-first under anti-rot rules. _(ADR-0014 rules 1–4; ADR-0022 rules 5–6)_

1. **One-level features.** `features/<name>/` is the only namespace level. Sub-folders are organisational, never sub-features. Trigger to split into a sibling feature: ~10+ files **and** a perceivable separate workflow.
2. **`index.ts` per feature.** Routes and other features import only from `features/<name>`. No bare files at `features/` root.
3. **Providers by scope.** App-wide → `app/_providers.tsx`. Feature-scoped → inside the feature. No top-level `providers/`.
4. **`components/` is `ui/` (md primitives), `shadcn/` (shadcn primitives), `shared/` (used by 2+ features), `icons/` (missing-from-lib icons).** Single-feature components stay private to their feature.
5. **Two feature classes, both named after what the prompt calls them:**
   - **Workflow features** (verb — "what the user does"): layer-agnostic. e.g. `token-override/`, `source-color/`, `scheme-variant/`, `custom-colors/`, `surface-adjustment/`, `palette-override/`, `export/`.
   - **Surface features** (noun/place — "where the user is"): layer-keyed names allowed and encouraged. e.g. `md-rail/`, `shadcn-rail/`, `top-nav/`, `testbed/`. Surfaces compose workflow features; they carry no workflow logic beyond layout/tab-switching.
6. **Locate-test is the design metric.** A prompt "do X to Y" must resolve to one `features/<Y>/` or one `components/` primitive. If neither home exists, **create the named feature folder before writing code** — don't tuck work inside an unrelated folder. _(ADR-0022)_

## Layout, chrome vs canvas, layer awareness
Chrome (rail + top tabs) lives in per-layer layouts; there is **no** shared `theme/layout.tsx`. Each per-layer layout is a Server Component providing `<LayerContext>` and rendering a tiny client wrapper (`_md-nav-tabs.tsx` / `_shadcn-nav-tabs.tsx`) that imports its colocated `_nav-config.ts` (typed `NavConfig`). The wrapper exists because `NavConfig` carries lucide forwardRef icons that aren't serialisable across the RSC boundary; the same config feeds `<SiteCommandMenu>` so the two surfaces can't drift. _(ADR-0019; 2026-05-08 amendment)_

- **Chrome** = editor shell (rail, top tabs, status strip, modals, settings, layer switcher). Always from `components/ui/`, every route — tonex dogfoods its own md component library regardless of output. **Canvas** = preview surface under `theme/{(md),(shadcn)/shadcn}/…`, layer-segmented: md canvas → `components/ui/`, shadcn canvas → `components/shadcn/`. A shadcn user sees an md-styled editor with a shadcn-styled canvas — intentional.
- **Layer awareness:** a workflow feature reads `const layer = useLayer()` from `<LayerContext>`. Allowed: `const tokens = layer === 'shadcn' ? shadcnTokens : mdTokens` (changes *what data* the same component renders). Banned: `const Button = layer === 'shadcn' ? ShadcnButton : UiButton` (changes *which component* renders) — still banned per ADR-0019. Don't prop-drill layer.

```
apps/www/src/
  app/
    layout.tsx                  # outer chrome
    _providers.tsx              # app-wide providers ONLY here
    (app)/
      (root)/page.tsx           # chooser landing
      theme/
        (md)/
          layout.tsx            # Server: <LayerProvider value="md"> + MdRail + <MdNavTabs/>
          _md-nav-tabs.tsx      # 'use client' — bridges config across RSC boundary
          _nav-config.ts        # mdNavConfig
          page.tsx              # /theme — md canvas
          components/{page.tsx,_blocks/}   # route-colocated canvas content
        (shadcn)/shadcn/
          layout.tsx            # Server: <LayerProvider value="shadcn"> + chrome + ShadcnProvider
          _shadcn-nav-tabs.tsx  _nav-config.ts  _provider.tsx
          page.tsx              # /theme/shadcn — shadcn canvas
          {components,blocks,dashboard,charts}/{page.tsx,_blocks/}
          token-override/page.tsx           # full-page expansion of features/token-override/
  features/                     # workflow + surface features (rule 5); ~27 today, non-exhaustive
    md-rail/  shadcn-rail/  top-nav/  testbed/        # surfaces (layer-keyed allowed)
    source-color/ scheme-variant/ palette-override/ custom-colors/
    surface-adjustment/ token-override/ export/ …     # workflow (layer-agnostic)
  components/ { ui/  shadcn/  shared/  icons/ }
  lib/ { layer-context.tsx  nav-config.ts  handles.ts  hooks/ }
  styles/
```
Most slots are created on demand; the `theme/(md|shadcn)/layout.tsx` + `_nav-config.ts`, `_providers.tsx`, and the `features/`/`components/` core are not.

**Locate-test (worked):**

| Prompt | Folder(s) |
|---|---|
| "Enable token override for shadcn" | `features/token-override/` + `features/shadcn-rail/` |
| "Tweak the md rail" / "the shadcn rail" | `features/md-rail/` / `features/shadcn-rail/` |
| "Top nav settings menu" | `features/top-nav/` |
| "Add a contribution-history block" | `app/(app)/theme/(md)/components/_blocks/` |
| "Edit md role colors" | `features/color-roles-list/` |
| "Tweak source-color picker" | `features/source-color/` |
| Toast provider, app-wide / feature-scoped | `app/_providers.tsx` / `features/<x>/providers.tsx` |
| Clipboard wrapper | `lib/` |

**When applying:** new workflow → name after the verb; new surface → name after the place (layer-keyed OK). Refuse: workflow logic inside a surface feature; forking a workflow per layer (`md-token-override/`+`shadcn-token-override/`); `features/shared/` (promote to `components/` at 2+ consumers); nested sub-features (split to siblings once the trigger fires); runtime primitive switching (route segmentation is the layer mechanism); dropping a block into `components/` (canvas content is route-colocated under `_<bucket>/`, promote at 2+ page consumers).

**Feature-or-route-content discriminator** (one route consumer + layer-hardcoded naming — apply in order):
1. **Mutates source state** (`setSource*`, store actions)? → **workflow feature** under `features/<name>/`, even if layer-hardcoded today (layer-awareness can be added later). Workflow files accrete sub-components/hooks/utils that need a folder.
2. **Passive display** (reads selectors only) AND hardcodes layer-specific names AND one consumer? → **route-content**, colocate at the route (`page.tsx` inline or sibling `_<view>.tsx`).
3. Layer-agnostic, or ≥2 consumers? → **feature**.

## Component file conventions (`apps/www/src/`)
The component file is the smallest unit of agent locality — the locate-test resolves *which file*; these resolve *what's inside it*.

- **File names match prompt language.** A file named `scheme-variants-toggle.tsx` contains only that. If a prompt would name a sub-component separately ("CMF picker", "color swatch") and it's non-trivial (~30+ lines, own store reads/state/popover), give it its own file. 1–2 trivial JSX-only helpers (≤30 lines, no hooks/store reads) may stay. _(ADR-0022)_
- **File names match the primary export.** No `<x>-manager/-helper/-service/-handler` suffixes (they hide contents and force a grep). A hook → `use-<x>.ts`; a util namespace → `<noun>-utils.ts`; a component → kebab match (`ExportButton` → `export-button.tsx`).
- **Feature folder shape:** `<name>.tsx` (primary export, NOT `index.tsx`) + `index.ts` (re-exports the public surface only) + siblings (`use-<x>.ts`, `<noun>-utils.ts`, private `<component>.tsx`). The `.tsx`+`index.ts` split keeps editor tab names informative.
- **Don't extract a sub-component until it earns it.** Trigger: 30+ lines OR 2+ call sites OR independently testable. Write inline first; split when the parent breaks ~80–100 lines and the block has a name people would say.
- **No nested interactive elements.** A `button`/`a` inside another is invalid HTML and breaks keyboard nav. Use sibling composition (flex/grid, `-ml-px`, shared radius), not visual nesting. Applies to `Button`, `ToggleGroupItem`, `Tab`, `MenuItem`, `Link`, etc.
- **Refs sync in `useLayoutEffect`, never during render.** Mutating `ref.current` during render is a Concurrent-render hazard — a discarded render leaves the ref holding uncommitted state for the next event handler. Sync in a no-deps `useLayoutEffect` (runs every commit).
- **Manual memoization is rarely needed.** React Compiler is on. Reach for `useCallback`/`useMemo` ONLY across a reference-comparing non-React boundary (ref-measure APIs like `virtualizer.measureElement`/`ResizeObserver`, subscribe-time library captures, explicit effect deps). Plain JSX handlers (`onClick`, `onValueChange`) do NOT qualify — wrapping them is dead code.
- **Drop redundant fields and unused exports.** If `id === label` for every row, drop one. An `export const` with no external consumer is `const` (run `rg <name> <scope>` first). A type alias identical to its single use site is dead — inline it.

**`// why:` placement — four patterns that always earn one:**
1. **Framework-timing primitives** (`queueMicrotask`, `useLayoutEffect` for ref-sync, `flushSync`, `startTransition`) — *why this primitive, not `useEffect`*.
2. **Try/catch fallbacks** — what input shape throws, why the fallback is acceptable.
3. **Magic-string conditions from a third-party API** (`reason === 'none'`) — what the string means in the lib's vocabulary, why this branch matters.
4. **Silent fallbacks for typed-but-partial reads** (`?? '#000000'`, `?? []` on a typed-optional access where data flow says complete) — *missed in two reviews without prompting.* Either name the shape that triggers it, or remove the fallback by tightening the type at the source.

JSDoc blocks on internal helpers retire — they dilute the why-signal. Why-lines stay terse, single-purpose, adjacent to the line.

**A why-line is not a narrative.** Three shapes that read like why but preserve no invariant (each removable without losing a contract a future edit must keep):
1. **History narration** — past-tense storytelling (*"Slice 2 promotion replaced the constants"*, *"which drifted apart"*, *"the old tile lied 4.5:1"*). State the invariant in the present and drop the history. Exception: a present-tense *rejected-alternative why-not*, one clause, is fine.
2. **Roadmap-in-comment** — future plans (*"retires when slice 4 lands"*, *"swap for var(--…) later"*, bare `Slice 4:` labels). Belongs in the issue/ADR; a comment roadmap ages into a lie.
3. **Tutorial prose** — teaching a general technique rather than the one non-obvious choice here. Compress to the single why (`@property` so the angle interpolates) and trust the reader. UI primitives are the usual host.

The tell across all three: **length without a preserved invariant.** If deleting a sentence makes no future edit more likely to break a contract, it was narration.
