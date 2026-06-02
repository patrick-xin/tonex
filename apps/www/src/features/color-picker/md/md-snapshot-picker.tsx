'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import type { Mode } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { MD_PALETTE_FAMILY_NAMES, MD_PALETTE_TONE_NAMES } from '@tonex/core/schema'
import { useResolvedTokens } from '@tonex/core-react'
import { useRef, useState } from 'react'
import { MdIcon } from '@/components/icons/md'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInputGroupContent,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { fuzzyMatches } from '@/lib/fuzzy-match'
import { MD_TOKEN_ITEM_GROUPS } from './md-token-groups'
import { VirtualizedMdList, type Virtualizer } from './virtualized-md-list'

export type PickerItem =
  | { kind: 'role'; key: string; token: string; label: string; hex: string }
  | { kind: 'tone'; key: string; family: string; tone: number; label: string; hex: string }

export interface PickerGroup {
  label: string
  items: ReadonlyArray<PickerItem>
}

interface MdSnapshotPickerProps {
  mode: Mode
  onSnapshot: (hex: string) => void
}

// why: ADR-0026 c.6 — single Combobox, no tabs, virtualized flat list of
// merged roles + tones. The child VirtualizedMdList rebuilds header/item rows
// from `useComboboxFilteredItems`. Borrows the itemIndex↔flatIndex bridge from
// TwColorPicker so onItemHighlighted can scroll-into-view past header rows.
export function MdSnapshotPicker({ mode, onSnapshot }: MdSnapshotPickerProps) {
  const theme = useResolvedTokens()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<PickerItem | null>(null)

  const virtualizerRef = useRef<Virtualizer | null>(null)
  const itemIndexToFlatIndexRef = useRef<Map<number, number>>(new Map())
  const filteredCountRef = useRef(0)

  const merged = theme === null ? null : { ...theme.md[mode], ...theme.md[`${mode}Extended`] }

  const roleGroups: ReadonlyArray<PickerGroup> = MD_TOKEN_ITEM_GROUPS.map((g) => ({
    // why: extended/fixed tokens come from the `${mode}Extended` namespace —
    // rename the legacy "Fixed" label to "Extended" so the picker matches our
    // merged-surface terminology.
    label: g.label.replace(/Fixed$/, 'Extended'),
    items: g.items.map((it) => ({
      kind: 'role' as const,
      key: `role:${it.token}`,
      token: it.token,
      label: it.label,
      hex:
        merged !== null && merged[it.token] !== undefined ? hexString(merged[it.token]) : '#000000',
    })),
  }))

  const toneGroups: ReadonlyArray<PickerGroup> =
    theme === null
      ? []
      : MD_PALETTE_FAMILY_NAMES.map((family) => ({
          label: `${family} tones`,
          items: MD_PALETTE_TONE_NAMES.map((tone) => {
            const argb = theme.md.palette[`--color-${family}-${tone}`]
            return {
              kind: 'tone' as const,
              key: `tone:${family}-${tone}`,
              family,
              tone,
              label: `${family}-${tone}`,
              hex: argb !== undefined ? hexString(argb) : '#000000',
            }
          }),
        }))

  const groups: ReadonlyArray<PickerGroup> = [...roleGroups, ...toneGroups]
  const allItems: PickerItem[] = groups.flatMap((g) => g.items)

  return (
    <Combobox<PickerItem>
      virtualized
      autoHighlight
      items={allItems}
      value={selected}
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(item) => item?.label ?? ''}
      isItemEqualToValue={(item, value) => item.key === value.key}
      filter={(item, q) => fuzzyMatches(item?.label ?? '', q)}
      onItemHighlighted={(item, { reason, index }) => {
        const virtualizer = virtualizerRef.current
        if (!item || !virtualizer) return
        const flatIndex = itemIndexToFlatIndexRef.current.get(index) ?? index
        const isStart = index === 0
        const isEnd = index === filteredCountRef.current - 1
        const shouldScroll = reason === 'none' || (reason === 'keyboard' && (isStart || isEnd))
        if (shouldScroll) {
          queueMicrotask(() => {
            virtualizer.scrollToIndex(flatIndex, { align: isEnd ? 'start' : 'end' })
          })
        }
      }}
      onValueChange={(item) => {
        setSelected(item)
        if (item === null) return
        onSnapshot(item.hex)
        setQuery('')
      }}
    >
      <ComboboxTrigger
        aria-label="Snapshot from MD3"
        render={<Button variant="ghost" size="icon-sm" className="data-popup-open:bg-primary/8" />}
      >
        <MdIcon />
      </ComboboxTrigger>
      <ComboboxContent
        sideOffset={8}
        align="start"
        className="p-0 w-72 max-h-[400px]"
        matchAnchorWidth={false}
      >
        <ComboboxInputGroupContent
          autoFocus
          embedded
          addonIcon={<MagnifyingGlassIcon />}
          placeholder="Search roles or tones…"
          className="min-h-0 py-1"
        />
        <ComboboxEmpty>No tokens found.</ComboboxEmpty>
        <ComboboxList className="flex-1 min-h-0 overflow-hidden p-0">
          <VirtualizedMdList
            groups={groups}
            virtualizerRef={virtualizerRef}
            itemIndexToFlatIndexRef={itemIndexToFlatIndexRef}
            filteredCountRef={filteredCountRef}
          />
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
