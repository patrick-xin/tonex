> **State:** Living. Edit when a cross-cutting core invariant changes; the why lives in the cited ADR.

# Architecture — core invariants

Read before any core change. Terms → [../../../glossary.md](../../../glossary.md).

## Engine — MCU is the only generator
- **No `ColorEngine` slot.** Don't introduce an abstraction or alternate generator (Radix-as-engine, custom palette algorithms). _(ADR-0001)_
- **"Add Radix" means palette-library only.** A third-party color library joins as a palette source (the `ColorSystem` slot), never as an engine swap. _(ADR-0001)_
- **No user-facing engine picker.** Mood-shift via variant is the product surface, not "MCU vs other." _(ADR-0001)_

## No facade
- **No facade class.** Don't wrap `deriveTheme`, `applyDom`, and exporters behind one `ThemeSystem.apply()` / `.toCSS()` API. The surface stays `useResolvedTokens` + `deriveTheme` + sink functions. _(ADR-0005)_
- **`deriveTheme` is pure.** Zero React imports, zero side effects, zero DOM access. `(source) → output`, testable with real fixtures. _(ADR-0005)_
- **Higher file count is the shape, not a smell.** A "many imports" complaint motivates the facade — refuse it. Callers import the public surface, not the file tree. _(ADR-0005)_
- **CSS serialisation lives in `exporters/*`, not on the spine.** `deriveTheme`'s output carries no `css` field. _(ADR-0005; amended by ADR-0017)_

## Domain types — the CLI test
- **Apply the CLI test.** Anything a CLI or future second app would consume (modes, variants, token names, role names, defaults, runtime tuples) belongs in `@tonex/core`. UI panel state, routing strings, display labels stay in www. _(ADR-0016)_
- **Add to core first; don't inline-and-lift later.** Missing runtime tuple → add it to core, then import. "I'll lift it later" is the precedent the rule blocks. _(ADR-0016)_
- **Both type and runtime value when both are needed.** Iterating modes in UI requires `MODES`, not just the `Mode` union — export the tuple alongside the type. _(ADR-0016)_
- **Use the declared subpaths.** Import from `@tonex/core` or a named subpath; reaching into `@tonex/core/src/...` is refused. Truth-source: `@tonex/core/package.json#exports`. _(ADR-0016)_
- **No inline `'light' | 'dark'` unions** outside `theme/mode.ts` — use `import type { Mode }`. Lint-enforced. _(ADR-0016)_
