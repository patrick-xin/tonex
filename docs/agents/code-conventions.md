> **State:** Living. Edit when code-organization rules change.

# Code conventions

## Domain types and constants live in `@tonex/core`

In this monorepo:

- **Domain types/constants** (e.g. `Source`, `Variant`, `ColorSystem`, `ResolvedTheme`, MD3 token names, shadcn role names, scheme variant enums, default sources, role binding maps) → ALWAYS in `@tonex/core`. Never inline-define in `apps/www`.
- **App-specific types/constants** (UI panel state, routing strings, app-only UX strings, www-only component prop helpers) NOT related to core's domain → CAN live in www's `types.ts` / `constants.ts` / inline.

**The judgment line:** "Would a CLI or future second app care about this type/constant?"
- Yes → domain → `@tonex/core`
- No → app-only → www is fine

**Why:** Pattern-gravity in monorepos. When debugging in www, the temptation is to inline-define a type because core feels "far away" (different package, longer import path) — even when the type already exists in core. The discipline blocks domain duplication structurally. Core exposes typed subpaths so each surface grows independently:

- `@tonex/core` — engine: `deriveTheme`, `applyDom`, `useSource`, `useResolvedTokens`, `selectPortable`, `exportCss`, `formatCss`, `sourceColorHexFromImage`, surface algos, `Mode`, `SourceState`, `SourceActions`
- `@tonex/core/schema` — `PortableTheme`, MD3/shadcn token + role names, defaults, validators
- `@tonex/core/oklch` — `hexFromOklch`
- `@tonex/core/data` — `TAILWIND_PALETTE_OKLCH`, `NEUTRAL_PALETTE_NAMES`
- `@tonex/core/variants` — variant registry + types

Adding a schema field doesn't widen the engine surface; adding an engine API doesn't drag schema into every importer.

When in doubt, lean toward core. Adding to core and importing is easier to maintain than later promoting from www.

## Porting from prior prototypes — lift UI, rewrite logic

When porting components or modules from a prior prototype:

- **UI components → LIFT verbatim.** Both md (base-ui) and shadcn primitives, plus layer-specific chrome (sidebar, nav, layout). UI components are mostly instances of well-shaped external libraries — they don't carry tonex-specific architectural drift.
- **Logic → REWRITE fresh.** Spine code, store, schema, registries, exporters, importers, hook, applyDom. Old logic carries old architectural shape, and that shape is what the redesign is escaping.

**Category line:**
- File imports React + an external UI lib (shadcn, base-ui) and contains mostly JSX → UI, **lift it**.
- File contains domain logic (color math, palette derivation, store actions, schema definitions) → logic, **rewrite it**.
- Mixed files (component with embedded logic) → split: lift the JSX, rewrite the logic.
- **Two near-duplicate components in the legacy → ALWAYS rewrite as one.** A `HorizontalView` + `VerticalView` (or `LightVariant` + `DarkVariant`, etc.) differing only in className/layout props is the same component with a prop. Lifting both bodies verbatim is exactly what the lift-vs-rewrite rule is escaping. Merge first; lift the merged result.

When rewriting logic, read the old file for *behavior reference* only. Don't paste. Write fresh in the new structure with `// why:` comments at non-obvious choices. **The why-line rule applies to ported code as much as new code** — once a line is in this codebase, it's a new line, and the patterns that earn a why-line (framework timing, try/catch fallbacks, magic-string conditions) earn one regardless of whether the line came from the prototype.

### Before lifting: primitive-shape diff

