'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { TAILWIND_PALETTE_OKLCH } from '@tonex/core/data'
import { hexFromOklch } from '@tonex/core/oklch'
import { useRef, useState } from 'react'
import { TailwindCSSIcon } from '@/components/icons/tailwind'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInputGroupContent,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { VirtualizedColorList, type Virtualizer } from './virtualized-color-list'

export type ColorItem = { label: string; colorValue: string }
export type ColorGroup = { value: string; items: ColorItem[] }

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function formatTailwindColorsForCombobox(
  palette: Record<string, Record<string, string>>,
): ColorGroup[] {
  return Object.entries(palette).map(([colorFamily, shades]) => {
    const items: ColorItem[] = Object.entries(shades).map(([shade, colorValue]) => {
      const label = shade === 'DEFAULT' ? colorFamily : `${colorFamily}-${shade}`

      return {
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

interface TwColorPickerListProps {
  currentColor: string
  onSelect: (color: string) => void
  disabled?: boolean
}

export function TwColorPicker({
  currentColor,
  onSelect,
  disabled = false,
}: TwColorPickerListProps) {
  const [query, setQuery] = useState('')
  // why: these three refs bridge TwColorPicker ↔ VirtualizedColorList. The
  // child reads filtered items via useComboboxFilteredItems (must live inside
  // the Combobox tree), but the parent's onItemHighlighted runs at the
  // Combobox level. Refs are the bridge; useLayoutEffect in the child syncs
  // them post-commit (per the "Refs sync in useLayoutEffect" rule).
  const virtualizerRef = useRef<Virtualizer | null>(null)
  const itemIndexToFlatIndexRef = useRef<Map<number, number>>(new Map())
  const filteredCountRef = useRef(0)

  const isColorSelected = (color: string) => {
    // why: hexFromOklch can throw on malformed input; falling back to direct
    // string equality keeps the picker functional rather than crashing.
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
        // why: Base UI's highlight `reason` distinguishes filter/programmatic
        // changes (`'none'`, always scroll into view) from keyboard navigation
        // (`'keyboard'`, only scroll at list edges so the highlighted item
        // stays visible without yanking the viewport mid-list).
        const shouldScroll = reason === 'none' || (reason === 'keyboard' && (isStart || isEnd))

        if (shouldScroll) {
          // why: defer to next microtask so the post-filter render commits and
          // the virtualizer can resolve the new flat index correctly before
          // scrollToIndex runs.
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
