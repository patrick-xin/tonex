// why: the audit opens on "All" with a tally so failures are seen in proportion
// (most of the theme passes) instead of leading with a bare failure list. Pure so
// the counts are unit-tested without rendering the dialog. Splits text vs UI fails
// because they carry different severity (red = fix before shipping; amber = judgment call).
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
