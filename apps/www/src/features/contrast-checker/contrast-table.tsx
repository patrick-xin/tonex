import { Fragment } from 'react'
import { cx } from 'tailwind-variants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/tables'
import type { Layer } from '@/lib/layer-context'
import { familyOf, familyOrder } from './grouping'
import type { EvaluatedPair, Filter, ResultFilter } from './types'

const COL_COUNT = 6

interface ContrastTableProps {
  functional: EvaluatedPair[]
  decorative: EvaluatedPair[]
  layer: Layer
  filter: Filter
  resultFilter: ResultFilter
}

function TokenCell({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="size-8 rounded shrink-0 ring ring-outline-variant/60"
        style={{ background: hex }}
      />
      <div>
        <div className="text-xs font-mono">{name.replace(/^--/, '')}</div>
        <div className="text-[10px] text-on-surface-variant font-mono">{hex}</div>
      </div>
    </div>
  )
}

function StatusBadge({
  passes,
  isText = false,
  decorative = false,
}: {
  passes?: boolean
  isText?: boolean
  decorative?: boolean
}) {
  if (decorative) {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
        Exempt
      </span>
    )
  }
  const cls = passes
    ? 'text-green-600 dark:text-green-400 bg-green-600/10 dark:bg-green-400/10'
    : isText
      ? 'text-red-600 dark:text-red-400 bg-red-600/10 dark:bg-red-400/10'
      : 'text-amber-600 dark:text-amber-400 bg-amber-600/10 dark:bg-amber-400/10'
  return (
    <span className={cx('text-[11px] font-semibold px-2 py-0.5 rounded-full', cls)}>
      {passes ? 'Pass' : 'Fail'}
    </span>
  )
}

function PairRow({ pair, decorative = false }: { pair: EvaluatedPair; decorative?: boolean }) {
  const isText = pair.pair.intent === 'text'
  return (
    <TableRow className="border-outline-variant/40">
      <TableCell className="w-64">
        <TokenCell name={pair.pair.fg} hex={pair.fgHex} />
      </TableCell>
      <TableCell className="w-52">
        <TokenCell name={pair.pair.bg} hex={pair.bgHex} />
      </TableCell>
      <TableCell className="text-xs text-on-surface-variant pl-3 w-20">
        {isText ? 'Text' : 'UI'}
      </TableCell>
      <TableCell className="text-right font-mono text-sm tabular-nums pl-3">
        {pair.ratio.toFixed(2)}
      </TableCell>
      <TableCell className="text-right font-mono text-sm tabular-nums text-on-surface-variant">
        {decorative ? '—' : pair.effectiveThreshold}
      </TableCell>
      <TableCell className="text-right">
        {decorative ? (
          <StatusBadge decorative />
        ) : (
          <StatusBadge passes={pair.effectivePasses} isText={isText} />
        )}
      </TableCell>
    </TableRow>
  )
}

function GroupHeaderRow({ family, note }: { family: string; note?: string }) {
  return (
    <TableRow className="bg-surface-container-low hover:bg-surface-container-low border-transparent">
      <TableCell
        colSpan={COL_COUNT}
        className="py-1.5 text-xs font-semibold uppercase tracking-wide"
      >
        <span className="text-on-surface">{family}</span>
        {note && (
          <span className="ml-2 font-normal normal-case text-on-surface-variant/70">{note}</span>
        )}
      </TableCell>
    </TableRow>
  )
}

export function ContrastTable({
  functional,
  decorative,
  layer,
  filter,
  resultFilter,
}: ContrastTableProps) {
  const typeMatches = (p: EvaluatedPair) => {
    if (filter === 'all') return true
    const isText = p.pair.intent === 'text'
    return filter === 'text' ? isText : !isText
  }
  const resultMatches = (p: EvaluatedPair) => {
    if (resultFilter === 'all') return true
    return resultFilter === 'fail' ? !p.effectivePasses : p.effectivePasses
  }

  const visibleFunctional = functional.filter((p) => typeMatches(p) && resultMatches(p))
  // why: decorative pairs are WCAG-exempt — they have no pass/fail state, so
  // they only surface under the unfiltered 'all' result view.
  const visibleDecorative = resultFilter === 'all' ? decorative.filter(typeMatches) : []

  const groups = new Map<string, EvaluatedPair[]>()
  for (const p of visibleFunctional) {
    const key = familyOf(p.pair)
    const arr = groups.get(key) ?? []
    arr.push(p)
    groups.set(key, arr)
  }

  const order = familyOrder(layer)
  const ordered = Array.from(groups.entries()).sort(([a], [b]) => {
    const ai = order.indexOf(a)
    const bi = order.indexOf(b)
    return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi)
  })

  // why: failing pairs (against the selected level) bubble to the top of each
  // family so the table reads as a triage list; text before UI, then weakest
  // ratio first.
  for (const [, items] of ordered) {
    items.sort((a, b) => {
      if (a.effectivePasses !== b.effectivePasses) return a.effectivePasses ? 1 : -1
      const ai = a.pair.intent === 'text' ? 0 : 1
      const bi = b.pair.intent === 'text' ? 0 : 1
      if (ai !== bi) return ai - bi
      return a.ratio - b.ratio
    })
  }

  return (
    <Table containerClassName="overflow-x-clip">
      <TableHeader className="sticky top-0 z-10 bg-surface">
        <TableRow className="hover:bg-surface border-outline-variant/60">
          <TableHead>Foreground</TableHead>
          <TableHead>Background</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Ratio</TableHead>
          <TableHead className="text-right">Target</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordered.map(([family, items]) => (
          <Fragment key={family}>
            <GroupHeaderRow family={family} />
            {items.map((p) => (
              <PairRow key={`${p.pair.fg}-${p.pair.bg}`} pair={p} />
            ))}
          </Fragment>
        ))}
        {visibleDecorative.length > 0 && (
          <Fragment>
            <GroupHeaderRow family="Decorative" note="exempt from WCAG" />
            {visibleDecorative.map((p) => (
              <PairRow key={`${p.pair.fg}-${p.pair.bg}`} pair={p} decorative />
            ))}
          </Fragment>
        )}
      </TableBody>
    </Table>
  )
}