When porting a feature whose data shape doesn't decompose cleanly into core's current shape (e.g. legacy `paletteOverrides` family-regen vs core's per-token `md3TokenOverrides`), STOP and surface the gap as a planning question. Don't substitute the closest available primitive and rationalise the difference as a UX simplification.

Signals the gap is real, not a refactor opportunity:

- Schema/code comments using the words "deferred", "pruned", "half-feature", "future slice", "until a real product need surfaces" — these mean core OWES this primitive, not that it evolved past it.
- Type/file names in the legacy that don't have a tonex analog (`PaletteOverrides`, `paletteKey`).
- Legacy data shape that doesn't decompose 1:1 into the core shape (legacy single-value-per-key vs core mode-keyed-per-token, etc.).

Pre-lift check: list the legacy's data shape, list core's nearest shape, and decide whether the diff is decompose-able (flat → mode-keyed) or reflects a missing capability. If missing, the response is "core needs X first," not "let me map onto Y."

ADR-0020 holds the authoritative lift-vs-rewrite matrix; this rule applies to row 2 ("lift JSX, rewrite wiring") specifically — the wiring rewrite is what depends on the primitive-shape diff being honest.

## Disable invalid interactions; don't warn after the fact

When an interaction is invalid in some state combination, disable the affordance with an explanation (tooltip, greyed input). Don't allow the action and emit a `warnings: string[]` entry from the engine afterwards. Warnings are post-hoc telemetry; disable is up-front intent shaping.

Pattern: tertiary palette override is disabled when `variant === 'cmf'` because CMF builds tertiary from a second-source picker, so the override would only half-apply.

**How to apply:**

- For any feature where a state combination makes an input invalid, design the disable rule first-class.
- Prefer a single source-of-truth selector (e.g. `disabledReasonFor(input, source): string | null`) consumed by *both* the engine (to skip the operation) and the UI (to grey out + show tooltip).
- Don't add `warnings.push(...)` for state-combination conflicts. Reserve `warnings` for genuinely runtime-only failures the UI couldn't pre-empt.

**Why:** when a warning fires, the user has already committed the action — they can't tell why output diverges from intent and have to read warning text to recover. Disabling shapes intent at the moment the user would violate the constraint.

## Component file conventions (`apps/www/src/`)

These were derived 2026-05-08 from a code-quality pass on `scheme-variants-toggle.tsx` and `tw-color-picker-combobox.tsx`. Each rule below was the fix that produced a real reduction in noise or a real bug closure on those files. Land them now so the next ten components inherit the same shape.

### File names match prompt language (file-level locate-test)

Locate-test (ADR-0022) applies at file level too. A file named `scheme-variants-toggle.tsx` should contain only the scheme variants toggle. If a prompt would name a sub-component separately ("CMF picker", "color swatch", "fine-tune palette"), and that sub-component is **non-trivial** (~30+ lines, its own store reads, its own state, its own popover/dialog), give it its own file alongside.

A file that contains its named thing plus 1–2 trivial JSX-only helpers (≤30 lines, no hooks, no store reads) is fine. The line is "would I open this file looking for that thing?" — if yes, split.

### File names match what the file primarily exports

A file named `<x>-manager.ts`, `<x>-helper.ts`, `<x>-service.ts`, or `<x>-handler.ts` hides what's inside — the reader has to open it to find out. Pick a name that reflects the primary export:

- a hook → `use-<x>.ts` (`use-export-content.ts`, NOT `export-content-manager.ts`)
- a util namespace (multiple pure functions, one domain) → `<noun>-utils.ts` (`color-utils.ts`)
- a component → kebab-case match (`ExportButton` → `export-button.tsx`)

The filename is the locate-test answer: when a prompt says "fix the export content hook", the agent lands at `use-export-content.ts` directly. Manager/helper suffixes force a grep first.

### Feature folder shape

Inside `features/<name>/`:

- `<name>.tsx` — the primary exported component (NOT `index.tsx`)
- `index.ts` — re-exports only the public surface (what other features and routes import)
- siblings: hooks (`use-<x>.ts`), util namespaces (`<noun>-utils.ts`), private components (`<component>.tsx`)

The `<name>.tsx` + `index.ts` split (rather than `index.tsx`) keeps editor tab names informative when several features are open and keeps the public-surface re-export small and scannable. Established peers: `export/`, `custom-colors/`, `nav-tabs/`, `scheme-variant/`.

### Don't extract a sub-component until it earns it

Trigger to extract: **30+ lines** OR **2+ call sites** OR **independently testable behavior**. A single-call ≤30-line sub-component stays inline. Naming-as-documentation is a value, but a one-call helper named something like `<FooForm>` (where Foo is the parent) just adds an indirection without earning it.

When in doubt: write it inline first. If the parent breaks ~80–100 lines and the inlined block has a clear name people would say, split then.

### No nested interactive elements

A `<button>` (or anything rendering as `button`/`a`) inside another `button` is invalid HTML and breaks keyboard navigation. Use sibling composition (flex/grid) when an item needs an extra affordance — not visual nesting inside a clickable container. If the visual goal is "the affordance looks attached to the item," use spacing (`-ml-px`, shared border-radius) on siblings, not nesting.

This applies to all interactive primitives: `Button`, `ToggleGroupItem`, `Tab`, `MenuItem`, `Link`, etc.

### Refs sync in `useLayoutEffect`, never during render

If a ref needs to track render-derived state so a sibling/parent event handler can read it, sync it in `useLayoutEffect` (no deps — runs every commit). Mutating `ref.current` during render is a Concurrent-render hazard: if React discards a render, the ref holds state that never committed, and the next event handler reads it.

```tsx
// banned:
itemIndexToFlatIndexRef.current = itemIndexToFlatIndex
filteredCountRef.current = filteredItems.length
return <div>...</div>

// correct:
useLayoutEffect(() => {
  itemIndexToFlatIndexRef.current = itemIndexToFlatIndex
  filteredCountRef.current = filteredItems.length
})
```

### Manual memoization (`useCallback`/`useMemo`) is rarely needed

`apps/www` has React Compiler enabled — memoization is handled automatically. Reach for `useCallback`/`useMemo` ONLY when crossing a non-React boundary that compares by reference:

- callbacks consumed by ref-measure APIs (`virtualizer.measureElement`, `ResizeObserver`)
- callbacks subscribed to via third-party libraries that capture references at subscribe time
- explicit deps arrays of `useEffect`/`useMemo` (rare — usually a sign you should restructure)

Plain JSX event handlers (`onClick`, `onValueChange` to a non-memoized child) do NOT qualify. Wrapping these is dead code: it adds nothing the compiler doesn't already do and makes the file harder to read.

When in doubt, write it without. If the compiler can't see why memoization is needed, it usually isn't.

### Drop redundant fields and unused exports

- If `id === label` for every instance of a row type, drop one. Pick the field that already does double duty (often `label` — both display string and stable key).
- An `export const` with no external consumer is `const`. Run `rg <name> <scope>` before keeping the `export`.
- A type alias that's identical to its single use site is dead — inline it.

### `// why:` at framework-specific timing, error fallbacks, and magic conditions

Repo convention is `// why:` only — but the *placement* matters. Four patterns that always deserve a why-line:

1. **Framework timing primitives** — `queueMicrotask`, `useLayoutEffect` (when used for ref sync vs the more common DOM-measurement reason), `flushSync`, `startTransition`. The reader can't tell *why this primitive instead of `useEffect`* without the why.
2. **Try/catch fallbacks** — what input shape causes the throw, and why the fallback is acceptable rather than crashing.
3. **Magic-string conditions** that come from a third-party API surface (`reason === 'none'`, etc.) — what does the magic string mean in the library's vocabulary, and why is *that* branch the one we care about.
4. **Silent fallbacks for typed-but-partial reads** — `?? '#000000'`, `?? []`, `?? defaultValue` on a typed map/array access where the type says optional but the data flow says complete. Two patches in two reviews missed these without prompting; the missing why-line costs the reader a trip to the schema to learn whether the fallback ever fires. Either name the shape that triggers it ("partial-record access on a closed-enum merge — fires only if a token slips out of schema rotation") OR remove the fallback by tightening the type at the source.

JSDoc blocks (`/** … */`) on internal helpers retire — they dilute the why-comment signal CLAUDE.md preserves. Why-lines stay terse, single-purpose, placed adjacent to the line they explain.

### Why these rules

The component file is the smallest unit of agent locality. Locate-test resolves *which file* an agent opens; these rules resolve *what an agent finds when it opens the file*. Each rule above was either (a) a bug closure (nested buttons, refs-in-render) or (b) a file-shrink that made the parent's intent legible (CMF picker extraction cut `scheme-variants-toggle.tsx` from 185 → 71 lines, ~60%). Either justification is sufficient; the rules without a precedent like that don't get added.
