import type { ContrastSummary } from '@tonex/core/audit'
import { cx } from 'tailwind-variants'
import { Chip } from '@/components/ui/chip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { RESULT, RESULT_ORDER } from './result'

// why: the audit's plain-language key + tally, isolated from Body so copy and
// visual redesign happen here without touching the dialog's data wiring. Both
// the chip labels/dots and the tally words read from RESULT — the same source
// the table badges read — so legend, summary, and table can't drift apart.

// why: plain-language tally mirroring summarizeContrast's split, labelled from
// RESULT so the words match the chips and badges exactly: textFail → 'fail',
// uiFail → 'warn', exempt → 'none'. "pass" always leads so the headline reads
// as reassurance first; zero categories are omitted.
function summaryLine(summary: ContrastSummary): string {
  const parts = [`${summary.pass} ${RESULT.pass.label}`]
  if (summary.textFail > 0) parts.push(`${summary.textFail} ${RESULT.fail.label}`)
  if (summary.uiFail > 0) parts.push(`${summary.uiFail} ${RESULT.warn.label}`)
  if (summary.exempt > 0) parts.push(`${summary.exempt} ${RESULT.none.label}`)
  return parts.join(' | ')
}

// why: the 'none'/Decorative key only describes md's exempt pairs
// (outline-variant on surface); shadcn has no decorative pairs, so its legend
// drops the chip rather than showing a category that never appears in the table.
export function ContrastInfo({ hasDecorative }: { hasDecorative: boolean }) {
  const results = hasDecorative ? RESULT_ORDER : RESULT_ORDER.filter((r) => r !== 'none')
  return (
    <div className="space-y-2 text-sm text-on-surface-variant">
      <div className="flex flex-wrap gap-x-2">
        <TooltipProvider>
          {results.map((r) => {
            const meta = RESULT[r]
            return (
              <Tooltip key={r}>
                <TooltipTrigger
                  render={
                    <Chip
                      render={
                        <div className="space-x-0.5 flex items-center text-on-surface-variant">
                          <span className={cx('size-2.5 rounded-full', meta.dotClass)} />{' '}
                          <span className="font-medium">{meta.label}</span>
                        </div>
                      }
                      size="xs"
                      variant="outline"
                      className="outline-outline-variant/60"
                    />
                  }
                />
                <TooltipContent>{meta.note}</TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </div>
    </div>
  )
}

export function SummaryLine({ summary }: { summary: ContrastSummary }) {
  return <p className="font-medium text-on-surface">{summaryLine(summary)}</p>
}
