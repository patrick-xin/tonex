'use client'

import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { type Mode, useResolvedTokens } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { MD_PALETTE_FAMILY_NAMES, MD_PALETTE_TONE_NAMES } from '@tonex/core/schema'
import { matchSorter } from 'match-sorter'
import { useState } from 'react'
import { MdIcon } from '@/components/icons/md'
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
import { Input } from '@/components/ui/input'
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

const ROLE_GROUPS: ReadonlyArray<RoleGroup> = MD_TOKEN_ITEM_GROUPS

function RolesPanel({ mode, onSnapshot }: { mode: Mode; onSnapshot: (hex: string) => void }) {
  const theme = useResolvedTokens()
  const [query, setQuery] = useState('')

  // why: read from the same merged md surface the canvas shows so
  // snapshot-on-click matches what the user sees in the swatch row.
  const merged = theme === null ? null : { ...theme.md[mode], ...theme.md[`${mode}Extended`] }

  return (
    <Combobox<MdTokenItem>
      items={ROLE_GROUPS}
      inputValue={query}
      onInputValueChange={setQuery}
      itemToStringLabel={(item) => item?.label ?? ''}
      filter={(item, q) =>
        !q ||
        matchSorter([item], q, {
          keys: [
            { key: 'label', threshold: matchSorter.rankings.ACRONYM },
            { key: 'token', threshold: matchSorter.rankings.ACRONYM },
          ],
        }).length > 0
      }
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

const tonesTooltipHandle = createTooltipHandle<{ family: string; tone: number; hex: string }>()

function TonesPanel({ onSnapshot }: { onSnapshot: (hex: string) => void }) {
  const theme = useResolvedTokens()
  const [query, setQuery] = useState('')

  // why: search is a *highlight* affordance (dim non-matches in place) rather
  // than a reflow — the at-a-glance grid is the whole reason tones is a
  // separate tab from the roles list. Empty query = full opacity everywhere.
  const trimmed = query.trim().toLowerCase()
  const matches = (label: string) => trimmed === '' || label.toLowerCase().includes(trimmed)

  if (theme === null) return null

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-2 py-1 border-b border-b-outline-variant">
        <Input
          autoComplete="off"
          inputSize="sm"
          placeholder="Search tones (e.g. primary 60)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          className="text-xs"
        />
      </div>
      <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0">
        <TooltipProvider>
          <div className="space-y-3 p-2">
            {MD_PALETTE_FAMILY_NAMES.map((family) => (
              <div key={family}>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider mb-2">
                  {family}
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {MD_PALETTE_TONE_NAMES.map((tone) => {
                    const argb = theme.md.palette[`--md-ref-palette-${family}-${tone}`]
                    if (argb === undefined) return null
                    const hex = hexString(argb)
                    const label = `${family}-${tone}`
                    const dim = !matches(label)
                    return (
                      <TooltipTrigger
                        handle={tonesTooltipHandle}
                        payload={{ family, tone, hex }}
                        key={tone}
                        onClick={() => onSnapshot(hex)}
                        className={`group relative outline-none transition-opacity ${
                          dim ? 'opacity-25' : 'opacity-100'
                        }`}
                      >
                        <div
                          className="size-7 rounded-sm ring-1 ring-outline-variant/30 cursor-pointer"
                          style={{ backgroundColor: hex }}
                        />
                      </TooltipTrigger>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
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
    </div>
  )
}
