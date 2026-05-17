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

// why: groups consecutive same-fg/bg evaluations into one bundle so the table
// can rowSpan the shared cells (fg/bg/ratio) across them. Insertion order is
// preserved so the upstream sort applied by bundlesByFamily is honored at the
// bundle level. Used standalone for the decorative section (no family
// grouping needed there).
function bundle(items: readonly EvaluatedPair[]): EvaluatedPair[][] {
  const bundles = new Map<string, EvaluatedPair[]>()
  const order: string[] = []
  for (const p of items) {
    const key = `${p.pair.fg}|${p.pair.bg}`
    if (!bundles.has(key)) order.push(key)
    const arr = bundles.get(key) ?? []
    arr.push(p)
    bundles.set(key, arr)
  }
  // why: within a bundle, text rows precede UI rows. Same ratio across rows
  // (same colour pair), so this is purely about reading order — stricter
  // WCAG criterion first reads as "first see if it's text-grade, then UI-grade."
  for (const arr of bundles.values()) {
    arr.sort((a, b) => (a.pair.intent === 'text' ? 0 : 1) - (b.pair.intent === 'text' ? 0 : 1))
  }
  return order.map((k) => bundles.get(k) as EvaluatedPair[])
}

// why: groups functional pairs by family then bundles within each family, then
// sorts bundles for triage: failing bundles first (a bundle fails if ANY of
// its rows fail at the selected level), then text-bearing bundles, then
// weakest ratio first. Families themselves are ordered by familyOrder(layer).
function bundlesByFamily(
  items: readonly EvaluatedPair[],
  layer: Layer,
): [string, EvaluatedPair[][]][] {
  const families = new Map<string, EvaluatedPair[]>()
  for (const p of items) {
    const key = familyOf(p.pair)
    const arr = families.get(key) ?? []
    arr.push(p)
    families.set(key, arr)
  }
  const order = familyOrder(layer)
  const result: [string, EvaluatedPair[][]][] = []
  for (const [family, members] of families) {
    const bundles = bundle(members)
    bundles.sort((a, b) => {
      const aPasses = a.every((p) => p.effectivePasses)
      const bPasses = b.every((p) => p.effectivePasses)
      if (aPasses !== bPasses) return aPasses ? 1 : -1
      const aHasText = a.some((p) => p.pair.intent === 'text')
      const bHasText = b.some((p) => p.pair.intent === 'text')
      if (aHasText !== bHasText) return aHasText ? -1 : 1
      return a[0].ratio - b[0].ratio
    })
    result.push([family, bundles])
  }
  result.sort(([a], [b]) => {
    const ai = order.indexOf(a)
    const bi = order.indexOf(b)
    return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi)
  })
  return result
}

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
        <div className="text-xs font-mono">{name.replace(/^--(color-)?/, '')}</div>
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

// why: a "bundle" is 1+ pairs sharing the same fg+bg (a single colour pair
// checked against multiple WCAG criteria — e.g. --destructive used as text @
// 4.5 AND as a non-text fill @ 3). bundleIndex=0 renders fg/bg/ratio with
// rowSpan; subsequent rows in the bundle omit those cells so the colour pair
// reads as one visual block with per-criterion Type/Target/Status on the
// right. Single-row bundles render normally (rowSpan=1 is a no-op).
function PairRow({
  pair,
  decorative = false,
  bundleSize = 1,
  bundleIndex = 0,
}: {
  pair: EvaluatedPair
  decorative?: boolean
  bundleSize?: number
  bundleIndex?: number
}) {
  const isText = pair.pair.intent === 'text'
  const isBundleHead = bundleIndex === 0
  // why: only the last row in a multi-row bundle gets the bottom border so the
  // bundle visually reads as one block; intermediate rows are border-transparent.
  const isBundleTail = bundleIndex === bundleSize - 1
  const rowBorder = isBundleTail ? 'border-outline-variant/40' : 'border-transparent'
  return (
    <TableRow className={rowBorder}>
      {isBundleHead && (
        <>
          <TableCell rowSpan={bundleSize} className="w-64 align-middle">
            <TokenCell name={pair.pair.fg} hex={pair.fgHex} />
          </TableCell>
          <TableCell rowSpan={bundleSize} className="w-52 align-middle">
            <TokenCell name={pair.pair.bg} hex={pair.bgHex} />
          </TableCell>
        </>
      )}
      <TableCell className="text-xs text-on-surface-variant pl-3 w-20">
        {isText ? 'Text' : 'UI'}
      </TableCell>
      {isBundleHead && (
        <TableCell
          rowSpan={bundleSize}
          className="text-right font-mono text-sm tabular-nums pl-3 align-middle"
        >
          {pair.ratio.toFixed(2)}
        </TableCell>
      )}
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

  // why: bundle by fg+bg AFTER filtering so the type/result filters can split a
  // bundle (e.g. filtering to 'fail' on a destructive pair where text fails but
  // UI passes correctly drops the UI row). A bundle is the set of WCAG criteria
  // applied to one colour pair: --destructive on --background gets two rows
  // (text @ 4.5 + non-text @ 3); --primary on --background gets one (text only).
  const orderedFamilies = bundlesByFamily(visibleFunctional, layer)
  const decorativeBundles = bundle(visibleDecorative)

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
        {orderedFamilies.map(([family, familyBundles]) => (
          <Fragment key={family}>
            <GroupHeaderRow family={family} />
            {familyBundles.map((b) =>
              b.map((p, idx) => (
                <PairRow
                  key={`${p.pair.fg}-${p.pair.bg}-${p.pair.intent}`}
                  pair={p}
                  bundleSize={b.length}
                  bundleIndex={idx}
                />
              )),
            )}
          </Fragment>
        ))}
        {decorativeBundles.length > 0 && (
          <Fragment>
            <GroupHeaderRow family="Decorative" note="exempt from WCAG" />
            {decorativeBundles.map((b) =>
              b.map((p, idx) => (
                <PairRow
                  key={`${p.pair.fg}-${p.pair.bg}-${p.pair.intent}`}
                  pair={p}
                  decorative
                  bundleSize={b.length}
                  bundleIndex={idx}
                />
              )),
            )}
          </Fragment>
        )}
      </TableBody>
    </Table>
  )
}
