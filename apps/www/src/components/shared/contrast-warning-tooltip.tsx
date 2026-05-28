import type { ContrastWarning } from '@/features/contrast-checker/warning'

// why: single tooltip body for every contrast warning surface (rails, role/
// color-roles tiles, popover editors). Two-line layout — line 1 is status +
// intent + partner identity (label + 12px swatch so rail consumers, which
// don't show the partner on screen, can see its colour without opening the
// audit dialog); line 2 is ratio + required threshold (mono, tabular). The
// status word is derived from the canonical (passes, decorative) tuple — same
// tuple the export table uses — so no surface can drift the labelling, and the
// body reads `warning.threshold` so a non-text pair (border vs background at
// 3:1) shows its real requirement rather than a blanket 4.5:1.
export function ContrastWarningTooltipBody({ warning }: { warning: ContrastWarning }) {
  const partnerLabel = warning.partner.replace(/^--(?:color-)?/, '')
  const intentLabel = warning.intent === 'text' ? 'Text' : 'UI'
  const status = warning.decorative ? 'Exempt' : warning.passes ? 'Pass' : 'Fail'

  return (
    <>
      <p className="text-xs flex items-center flex-wrap gap-x-1.5">
        <span className="font-semibold">{status}</span>
        <span className="opacity-70">·</span>
        <span>{intentLabel}</span>
        <span className="opacity-70">· vs</span>
        <span
          className="inline-block size-3 rounded-sm shrink-0 ring-1 ring-current/30"
          style={{ background: warning.partnerHex }}
          aria-hidden="true"
        />
        <span className="font-mono">{partnerLabel}</span>
      </p>
      <p className="text-xs font-mono tabular-nums">
        {warning.ratio.toFixed(1)}:1
        {!warning.decorative && <span className="opacity-70"> / needs {warning.threshold}:1</span>}
      </p>
    </>
  )
}
