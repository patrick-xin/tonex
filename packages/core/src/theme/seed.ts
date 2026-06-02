import { hexFromHct } from './hct'
import type { PortableTheme } from './schema'

// why: ADR-0028 — hex projection selector. Returns the user's pasted bytes
// when `seed.exactHex` is set (preserved across hex-input paths); falls
// back to `hexFromHct(seed)` once any HCT-axis setter has cleared it.
// Operates on `Pick<PortableTheme, 'seed'>` so it works on both SourceState
// and the pure PortableTheme shape (derive.ts, chart/sequential.ts).
// Every read site that needs a hex calls this — `seed.exactHex` is never
// read directly outside the selector, so the fallback rule has one home.
//
// why pure-core (ADR-0037): this is the `exactHex ?? hexFromHct` domain rule,
// not store state. It lives in `@tonex/core` so the engine and a future CLI
// resolve a seed to its hex without importing the React/store package. The
// store (`source.ts`, now `@tonex/core-react`) imports it from here.
export function selectSeedHex(s: Pick<PortableTheme, 'seed'>): string {
  return s.seed.exactHex ?? hexFromHct(s.seed)
}
