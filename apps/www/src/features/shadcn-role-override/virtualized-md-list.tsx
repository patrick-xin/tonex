'use client'

import { CheckIcon } from '@phosphor-icons/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type * as React from 'react'
import { useCallback, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import {
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxItemIndicator,
  useComboboxFilteredItems,
} from '@/components/ui/combobox'
import type { PickerGroup, PickerItem } from './md-snapshot-picker'

type Virtualizer = ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>

type HeaderRow = { type: 'header'; label: string }
type ItemRow = { type: 'item'; item: PickerItem; itemIndex: number }
type FlatRow = HeaderRow | ItemRow

// why: filtered items must be flattened back into header-interleaved rows for
// the virtualizer, but `itemIndex` (Base UI's combobox index, what
// onItemHighlighted reports) stays header-free — so we keep a
// Map<itemIndex, flatIndex> bridge from the combobox's index space to the
// virtualizer's row space.
function buildFlatRows(
  filteredItems: PickerItem[],
  groups: ReadonlyArray<PickerGroup>,
): { rows: FlatRow[]; itemIndexToFlatIndex: Map<number, number> } {
  const filteredKeys = new Set(filteredItems.map((i) => i.key))
  const rows: FlatRow[] = []
  const itemIndexToFlatIndex = new Map<number, number>()
  let itemIndex = 0

  for (const group of groups) {
    const visible = group.items.filter((i) => filteredKeys.has(i.key))
    if (visible.length === 0) continue
    rows.push({ type: 'header', label: group.label })
    for (const item of visible) {
      itemIndexToFlatIndex.set(itemIndex, rows.length)
      rows.push({ type: 'item', item, itemIndex: itemIndex++ })
    }
  }

  return { rows, itemIndexToFlatIndex }
}

export type { Virtualizer }

export function VirtualizedMdList({
  groups,
  virtualizerRef,
  itemIndexToFlatIndexRef,
  filteredCountRef,
}: {
  groups: ReadonlyArray<PickerGroup>
  virtualizerRef: React.RefObject<Virtualizer | null>
  itemIndexToFlatIndexRef: React.RefObject<Map<number, number>>
  filteredCountRef: React.RefObject<number>
}) {
  const filteredItems = useComboboxFilteredItems<PickerItem>()
  const scrollElementRef = useRef<HTMLDivElement | null>(null)

  const { rows, itemIndexToFlatIndex } = buildFlatRows(filteredItems, groups)

  useLayoutEffect(() => {
    itemIndexToFlatIndexRef.current = itemIndexToFlatIndex
    filteredCountRef.current = filteredItems.length
  })

  const virtualizer = useVirtualizer({
    enabled: true,
    count: rows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) => (rows[index]?.type === 'header' ? 24 : 32),
    overscan: 20,
    paddingStart: 8,
    paddingEnd: 8,
    scrollPaddingStart: 8,
    scrollPaddingEnd: 8,
  })

  useImperativeHandle(virtualizerRef, () => virtualizer)

  const handleScrollElementRef = useCallback(
    (element: HTMLDivElement | null) => {
      scrollElementRef.current = element
      if (element) virtualizer.measure()
    },
    [virtualizer],
  )

  const totalSize = virtualizer.getTotalSize()

  if (!filteredItems.length) return null

  return (
    <div
      role="presentation"
      ref={handleScrollElementRef}
      className="h-[min(22rem,var(--total-size))] max-h-[var(--available-height)] relative overflow-auto overscroll-contain scroll-p-2 no-scrollbar bg-clip-padding mask-[linear-gradient(to_bottom,transparent,black_1.2rem,black_calc(100%-1.2rem),transparent)]"
      style={{ '--total-size': `${totalSize}px` } as React.CSSProperties}
    >
      <ComboboxGroup
        role="presentation"
        className="relative w-full -mt-2"
        style={{ height: totalSize }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const row = rows[virtualItem.index]
          if (!row) return null

          const sharedStyle: React.CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: virtualItem.size,
            transform: `translateY(${virtualItem.start}px)`,
          }

          if (row.type === 'header') {
            return (
              <ComboboxGroupLabel key={`header-${row.label}`} style={sharedStyle}>
                {row.label}
              </ComboboxGroupLabel>
            )
          }

          const { item, itemIndex } = row
          return (
            <ComboboxItem
              className="flex items-center justify-between pr-3"
              key={item.key}
              index={itemIndex}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              value={item}
              aria-setsize={filteredItems.length}
              aria-posinset={itemIndex + 1}
              style={sharedStyle}
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-6 rounded-sm ring-1 ring-outline-variant/40 shrink-0"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="font-mono text-xs">{item.label}</span>
              </div>
              <ComboboxItemIndicator className="ml-auto">
                <CheckIcon className="size-4" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          )
        })}
      </ComboboxGroup>
    </div>
  )
}
