> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# Domain types and constants live in @tonex/core

The monorepo seam between `@tonex/core` (engine + schema + registries) and `apps/www` (UI) tempts inline type definitions whenever a www file is "in www, far from core." A type or constant defined inline in www today becomes the precedent the next type follows.

**Decision:** Domain types and constants live in `@tonex/core`. App-only types and constants may live in www.

**Judgment line:** *"Would a CLI or a future second app care about this type/constant?"*
- Yes → it's domain → must live in `@tonex/core`.
- No → it's app-only → www is fine.

**Domain (must be in core):** `Mode`, `MODES` runtime tuple, `Variant`, `VariantName`, `VariantGroup` and the canonical group ordering, `ColorSystem`, `ResolvedTheme`, MD3 token names (`MD_TOKEN_NAMES`), shadcn role names, scheme variant enums, default sources / `DEFAULT_INPUTS`, role binding maps, `SurfaceAlgo` and `SURFACE_ALGOS` runtime tuple. **Both type and runtime value** when both are needed (e.g. iterating modes in UI requires the tuple, not just the union).

**App-only (may live in www):** UI panel state, routing strings, www-only UX strings, display labels (`VARIANT_LABELS`, `GROUP_LABELS`), layout-specific helpers, panel ordering driven by display layout.

**Subpath exports from `@tonex/core`** organise domain content into named scopes — engine surface (derivation, sink functions, hooks), schema (`PortableTheme`, token + role names, defaults, validators), colour-space helpers, palette data, variants registry. The specific subpaths are defined in `@tonex/core/package.json#exports`; that is the truth-source.

Adding a schema field doesn't widen the engine surface; adding an engine API doesn't drag schema into every importer.

**Why:** Pattern-gravity. When debugging in www, the temptation is to inline-define a type because core feels "far away" (different package, longer import path) — even when the type already exists in core. The discipline blocks domain duplication structurally. Without the rule, a `type Mode = 'light' | 'dark'` in three feature files becomes the de facto definition, and core's `Mode` becomes one of four equally-authoritative versions.

**Consequence:**

- When in doubt, lean toward core. Adding to core and importing is easier to maintain than later promoting from www.
- Reaching into `@tonex/core/src/...` (a subpath into source files) bypasses the public exports — refuse. Use the declared subpaths.
- When a needed runtime tuple is missing from core (e.g. `MODES`), **add it to core first, then import** — don't inline-define and intend to lift later. The "I'll lift it later" intention is exactly what the rule blocks.
- **Drift sentinel (cheap, mechanical):** grep for `'light' | 'dark'` literal unions outside `packages/core/src/theme/mode.ts`. Each hit is either an `import type { Mode }` (fine) or an inline definition (violation).
