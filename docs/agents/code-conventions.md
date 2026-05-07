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

When rewriting logic, read the old file for *behavior reference* only. Don't paste. Write fresh in the new structure with `// why:` comments at non-obvious choices.

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
