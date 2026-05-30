> **State:** Living. Edit when the surface→shard routing changes.

# `@tonex/core`

Seed hex → theme, via Material Color Utilities (MCU). Domain vocabulary lives in [./CONTEXT.md](./CONTEXT.md).

Rules are split per surface so you load only what your task touches. **Read the shard(s) for the surface you're editing — nothing more.** Each rule cites its ADR; open the ADR only when you need the *why*.

| Editing… | Read |
| --- | --- |
| **any** core change (read first) | [docs/agents/architecture.md](docs/agents/architecture.md) |
| source store · lock · seed · schema (`theme/source.ts`, `theme/schema.ts`) | [docs/agents/source.md](docs/agents/source.md) |
| hydration / SSR guards (`theme/useResolvedTokens.ts`, `react.ts`) | [docs/agents/hydration.md](docs/agents/hydration.md) |
| DOM token emission (`theme/applyDom.ts`) | [docs/agents/layer.md](docs/agents/layer.md) |
| variants (`variants/`) | [docs/agents/variants.md](docs/agents/variants.md) |
| surface treatment (`theme/surface/`) | [docs/agents/surface.md](docs/agents/surface.md) |
| renderer & exporters (`theme/exporters/`, `bundle.ts`, `format.ts`) | [docs/agents/exporters.md](docs/agents/exporters.md) |
| role bindings & overrides (`theme/palette-override/`) | [docs/agents/overrides.md](docs/agents/overrides.md) |
| chart palette (`chart/`) | [docs/agents/chart.md](docs/agents/chart.md) |
| contrast · color-utils boundary (`theme/contrast/`) | [docs/agents/contrast.md](docs/agents/contrast.md) |

**Adding rules:** put the rule in the shard for its surface (new surface → new shard + a row above). One imperative sentence per bullet, ending `_(ADR-NNNN)_`. Definitions go in `CONTEXT.md`, the *why* in the ADR — don't restate either here.
