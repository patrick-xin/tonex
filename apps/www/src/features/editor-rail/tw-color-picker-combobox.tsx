'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { hexFromOklch, TAILWIND_PALETTE_OKLCH } from '@tonex/core'
import { Check } from 'lucide-react'
import type * as React from 'react'
import { useCallback, useImperativeHandle, useRef, useState } from 'react'
import { TailwindCSSIcon } from '@/components/svg/tailwind'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInputGroupContent,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  useComboboxFilteredItems,
} from '@/components/ui/combobox'
import { ColorSwatch } from './color-swatch'

type ColorItem = { id: string; label: string; colorValue: string }
type ColorGroup = { value: string; items: ColorItem[] }

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function formatTailwindColorsForCombobox(
  palette: Record<string, Record<string, string>>,
): ColorGroup[] {
  return Object.entries(palette).map(([colorFamily, shades]) => {
    const items: ColorItem[] = Object.entries(shades).map(([shade, colorValue]) => {
      const label = shade === 'DEFAULT' ? colorFamily : `${colorFamily}-${shade}`

      return {
        id: label,
        label: label,
        colorValue: colorValue as string,
      }
    })

    return {
      value: capitalize(colorFamily),
      items: items,
    }
  })
}

export const groupedTailwindColors = formatTailwindColorsForCombobox(TAILWIND_PALETTE_OKLCH)

// `virtualized` mode requires a flat array for the `items` prop
const allColorItems: ColorItem[] = groupedTailwindColors.flatMap((g) => g.items)

type Virtualizer = ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>

type HeaderRow = { type: 'header'; label: string }
type ItemRow = { type: 'item'; item: ColorItem; itemIndex: number }
type FlatRow = HeaderRow | ItemRow

/**
 * Flatten filtered items back into groups, interleaving group header rows.
 * `itemIndex` tracks the item's position within filteredItems only (no headers),
 * which matches what Base UI passes to `onItemHighlighted` and used as `index` prop.
 */
function buildFlatRows(
  filteredItems: ColorItem[],
  groups: ColorGroup[],
): { rows: FlatRow[]; itemIndexToFlatIndex: Map<number, number> } {
  const filteredSet = new Set(filteredItems.map((i) => i.id))
  const rows: FlatRow[] = []
  const itemIndexToFlatIndex = new Map<number, number>()
  let itemIndex = 0

  for (const group of groups) {
    const visible = group.items.filter((i) => filteredSet.has(i.id))
    if (visible.length === 0) continue
    rows.push({ type: 'header', label: group.value })
    for (const item of visible) {
      itemIndexToFlatIndex.set(itemIndex, rows.length)
      rows.push({ type: 'item', item, itemIndex: itemIndex++ })
    }
  }

  return { rows, itemIndexToFlatIndex }
}

interface TwColorPickerListProps {
  currentColor: string
  onSelect: (color: string) => void
  disabled?: boolean
}

