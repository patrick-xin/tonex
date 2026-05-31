> **State:** Living. Edit when the surface→shard routing changes.

# www rules — dispatch

Rules are split per surface so you load only what your task touches. **Read the shard(s) for the surface you're editing — nothing more.** Each rule cites its ADR by number — the stable join key; ADRs live per layer (this app's in `../../adr/`, engine + system-wide in their layers' `adr/`), opened only when you need the *why*. Terms → [../../glossary.md](../../glossary.md).

| Editing… | Read |
| --- | --- |
| **any** www change (read first) | [structure.md](structure.md) |
| where a type or constant lives — core vs www | [types.md](types.md) |
| state — local vs store, which store | [state.md](state.md) |
| layout, chrome vs canvas, per-layer routes (`app/(app)/theme/…`) | [layout.md](layout.md) |
| input affordances — disable vs warn | [interactions.md](interactions.md) |
| any component file — naming, why-lines, React conventions | [components.md](components.md) |
| how a component looks/behaves — tokens, focus rings, motion, a11y | [interface-guidelines.md](interface-guidelines.md) |
| tests (`*.test.ts`) | [testing.md](testing.md) |

Engine rules: `packages/core/CLAUDE.md`. Public API by subpath: `packages/core/docs/agents/api/core-surface.md`. Rail UI conventions are feature-local in `src/features/md-rail/CLAUDE.md` (governs both rails).

**Adding rules:** put the rule in the shard for its surface (new surface → new shard + a row above). One imperative per bullet, ending `_(ADR-NNNN)_`. Definitions go in `../../glossary.md`, the *why* in the ADR — don't restate either here.
