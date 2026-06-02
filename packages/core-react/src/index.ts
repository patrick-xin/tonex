// why: ADR-0037 — @tonex/core-react is the editor runtime: the stateful,
// browser-bound layer the pure engine (@tonex/core) deliberately excludes. It
// holds the single zustand source store (`useSource` + its selectors), the
// React subscription hook (`useResolvedTokens`), the live DOM token sink
// (`applyDom`), and the debounced localStorage persistence (`flushPersist`).
//
// apps/www imports stateful symbols from here and pure-engine symbols from
// @tonex/core. The dependency is one-way (core-react → core, never the
// reverse), so the engine stays consumable by a CLI/SDK with zero React —
// the foundation the read-write integration slice builds on.
export { applyDom } from './applyDom'
export {
  flushPersist,
  type SourceActions,
  type SourceState,
  selectHydrated,
  selectPortable,
  useSource,
} from './source'
export { useResolvedTokens } from './useResolvedTokens'
