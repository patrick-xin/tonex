// why: the audit's core verdict vocabulary (Level, EvaluatedPair) now lives in
// the engine's `@tonex/core/audit` module — re-exported here so the www feature's
// existing `./types` consumers don't churn. The presentational filter types
// (Filter, ResultFilter) stay app-side: they're UI toolbar state, not engine
// concerns.
export type { EvaluatedPair, Level } from '@tonex/core/audit'

export type Filter = 'all' | 'text' | 'ui'
// why: mirrors Result minus 'none' (decorative is exempt, never a triaged
// outcome) so the filter matches with `resultOf(p) === resultFilter` — the same
// classifier the row badge reads. Keeps filter ⇄ badge from drifting (issue #1).
export type ResultFilter = 'all' | 'pass' | 'fail' | 'warn'
