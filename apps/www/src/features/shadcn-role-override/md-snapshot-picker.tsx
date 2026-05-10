'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { type Mode, useResolvedTokens } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { MD_PALETTE_FAMILY_NAMES, MD_PALETTE_TONE_NAMES } from '@tonex/core/schema'
import { useMemo, useState } from 'react'
import { MdIcon } from '@/components/icons/md'
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInputGroupContent,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteRow,
} from '@/components/ui/autocomplete'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInputGroupContent,
  ComboboxItemContent,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  createPopoverHandle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import {
  createTooltipHandle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fuzzyMatches } from './fuzzy-filter'
import { MD_TOKEN_ITEM_GROUPS, type MdTokenItem } from './md-token-groups'

interface MdSnapshotPickerProps {
  mode: Mode
  onSnapshot: (hex: string) => void
}

// why: ADR-0026 c.6 — replaces the inline Selects with the legacy
// md3-color-picker shape: MD-icon trigger → tabs (Roles | Tones), each tab a
// dedicated picker. Both panels read live from `useResolvedTokens()` so the
// snapshot reflects the same merged md surface the canvas shows. The picker
// is "dumb" — it only emits hex strings; the host wires them into
// `setShadcnRoleOverride`.
export function MdSnapshotPicker({ mode, onSnapshot }: MdSnapshotPickerProps) {
  const handle = createPopoverHandle()

  const handleSnapshot = (hex: string) => {
    onSnapshot(hex)
    handle.close()
  }

  return (
    <Popover handle={handle}>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon-sm" className="data-popup-open:bg-primary/8" />}
      >
        <MdIcon />
      </PopoverTrigger>
      <PopoverContent
        sideOffset={8}
        align="start"
        className="p-0 overflow-hidden w-80"
        matchAnchorWidth={false}
      >
        <Tabs defaultValue="roles" className="h-[400px] flex flex-col gap-0">
          <div className="flex items-center justify-between py-1 px-2 border-b border-b-outline-variant">
            <div className="text-sm font-medium flex items-center gap-2">
              <MdIcon className="size-4" />
              <span>MD3</span>
            </div>
            <TabsListContent>
              <TabsTab value="roles" className="text-xs px-3 py-1">
                Roles
              </TabsTab>
              <TabsTab value="tones" className="text-xs px-3 py-1">
                Tones
              </TabsTab>
            </TabsListContent>
          </div>
          <TabsPanel keepMounted value="roles" className="flex flex-col flex-1 min-h-0">
            <RolesPanel mode={mode} onSnapshot={handleSnapshot} />
          </TabsPanel>
          <TabsPanel value="tones" className="flex flex-col flex-1 min-h-0">
            <TonesPanel onSnapshot={handleSnapshot} />
          </TabsPanel>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

interface RoleGroup {
  label: string
  items: ReadonlyArray<MdTokenItem>
}

function RolesPanel({ mode, onSnapshot }: { mode: Mode; onSnapshot: (hex: string) => void }) {
  const theme = useResolvedTokens()
  const [query, setQuery] = useState('')

  // why: read from the same merged md surface the canvas shows so
  // snapshot-on-click matches what the user sees in the swatch row.
  const merged = theme === null ? null : { ...theme.md[mode], ...theme.md[`${mode}Extended`] }

  // why: pre-filter externally with the shared subsequence helper. Drops
  // empty groups so users don't see family headers with no items.
  const filteredGroups = useMemo<ReadonlyArray<RoleGroup>>(() => {
    const q = query.trim()
    if (q === '') return MD_TOKEN_ITEM_GROUPS
    return MD_TOKEN_ITEM_GROUPS.map((g) => ({
      label: g.label,
      items: g.items.filter((it) => fuzzyMatches(it.label, q) || fuzzyMatches(it.token, q)),
    })).filter((g) => g.items.length > 0)
  }, [query])

  return (
    <Combobox<MdTokenItem>
      items={filteredGroups}
      autoHighlight
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(item) => item?.label ?? ''}
      onValueChange={(item) => {
        if (item === null || merged === null) return
        const argb = merged[item.token]
        if (argb === undefined) return
        onSnapshot(hexString(argb))
        setQuery('')
      }}
    >
      <ComboboxInputGroupContent
        autoFocus
        embedded
        addonIcon={<MagnifyingGlassIcon />}
        placeholder="Search roles..."
        className="min-h-0 py-1"
      />
      <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0">
        <ComboboxEmpty>No role found.</ComboboxEmpty>
        <ComboboxList>
          {(group: RoleGroup) => (
            <ComboboxGroup key={group.label} items={group.items}>
              <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
              <ComboboxCollection>
                {(item: MdTokenItem) => {
                  const swatchHex =
                    merged !== null && merged[item.token] !== undefined
                      ? hexString(merged[item.token])
                      : '#000000'
                  return (
                    <ComboboxItemContent key={item.token} value={item} indicatorPlacement="end">
                      <div
                        className="size-5 rounded-sm ring-1 ring-outline-variant/40 shrink-0"
                        style={{ backgroundColor: swatchHex }}
                      />
                      <span className="font-mono text-xs">{item.label}</span>
                    </ComboboxItemContent>
                  )
                }}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ScrollArea>
    </Combobox>
  )
}

interface ToneItem {
  family: string
  tone: number
  hex: string
  label: string
}

interface ToneGroup {
  label: string
  items: ReadonlyArray<ToneItem>
}

const TONE_GRID_COLUMNS = 7

function chunk<T>(arr: ReadonlyArray<T>, size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const tonesTooltipHandle = createTooltipHandle<ToneItem>()

function TonesPanel({ onSnapshot }: { onSnapshot: (hex: string) => void }) {
  const theme = useResolvedTokens()
  const [query, setQuery] = useState('')

  // why: tone groups are theme-derived (78 entries: 6 families × 13 tones).
  // Memoize so identity is stable across query changes — only the filter
  // recomputes per keystroke, not the hex resolution.
  const allGroups = useMemo<ReadonlyArray<ToneGroup>>(() => {
    if (theme === null) return []
    return MD_PALETTE_FAMILY_NAMES.map((family) => ({
      label: family,
      items: MD_PALETTE_TONE_NAMES.map((tone) => {
        const argb = theme.md.palette[`--md-ref-palette-${family}-${tone}`]
        return {
          family,
          tone,
          hex: argb !== undefined ? hexString(argb) : '#000000',
          label: `${family}-${tone}`,
        }
      }),
    }))
  }, [theme])

  const filteredGroups = useMemo<ReadonlyArray<ToneGroup>>(() => {
    const q = query.trim()
    if (q === '') return allGroups
    return allGroups
      .map((g) => ({
        label: g.label,
        items: g.items.filter((it) => fuzzyMatches(it.label, q)),
      }))
      .filter((g) => g.items.length > 0)
  }, [allGroups, query])

  if (theme === null) return null

  return (
    <Autocomplete
      grid
      items={filteredGroups}
      value={query}
      onValueChange={(value, details) => {
        // why: item-press fires when a swatch is clicked — don't echo the
        // item's stringified value into the search input, mirroring the
        // legacy emoji picker example.
        if (details.reason !== 'item-press') setQuery(value)
      }}
    >
      <AutocompleteInputGroupContent
        autoFocus
        embedded
        addonIcon={<MagnifyingGlassIcon />}
        placeholder="Search tones (e.g. primary 60)…"
        className="min-h-0 py-1"
      />
      <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0">
        <AutocompleteEmpty>No tone found.</AutocompleteEmpty>
        <TooltipProvider>
          <AutocompleteList>
            {(group: ToneGroup) => (
              <AutocompleteGroup key={group.label} items={group.items}>
                <AutocompleteGroupLabel>{group.label}</AutocompleteGroupLabel>
                <div className="p-2" role="presentation">
                  {chunk(group.items, TONE_GRID_COLUMNS).map((row) => (
                    <AutocompleteRow key={row[0]?.label} className="grid grid-cols-7 gap-1 w-full">
                      {row.map((item) => (
                        <TooltipTrigger
                          key={item.label}
                          handle={tonesTooltipHandle}
                          payload={item}
                          render={
                            <AutocompleteItem
                              value={item}
                              onClick={() => onSnapshot(item.hex)}
                              className="p-0 size-7 rounded-sm cursor-pointer ring-1 ring-outline-variant/30 data-highlighted:ring-2 data-highlighted:ring-primary"
                              style={{ backgroundColor: item.hex }}
                            />
                          }
                        />
                      ))}
                    </AutocompleteRow>
                  ))}
                </div>
              </AutocompleteGroup>
            )}
          </AutocompleteList>
        </TooltipProvider>
        <Tooltip handle={tonesTooltipHandle}>
          {({ payload }) => (
            <TooltipContent className="flex flex-col gap-0.5">
              <span className="text-xs font-mono">
                {payload?.family}-{payload?.tone}
              </span>
              <span className="text-xs font-mono">{payload?.hex}</span>
            </TooltipContent>
          )}
        </Tooltip>
      </ScrollArea>
    </Autocomplete>
  )
}
