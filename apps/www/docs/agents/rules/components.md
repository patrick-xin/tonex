> **State:** Living. Edit when a component-file convention changes; the why lives in the cited ADR.

# Component file conventions

The component file is the smallest unit of agent locality — the locate-test (see [structure.md](structure.md)) resolves *which file*; these resolve *what's inside it*. _(ADR-0022)_

## File shape
- **File names match prompt language.** `scheme-variants-toggle.tsx` contains only that. A sub-component a prompt would name separately ("CMF picker", "color swatch"), if non-trivial (~30+ lines, own store reads/state/popover), gets its own file; 1–2 trivial JSX-only helpers (≤30 lines, no hooks/store reads) may stay. _(ADR-0022)_
- **File names match the primary export.** No `-manager/-helper/-service/-handler` suffixes. Hook → `use-<x>.ts`; util namespace → `<noun>-utils.ts`; component → kebab match (`ExportButton` → `export-button.tsx`).
- **Feature folder shape:** `<name>.tsx` (primary export, NOT `index.tsx`) + `index.ts` (public re-exports only) + siblings (`use-<x>.ts`, `<noun>-utils.ts`, private `<component>.tsx`).
- **Don't extract a sub-component until it earns it.** Trigger: 30+ lines OR 2+ call sites OR independently testable. Write inline first; split when the parent breaks ~80–100 lines and the block has a name people would say.
- **Drop redundant fields and unused exports.** `id === label` for every row → drop one. `export const` with no external consumer → `const` (run `rg <name> <scope>` first). Type alias identical to its single use site → inline it.

## React conventions
- **Production UI**: Base UI, `@/components/ui`, which expose `composites` and `primitives`, always use `composites` unless components need customization. Never reach `@/components/shadcn`, they are for preview demos.
- **Manual memoization is rarely needed — React Compiler is on.** Reach for `useCallback`/`useMemo` ONLY across a reference-comparing non-React boundary (ref-measure APIs like `virtualizer.measureElement`/`ResizeObserver`, subscribe-time captures, explicit effect deps). Plain JSX handlers (`onClick`, `onValueChange`) do NOT qualify — wrapping them is dead code.
- **No nested interactive elements.** A `button`/`a` inside another breaks keyboard nav and is invalid HTML. Use sibling composition (flex/grid, `-ml-px`, shared radius). Applies to `Button`, `ToggleGroupItem`, `Tab`, `MenuItem`, `Link`.
- **Refs sync in `useLayoutEffect`, never during render.** Mutating `ref.current` during render is a Concurrent-render hazard. Sync in a no-deps `useLayoutEffect` (runs every commit).

## Why-lines — four patterns that always earn one
1. **Framework-timing primitives** (`queueMicrotask`, `useLayoutEffect` for ref-sync, `flushSync`, `startTransition`) — *why this primitive, not `useEffect`*.
2. **Try/catch fallbacks** — what input shape throws, why the fallback is acceptable.
3. **Magic-string conditions from a third-party API** (`reason === 'none'`) — what the string means in the lib's vocabulary.
4. **Silent fallbacks on typed-but-partial reads** (`?? '#000000'`, `?? []` where data flow says complete) — name the shape that triggers it, or remove the fallback by tightening the type at the source.

Why-lines stay terse, single-purpose, adjacent to the line. JSDoc blocks on internal helpers retire — they dilute the why-signal.

## A why-line is not a narrative
Three shapes that read like why but preserve no invariant — each removable without losing a contract:
1. **History narration** — past-tense storytelling (*"Slice 2 replaced the constants"*, *"which drifted apart"*). State the invariant in the present, drop the history. (A present-tense rejected-alternative why-not, one clause, is fine.)
2. **Roadmap-in-comment** — future plans (*"retires when slice 4 lands"*, bare `Slice 4:` labels). Belongs in the issue/ADR.
3. **Tutorial prose** — teaching a general technique. Compress to the single non-obvious why (`@property` so the angle interpolates) and trust the reader.

The tell across all three: **length without a preserved invariant.** If deleting a sentence makes no future edit likelier to break a contract, it was narration.
