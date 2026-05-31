# Where types live — the CLI test

Governs every type/constant placement in `apps/www/src/`. Terms → [../../glossary.md](../../glossary.md).

- **Apply the CLI test.** *Would a CLI or future second app care about this?* Yes → `@tonex/core`, imported via a declared subpath (`core-surface.md`). No → app-only in www's `types.ts` / `constants.ts` / inline. _(ADR-0016)_
- **Domain lives in core, never inline-defined in www.** `Source`, `Variant`, `ColorSystem`, `Mode`/`MODES`, MD3 token names, shadcn role names, scheme-variant enums, defaults, role-binding maps. _(ADR-0016)_
- **App-only stays in www.** UI panel state, routing strings, display labels, www-only prop helpers. _(ADR-0016)_
- **Add to core first; don't inline-and-lift later.** A missing type goes into core, then gets imported — "I'll lift it later" is the precedent the rule blocks. When in doubt, lean to core. _(ADR-0016)_
- **No inline `'light' | 'dark'` unions.** Use `import type { Mode }`. Lint-enforced. _(ADR-0016)_
