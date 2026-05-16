'use client'

import {
  ArrowCounterClockwiseIcon,
  MagnifyingGlassIcon,
  PaletteIcon,
  TextAaIcon,
} from '@phosphor-icons/react'
import { useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import {
  DEFAULT_SHADCN_ROLE_BINDINGS,
  type MdTokenName,
  type ShadcnRoleName,
} from '@tonex/core/schema'
import { useMemo, useState } from 'react'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInputGroupContent,
  ComboboxItemContent,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { MD_TOKEN_ITEM_GROUPS } from '@/features/color-picker'
import { ROLE_GROUPS } from '@/features/shadcn-override'
import { useActiveMode } from '@/features/theme-mode'
import { fuzzyMatches } from '@/lib/fuzzy-match'

interface TokenItem {
  token: MdTokenName
  label: string
  hex: string
}

interface TokenItemGroup {
  label: string
  items: ReadonlyArray<TokenItem>
}

type Category = 'colors' | 'text-colors'

const STRIP_PREFIX = /^--color-/

// why: MD3 splits each role into a fill token and an on-* / inverse-on-*
// text counterpart. Binding a shadcn role to the wrong category is the most
// common picker error, so the popup surfaces it as a toggle and defaults to
// the category the current binding already belongs to.
function isTextColorToken(token: string): boolean {
  return token.startsWith('--color-on-') || token.startsWith('--color-inverse-on-')
}

// why: MD3's spec keeps `Primary Fixed` / `Secondary Fixed` / `Tertiary Fixed`
// as separate role families, but for the binding picker that just doubles the
// number of group headers users have to scan — fixed and non-fixed tokens
// answer the same question ("which primary-ish color do I want"). Collapsing
// them into the parent group also keeps the text-colors toggle view tidy:
// `on-primary` and `on-primary-fixed` land in the same `Primary` group
// instead of splitting into a tiny `Primary Fixed` header. md-snapshot-picker
// keeps the original split — this merge is local to the bindings picker.
function collapseFixedGroups(groups: ReadonlyArray<TokenItemGroup>): ReadonlyArray<TokenItemGroup> {
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

// why: prototype rail-takeover bindings editor. Single mode (current) — much
// less dense than the testbed's two-column shape. Per-role Combobox with
// fuzzy search, grouped option list (mirrors override picker semantics from
// MD_TOKEN_ITEM_GROUPS) and a per-popup swatch/text toggle. Auto-saves via
// setShadcnRoleBinding on every change.
export function ShadcnBindingsContent() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const bindings = useSource((s) => s.shadcnRoleBindings)
  const setBinding = useSource((s) => s.actions.setShadcnRoleBinding)

  if (theme === null || mode === null) return null

  // why: merge core md tokens with extended (`${mode}Extended`) so the picker
  // covers the full 49-name domain. Same trick as MdSnapshotPicker.
  const merged = { ...theme.md[mode], ...theme.md[`${mode}Extended`] }
  const tokenItemGroups: ReadonlyArray<TokenItemGroup> = collapseFixedGroups(
    MD_TOKEN_ITEM_GROUPS.map((g) => ({
      label: g.label,
      items: g.items.map((it) => ({
        token: it.token,
        label: it.label,
        hex: merged[it.token] !== undefined ? hexString(merged[it.token]) : '#000000',
      })),
    })),
  )
  const tokenItems: ReadonlyArray<TokenItem> = tokenItemGroups.flatMap((g) => g.items)

  return (
    <div className="flex flex-col gap-2">
      {ROLE_GROUPS.map((group) => (
        <AnimatedCollapsible key={group.label} title={group.label} variant="ghost" height={0}>
          <section key={group.label} className="flex flex-col gap-4">
            {group.roles.map((role) => {
              const argb = theme.shadcn[mode][role]
              const roleHex = argb !== undefined ? hexString(argb) : '#000000'
              return (
                <BindingRow
                  key={role}
                  role={role}
                  roleHex={roleHex}
                  currentToken={bindings[mode][role]}
                  defaultToken={DEFAULT_SHADCN_ROLE_BINDINGS[mode][role]}
                  tokenItems={tokenItems}
                  tokenItemGroups={tokenItemGroups}
                  onChange={(token) => setBinding(mode, role, token)}
                  onReset={() => setBinding(mode, role, DEFAULT_SHADCN_ROLE_BINDINGS[mode][role])}
                />
              )
            })}
          </section>
        </AnimatedCollapsible>
      ))}
    </div>
  )
}

interface BindingRowProps {
  role: ShadcnRoleName
  roleHex: string
  currentToken: MdTokenName
  defaultToken: MdTokenName
  tokenItems: ReadonlyArray<TokenItem>
  tokenItemGroups: ReadonlyArray<TokenItemGroup>
  onChange: (token: MdTokenName) => void
  onReset: () => void
}

function BindingRow({
  role,
  roleHex,
  currentToken,
  defaultToken,
  tokenItems,
  tokenItemGroups,
  onChange,
  onReset,
}: BindingRowProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>(
    isTextColorToken(currentToken) ? 'text-colors' : 'colors',
  )
  const isCustom = currentToken !== defaultToken
  const selected = tokenItems.find((it) => it.token === currentToken) ?? null
  const triggerLabel = selected?.label ?? currentToken.replace(STRIP_PREFIX, '')

  // why: pre-filter by category at the items source. Base UI Combobox re-runs
  // `filter` on inputValue change, not on closure-captured state, so toggling
  // category needs to change `items` to take effect. We pass the grouped
  // shape — Base UI handles per-group rendering via the List/Group/Collection
  // render-prop chain and assigns item indices internally (matching the
  // official docs structure).
  const categoryGroups = useMemo(
    () =>
      tokenItemGroups
        .map((g) => ({
          label: g.label,
          items: g.items.filter((item) => {
            const isText = isTextColorToken(item.token)
            return category === 'text-colors' ? isText : !isText
          }),
        }))
        .filter((g) => g.items.length > 0),
    [tokenItemGroups, category],
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span
          className="size-6 rounded ring-1 ring-outline-variant/70 shrink-0"
          style={{ backgroundColor: roleHex }}
          aria-hidden="true"
        />
        <div className="text-xs font-mono flex-1 min-w-0 truncate text-on-surface-variant">
          {role}
        </div>
        {isCustom && (
          <Button variant="ghost" size="icon-xs" onClick={onReset} title="Reset to default">
            <ArrowCounterClockwiseIcon />
          </Button>
        )}
      </div>
      <Combobox<TokenItem>
        autoHighlight
        items={categoryGroups}
        value={selected}
        inputValue={query}
        onInputValueChange={setQuery}
        itemToStringLabel={(item) => item?.label ?? ''}
        isItemEqualToValue={(a, b) => a.token === b.token}
        filter={(item, q) => {
          if (!item) return false
          return fuzzyMatches(item.label, q)
        }}
        onValueChange={(item) => {
          if (item !== null) onChange(item.token)
          setQuery('')
        }}
      >
        <ComboboxTrigger
          aria-label={`Bind ${role}`}
          render={
            <Button
              variant="outline"
              size="sm"
              className="data-popup-open:bg-primary/8 font-mono text-xs justify-start"
            >
              <span className="truncate">{triggerLabel}</span>
            </Button>
          }
        />
        <ComboboxContent align="end" sideOffset={8} matchAnchorWidth={false} className="w-72">
          {/* why: input + category toggle share one row. Keeping nothing
              between the input and the List preserves Base UI's canonical
              parent chain (List → Group → Collection → Item), which is what
              its hover-on-open and scroll-to-selected wiring assumes. */}
          <div className="flex items-stretch border-b border-outline-variant">
            <ComboboxInputGroupContent
              embedded
              addonIcon={<MagnifyingGlassIcon />}
              placeholder="Search md tokens…"
              className="flex-1 border-b-transparent"
            />
            <div className="flex items-center pr-2">
              <ToggleGroup
                variant="outline"
                size="xs"
                value={[category]}
                onValueChange={(v) => {
                  const next = v[0]
                  if (next === 'colors' || next === 'text-colors') setCategory(next)
                }}
                aria-label="Token category"
              >
                <ToggleGroupItem value="colors" aria-label="Background / fill colors">
                  <PaletteIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="text-colors" aria-label="Text / on-* colors">
                  <TextAaIcon />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <ComboboxEmpty>No match.</ComboboxEmpty>
          <ScrollArea noScrollBar gradientScrollFade className="flex-1 min-h-0 overflow-auto py-1">
            {/* why: render-prop chain mirrors the Base UI docs example exactly.
              Passing `items={group.items}` on each Group is what registers
              the items into the right slice of listRef, so useListNavigation
              can resolve `listRef.current[selectedIndex]` synchronously on
              open — fixes both hover-on-open and scroll-to-selected without
              needing manual onItemHighlighted scroll workarounds. */}
            <ComboboxList>
              {(group: TokenItemGroup) => (
                <ComboboxGroup key={group.label} items={group.items as TokenItem[]}>
                  <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
                  <ComboboxCollection>
                    {(item: TokenItem) => (
                      <ComboboxItemContent key={item.token} value={item} indicatorPlacement="end">
                        <span
                          className="size-6 rounded ring-1 ring-scrim/10 shrink-0"
                          style={{ backgroundColor: item.hex }}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-xs">{item.label}</span>
                      </ComboboxItemContent>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ScrollArea>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