export function TwColorPickerCombobox({
  currentColor,
  onSelect,
  disabled = false,
}: TwColorPickerListProps) {
  const [query, setQuery] = useState('')
  const virtualizerRef = useRef<Virtualizer | null>(null)
  const itemIndexToFlatIndexRef = useRef<Map<number, number>>(new Map())
  const filteredCountRef = useRef(0)

  const isColorSelected = (color: string) => {
    try {
      return currentColor.toLowerCase() === hexFromOklch(color).toLowerCase()
    } catch {
      return currentColor === color
    }
  }

  const selectedItem = allColorItems.find((item) => isColorSelected(item.colorValue)) ?? null

  return (
    <Combobox<ColorItem>
      disabled={disabled}
      virtualized
      autoHighlight
      items={allColorItems}
      value={selectedItem}
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(item: ColorItem) => item?.label ?? ''}
      filter={(item: ColorItem, q: string) => {
        const label = item?.label ?? ''
        const normalizedLabel = label.replace(/[-_\s]/g, '').toLowerCase()
        const normalizedQuery = q.replace(/[-_\s]/g, '').toLowerCase()
        let queryIdx = 0
        for (let i = 0; i < normalizedLabel.length && queryIdx < normalizedQuery.length; i++) {
          if (normalizedLabel[i] === normalizedQuery[queryIdx]) queryIdx++
        }
        return queryIdx === normalizedQuery.length
      }}
      onItemHighlighted={(item, { reason, index }) => {
        const virtualizer = virtualizerRef.current
        if (!item || !virtualizer) return

        // Map item index → flat row index (which includes headers)
        const flatIndex = itemIndexToFlatIndexRef.current.get(index) ?? index
        const isStart = index === 0
        const isEnd = index === filteredCountRef.current - 1
        const shouldScroll = reason === 'none' || (reason === 'keyboard' && (isStart || isEnd))

        if (shouldScroll) {
          queueMicrotask(() => {
            virtualizer.scrollToIndex(flatIndex, {
              align: isEnd ? 'start' : 'end',
            })
          })
        }
      }}
      onValueChange={(item: ColorItem | null) => {
        if (!item) return
        setQuery('')
        onSelect(hexFromOklch(item.colorValue))
      }}
    >
      <ComboboxTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="data-popup-open:bg-primary/8">
            <TailwindCSSIcon className="text-sky-600" />
          </Button>
        }
      />
      <ComboboxContent side="right" className="max-h-max w-48" matchAnchorWidth={false}>
        <ComboboxInputGroupContent
          autoFocus
          embedded
          addonIcon={<MagnifyingGlassIcon />}
          placeholder="Search colors..."
          className="min-h-0 py-1"
        />

        <ComboboxEmpty>No color found.</ComboboxEmpty>
        <ComboboxList className="flex-1 min-h-0 overflow-hidden p-0">
          <VirtualizedColorList
            isColorSelected={isColorSelected}
            virtualizerRef={virtualizerRef}
            itemIndexToFlatIndexRef={itemIndexToFlatIndexRef}
            filteredCountRef={filteredCountRef}
          />
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function VirtualizedColorList({
  isColorSelected,
  virtualizerRef,
  itemIndexToFlatIndexRef,
  filteredCountRef,
}: {
  isColorSelected: (color: string) => boolean
  virtualizerRef: React.RefObject<Virtualizer | null>
  itemIndexToFlatIndexRef: React.RefObject<Map<number, number>>
  filteredCountRef: React.RefObject<number>
}) {
  const filteredItems = useComboboxFilteredItems<ColorItem>()
  const scrollElementRef = useRef<HTMLDivElement | null>(null)

  const { rows, itemIndexToFlatIndex } = buildFlatRows(filteredItems, groupedTailwindColors)

  // Sync refs before any event handlers can fire
  itemIndexToFlatIndexRef.current = itemIndexToFlatIndex
  filteredCountRef.current = filteredItems.length

  const virtualizer = useVirtualizer({
    enabled: true,
    count: rows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: (index) => (rows[index]?.type === 'header' ? 28 : 32),
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
      className="h-[min(12rem,var(--total-size))] max-h-[var(--available-height)] relative overflow-auto overscroll-contain scroll-p-2 no-scrollbar bg-clip-padding mask-[linear-gradient(to_bottom,transparent,black_1.2rem,black_calc(100%-1.2rem),transparent)]"
      style={{ '--total-size': `${totalSize}px` } as React.CSSProperties}
    >
      <ComboboxGroup role="presentation" className="relative w-full" style={{ height: totalSize }}>
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
              key={item.id}
              index={itemIndex}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              value={item}
              aria-setsize={filteredItems.length}
              aria-posinset={itemIndex + 1}
              style={sharedStyle}
            >
              <div className="flex items-center gap-2">
                <ColorSwatch
                  color={item.colorValue}
                  name={item.label}
                  size="md"
                  isSelected={isColorSelected(item.colorValue)}
                />
                {item.label}
              </div>
              <ComboboxItemIndicator className="ml-auto">
                <Check className="size-4" />
              </ComboboxItemIndicator>
            </ComboboxItem>
          )
        })}
      </ComboboxGroup>
    </div>
  )
}
