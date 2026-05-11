'use client'

import { ArrowCounterClockwiseIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import {
  DEFAULT_SHADCN_ROLE_BINDINGS,
  MD_TOKEN_NAMES,
  type MdTokenName,
  type ShadcnRoleName,
} from '@tonex/core/schema'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInputGroupContent,
  ComboboxItemContent,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/combobox'
import { fuzzyMatches } from '@/features/shadcn-role-override/fuzzy-filter'
import { ROLE_GROUPS } from '@/features/shadcn-role-override/role-groups'
import { useActiveMode } from '@/features/theme-mode'
import { AnimatedCollapsible } from '../../components/shared/animated-collapsible'

interface TokenItem {
  token: MdTokenName
  hex: string
}

// why: prototype rail-takeover bindings editor. Single mode (current) — much
// less dense than the testbed's two-column shape. Per-role Combobox with
// fuzzy search and swatch-prefixed options so the user sees what they're
// binding to. Auto-saves via setShadcnRoleBinding on every change.
export function ShadcnBindingsContent() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const bindings = useSource((s) => s.shadcnRoleBindings)
  const setBinding = useSource((s) => s.actions.setShadcnRoleBinding)

  if (theme === null || mode === null) return null

  // why: merge core md tokens with extended (`${mode}Extended`) so the picker
  // covers the full 49-name domain. Same trick as MdSnapshotPicker.
  const merged = { ...theme.md[mode], ...theme.md[`${mode}Extended`] }
  const tokenItems: ReadonlyArray<TokenItem> = MD_TOKEN_NAMES.map((token) => ({
    token,
    hex: merged[token] !== undefined ? hexString(merged[token]) : '#000000',
  }))

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
  onChange: (token: MdTokenName) => void
  onReset: () => void
}

function BindingRow({
  role,
  roleHex,
  currentToken,
  defaultToken,
  tokenItems,
  onChange,
  onReset,
}: BindingRowProps) {
  const [query, setQuery] = useState('')
  const isCustom = currentToken !== defaultToken
  const selected = tokenItems.find((it) => it.token === currentToken) ?? null

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
        items={tokenItems as TokenItem[]}
        value={selected}
        inputValue={query}
        onInputValueChange={setQuery}
        itemToStringLabel={(item) => item?.token ?? ''}
        isItemEqualToValue={(a, b) => a.token === b.token}
        filter={(item, q) => fuzzyMatches(item?.token ?? '', q)}
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
              <span className="truncate">{currentToken}</span>
            </Button>
          }
        />
        <ComboboxContent align="end" sideOffset={8} matchAnchorWidth={false}>
          <ComboboxInputGroupContent
            embedded
            addonIcon={<MagnifyingGlassIcon />}
            placeholder="Search md tokens…"
          />
          <ComboboxEmpty>No match.</ComboboxEmpty>
          <ComboboxList className="flex-1 min-h-0 overflow-auto">
            {(item) => (
              <ComboboxItemContent indicatorPlacement="end" key={item.token} value={item}>
                <span
                  className="size-6 rounded ring-1 ring-scrim/10 shrink-0"
                  style={{ backgroundColor: item.hex }}
                  aria-hidden="true"
                />
                <span className="font-mono text-xs">{item.token}</span>
              </ComboboxItemContent>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
