// why: the IO seam + exit-code taxonomy — the tiny shared kernel every command
// and the dispatcher import, instead of reaching back into `run.ts` (which would
// cycle: run → command → run). `cli.ts` is the only file that maps real process
// streams onto `Io`; everything below this seam is exercised at a function
// boundary with captured chunks.
export interface Io {
  out: (chunk: string) => void
  err: (chunk: string) => void
}

// why: the exit-code taxonomy, borrowed from design.md's split of "fix the call"
// (exit 2) from "fix the artifact" (exit 1). The two demand OPPOSITE agent
// responses — re-issue corrected args vs. apply a color remedy — so collapsing
// them (as the old all-non-success-is-1 shape did) blinds the caller.
export const OK = 0
export const GATE = 1 // a contrast TEXT pair failed — the artifact is wrong
export const USAGE = 2 // bad flags / inputs / IO — the call is wrong
