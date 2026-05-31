# Core rules — dispatch

Rules are split per surface so you load only what your task touches. **Read the shard(s) for the surface you're editing — nothing more.** Each rule cites its ADR by number; open it in `../../adr/` only when you need the *why* (cite ADRs by number — the number is the stable join key).

| Editing… | Read |
| --- | --- |
| **any** core change (read first) | [architecture.md](architecture.md) |
| source store · lock · seed · schema (`theme/source.ts`, `theme/schema.ts`) | [source.md](source.md) |
| hydration / SSR guards (`theme/useResolvedTokens.ts`, `react.ts`) | [hydration.md](hydration.md) |
| DOM token emission (`theme/applyDom.ts`) | [layer.md](layer.md) |
| variants (`variants/`) | [variants.md](variants.md) |
| surface treatment (`theme/surface/`) | [surface.md](surface.md) |
| renderer & exporters (`theme/exporters/`, `bundle.ts`, `format.ts`) | [exporters.md](exporters.md) |
| role bindings & overrides (`theme/palette-override/`) | [overrides.md](overrides.md) |
| chart palette (`chart/`) | [chart.md](chart.md) |
| contrast · color-utils boundary (`theme/contrast/`) | [contrast.md](contrast.md) |
| tests (`*.test.ts`) | [testing.md](testing.md) |

Public API by subpath: [../api/core-surface.md](../api/core-surface.md).

**Adding rules:** put the rule in the shard for its surface (new surface → new shard + a row above). One imperative sentence per bullet, ending `_(ADR-NNNN)_`. Definitions go in `../../glossary.md`, the *why* in the ADR — don't restate either here.
