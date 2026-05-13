import { cx } from 'tailwind-variants'
import type { Layer } from '@/lib/layer-context'
import { familyOf, familyOrder } from './grouping'
import { PairCard } from './pair-card'
import type { EvaluatedPair, Level } from './types'

interface CategorySectionProps {
  pairs: EvaluatedPair[]
  intent: 'text' | 'non-text'
  title: string
  target: string
  layer: Layer
}

function CategorySection({ pairs, intent, title, target, layer }: CategorySectionProps) {
  const filtered = pairs.filter((p) => p.pair.intent === intent)
  if (filtered.length === 0) return null

  const groups = new Map<string, EvaluatedPair[]>()
  for (const p of filtered) {
    const key = familyOf(p.pair)
    const arr = groups.get(key) ?? []
    arr.push(p)
    groups.set(key, arr)
  }

  // why: stable display order independent of CONTRAST_PAIRS declaration order.
  // Unknown families (shouldn't happen given familyOf is total) trail.
  const order = familyOrder(layer)
  const ordered = Array.from(groups.entries()).sort(([a], [b]) => {
    const ai = order.indexOf(a)
    const bi = order.indexOf(b)
    return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi)
  })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs font-medium text-on-surface-variant">Target: {target}</span>
      </div>
      <div className="space-y-8">
        {ordered.map(([group, groupItems]) => (
          <div key={group} className="space-y-3">
            <h4 className="font-medium text-sm">{group}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groupItems.map((p) => (
                <PairCard key={`${p.pair.fg}-${p.pair.bg}`} pair={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DecorativeSection({ pairs }: { pairs: EvaluatedPair[] }) {
  if (pairs.length === 0) return null
  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-semibold text-lg">Decorative</h2>
        <span className="text-xs font-medium text-on-surface-variant">
          Exempt from WCAG (M3 spec). Visibility only — low ratio is expected.
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pairs.map((p) => (
          <PairCard key={`${p.pair.fg}-${p.pair.bg}`} pair={p} decorative />
        ))}
      </div>
    </div>
  )
}

interface SectionGroupProps {
  pairs: EvaluatedPair[]
  statusLabel: 'Failing' | 'Passing'
  level: Level
  layer: Layer
}

export function SectionGroup({ pairs, statusLabel, level, layer }: SectionGroupProps) {
  if (pairs.length === 0) return null
  return (
    <div className="space-y-2">
      <div
        className={cx(
          'font-semibold text-lg',
          statusLabel === 'Failing' ? 'text-error' : 'text-green-600 dark:text-green-400',
        )}
      >
        {statusLabel} Results
      </div>
      <div className="space-y-6">
        <CategorySection
          pairs={pairs}
          intent="text"
          title="Text Readability"
          target={level === 'aaa' ? '7.0:1' : '4.5:1'}
          layer={layer}
        />
        <CategorySection
          pairs={pairs}
          intent="non-text"
          title="UI Components"
          target={level === 'aaa' ? '4.5:1' : '3.0:1'}
          layer={layer}
        />
      </div>
    </div>
  )
}
