import type { MdTokenName } from '@tonex/core/schema'

export interface TokenItem {
  token: MdTokenName
  label: string
  hex: string
}

export interface TokenItemGroup {
  label: string
  items: ReadonlyArray<TokenItem>
}

// why: MD3 splits Primary/Secondary/Tertiary into Fixed siblings; for the
// binding picker that just doubles headers. Merged into the parent group
// here — md-snapshot-picker keeps the original split.
export function collapseFixedGroups(
  groups: ReadonlyArray<TokenItemGroup>,
): ReadonlyArray<TokenItemGroup> {
  const merged = new Map<string, TokenItem[]>()
  const order: string[] = []
  for (const g of groups) {
    const parent = g.label.replace(/ Fixed$/, '')
    if (!merged.has(parent)) {
      merged.set(parent, [])
      order.push(parent)
    }
    const bucket = merged.get(parent)
    if (bucket !== undefined) bucket.push(...g.items)
  }
  return order.map((label) => ({ label, items: merged.get(label) ?? [] }))
}
