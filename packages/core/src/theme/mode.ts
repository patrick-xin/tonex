// why: shared light/dark union — repeated inline 8+ times across derive,
// source, and surface/* before centralization. Lives flat alongside other
// theme files; the convention is "shared concerns get a sibling file" — when
// a second shared concern lands (e.g. hex utilities) add it as a sibling, not
// under a wrapper folder, until 4-5 files justify grouping. Per-mode shape
// `{ light, dark }` for overrides + bindings is in schema.ts; this file is
// just the union itself.
//
// Canonical domain definition — domain types live in @tonex/core, never inline-defined
// in www; the drift sentinel greps for inline light/dark unions outside this file
// (ADR-0016).
export type Mode = 'light' | 'dark'

// why: runtime tuple for iteration sites that need to enumerate both modes
// (UI per-mode renders, validators, persistence migrations). Living alongside
// `Mode` keeps the type and value declarations in lockstep — adding a third
// mode (impossible per ADR-0013, but the structural pattern stands) flows
// through this one tuple instead of N inline `['light', 'dark']` literals.
export const MODES = ['light', 'dark'] as const satisfies readonly Mode[]
