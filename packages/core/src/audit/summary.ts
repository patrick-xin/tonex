// why: the gate tally — splits the audited pairs into pass / textFail / uiFail /
// exempt so a caller (the www audit dialog's "All" view, and the auditTheme
// gate) reads failures in proportion instead of leading with a bare failure
// list. text vs UI fails are split because they carry different severity: a
// failing TEXT pair (red) blocks the gate; a failing non-text/UI pair (amber) is
// a judgment call that never blocks. Pure so the counts are unit-tested without
// rendering anything.
type SummaryPair = { effectivePasses: boolean; pair: { intent: 'text' | 'non-text' } }
export type ContrastSummary = { pass: number; textFail: number; uiFail: number; exempt: number }

export function summarizeContrast(functional: SummaryPair[], exemptCount: number): ContrastSummary {
  let pass = 0
  let textFail = 0
  let uiFail = 0
  for (const p of functional) {
    if (p.effectivePasses) pass++
    else if (p.pair.intent === 'text') textFail++
    else uiFail++
  }
  return { pass, textFail, uiFail, exempt: exemptCount }
}
