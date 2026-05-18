'use client'

import {
  ArrowCounterClockwiseIcon,
  MagnifyingGlassIcon,
  PaletteIcon,
  TextAaIcon,
} from '@phosphor-icons/react'
import { hexString } from '@tonex/core/oklch'
import type { MdTokenName, ShadcnRoleName } from '@tonex/core/schema'
import { useMemo, useState } from 'react'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { ContrastBadge } from '@/components/shared/contrast-badge'
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
import type { ContrastWarning } from '@/features/contrast-checker/warning'
import { ROLE_GROUPS } from '@/features/shadcn-override'
import { fuzzyMatches } from '@/lib/fuzzy-match'
import { type TokenItem, type TokenItemGroup, useBindingData } from './use-binding-data'

type Category = 'colors' | 'text-colors'

function isTextColorToken(token: string): boolean {
  return token.startsWith('--color-on-') || token.startsWith('--color-inverse-on-')
}

export function ShadcnBindingsContent() {
  const data = useBindingData()
  if (data === null) return null
  const {
    bindings,
    defaults,
    setBinding,
    roleLayer,
    roleContrastByRole,
    tokenItems,
    tokenItemGroups,
  } = data

  return (
    <div className="flex flex-col">
      {ROLE_GROUPS.map((group, index) => (
        <AnimatedCollapsible
          key={group.label}
          title={group.label}
          variant="ghost"
          defaultOpen={index === 0}
          height={0}
          className="text-sm font-semibold capitalize tracking-wider"
          overridden={group.roles.some((role) => bindings[role] !== defaults[role])}
        >
          <div className="flex flex-col gap-4 pb-2">
            {group.roles.map((role) => {
              const argb = roleLayer[role]
              const roleHex = argb !== undefined ? hexString(argb) : '#000000'
              return (
                <BindingRow
                  key={role}
                  role={role}
                  roleHex={roleHex}
                  contrast={roleContrastByRole.get(role) ?? null}
                  currentToken={bindings[role]}
                  defaultToken={defaults[role]}
                  tokenItems={tokenItems}
                  tokenItemGroups={tokenItemGroups}
                  onChange={(token) => setBinding(role, token)}
                  onReset={() => setBinding(role, defaults[role])}
                />
              )
            })}
          </div>
        </AnimatedCollapsible>
      ))}
    </div>
  )
}

interface BindingRowProps {
  role: ShadcnRoleName
  roleHex: string
  contrast: ContrastWarning | null
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
  contrast,
  currentToken,
  defaultToken,
  tokenItems,
  tokenItemGroups,
  onChange,
  onReset,
}: BindingRowProps) {
  const isCustom = currentToken !== defaultToken

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span
          className="size-6 rounded ring-1 ring-outline-variant/70 shrink-0"
          style={{ backgroundColor: roleHex }}
          aria-hidden="true"
        />
        <div className="text-xs font-mono flex-1 min-w-0 truncate text-on-surface">
          {role.slice(2)}
        </div>
        <ContrastBadge warning={contrast} />
        {isCustom && (
          <Button variant="ghost" size="icon-xs" onClick={onReset} title="Reset to default">
            <ArrowCounterClockwiseIcon />
          </Button>
        )}
      </div>
      <TokenCombobox
        role={role}
        currentToken={currentToken}
        tokenItems={tokenItems}
        tokenItemGroups={tokenItemGroups}
        onChange={onChange}
      />
    </div>
  )
}

interface TokenComboboxProps {
  role: ShadcnRoleName
  currentToken: MdTokenName
  tokenItems: ReadonlyArray<TokenItem>
  tokenItemGroups: ReadonlyArray<TokenItemGroup>
  onChange: (token: MdTokenName) => void
}

function TokenCombobox({
  role,
  currentToken,
  tokenItems,
  tokenItemGroups,
  onChange,
}: TokenComboboxProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>(
    isTextColorToken(currentToken) ? 'text-colors' : 'colors',
  )
  const selected = tokenItems.find((it) => it.token === currentToken) ?? null
  const triggerLabel = selected?.label ?? currentToken.replace(/^--color-/, '')

  // why: Base UI's `filter` re-runs on inputValue change, not on closure state,
  // so toggling category has to change `items` to take effect.
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
          <ComboboxList>
            {(group: TokenItemGroup) => (
              <ComboboxGroup key={group.label} items={group.items as TokenItem[]}>
                <ComboboxGroupLabel>{group.label}</ComboboxGroupLabel>
                <ComboboxCollection>
                  {(item: TokenItem) => (
                    <ComboboxItemContent key={item.label} value={item} indicatorPlacement="end">
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
  )
}
