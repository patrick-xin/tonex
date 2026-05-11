import { cn } from 'tailwind-variants'
import type { EvaluatedPair } from './types'

// why: sidebar match runs before ring so `--sidebar-ring` hits the sidebar
// mock, not the focus-ring mock (legacy had this order inverted). Chart
// runs first because chart fg's are series fills, not strokes — the
// default outline preview would misrepresent them as borders.
function PairPreview({ pair }: { pair: EvaluatedPair }) {
  if (pair.pair.intent === 'text') {
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <span className="text-3xl font-bold">Aa</span>
        <span className="text-xs font-medium opacity-80">Sample Text</span>
      </div>
    )
  }

  const fg = pair.pair.fg

  if (fg.includes('chart')) {
    return (
      <div className="flex items-end gap-1.5 h-10" aria-hidden>
        <div className="w-3 h-5 rounded-sm" style={{ background: pair.fgHex }} />
        <div className="w-3 h-9 rounded-sm" style={{ background: pair.fgHex }} />
        <div className="w-3 h-6 rounded-sm" style={{ background: pair.fgHex }} />
      </div>
    )
  }

  if (fg.includes('sidebar')) {
    return (
      <div
        className="w-24 h-10 rounded-md border border-outline-variant flex overflow-hidden"
        style={{ borderColor: pair.bgHex }}
      >
        <div className="w-6 h-full" style={{ background: pair.fgHex }} />
      </div>
    )
  }

  if (fg.includes('ring')) {
    return (
      <div className="relative w-24 h-10">
        <div
          className="absolute inset-0 rounded-md border-2 border-outline-variant opacity-20"
          style={{ borderColor: pair.fgHex }}
        />
        <div
          className="absolute inset-0.5 rounded-md border border-outline-variant"
          style={{ borderColor: pair.fgHex }}
        />
      </div>
    )
  }

  if (fg.includes('border') || fg.includes('outline')) {
    return (
      <div
        className="w-24 h-10 rounded-lg border-2 border-outline-variant"
        style={{ borderColor: pair.fgHex }}
      />
    )
  }

  return (
    <div
      className="w-24 h-10 rounded-md border border-outline-variant flex items-center px-3"
      style={{ borderColor: pair.fgHex }}
    >
      <div className="w-8 h-1.5 rounded-full opacity-30" style={{ background: pair.fgHex }} />
    </div>
  )
}

export function PairCard({
  pair,
  decorative = false,
}: {
  pair: EvaluatedPair
  decorative?: boolean
}) {
  const ratioStr = pair.ratio.toFixed(2)
  const passes = pair.effectivePasses
  const isText = pair.pair.intent === 'text'

  const badgeClass = decorative
    ? 'text-on-surface-variant bg-surface-container'
    : passes
      ? 'text-green-600 dark:text-green-400 bg-green-600/10 dark:bg-green-400/10'
      : isText
        ? 'bg-error text-on-error'
        : 'text-amber-600 dark:text-amber-400 bg-amber-600/10 dark:bg-amber-400/10'

  return (
    <div className="rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div
        className="border border-outline-variant rounded-lg flex flex-col items-center justify-center relative h-28 shrink-0"
        style={{ background: pair.bgHex, color: pair.fgHex }}
      >
        <PairPreview pair={pair} />
        <span
          className={cn(
            'absolute top-1 right-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 tracking-wider',
            badgeClass,
          )}
        >
          {ratioStr}
        </span>
      </div>
      <div className="flex flex-col gap-3 justify-center shrink-0">
        <div className="flex items-center gap-3">
          <span
            className="size-12 rounded-md shrink-0 border border-outline-variant"
            style={{ background: pair.bgHex }}
          />
          <div className="min-w-0 space-y-0.5">
            <div className="text-sm font-mono">{pair.pair.bg}</div>
            <div className="text-[11px] text-on-surface-variant font-mono">{pair.bgHex}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="size-12 rounded-md shrink-0 border border-outline-variant"
            style={{ background: pair.fgHex }}
          />
          <div className="min-w-0 space-y-0.5">
            <div className="text-sm font-mono">{pair.pair.fg}</div>
            <div className="text-[11px] text-on-surface-variant font-mono">{pair.fgHex}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
