> **State:** Living. Edit when code-organization rules change.

# Code conventions

## Domain types and constants live in `@tonex/core`

In this monorepo:

- **Domain types/constants** (e.g. `Source`, `Variant`, `ColorSystem`, `ResolvedTheme`, MD3 token names, shadcn role names, scheme variant enums, default sources, role binding maps) → ALWAYS in `@tonex/core`. Never inline-define in `apps/www`.
- **App-specific types/constants** (UI panel state, routing strings, app-only UX strings, www-only component prop helpers) NOT related to core's domain → CAN live in www's `types.ts` / `constants.ts` / inline.

**The judgment line:** "Would a CLI or future second app care about this type/constant?"
- Yes → domain → `@tonex/core`
- No → app-only → www is fine

**Why:** Pattern-gravity in monorepos. When debugging in www, the temptation is to inline-define a type because core feels "far away" (different package, longer import path) — even when the type already exists in core. The discipline blocks domain duplication structurally. The single barrel `packages/core/src/index.ts` re-exports everything www can need.

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
