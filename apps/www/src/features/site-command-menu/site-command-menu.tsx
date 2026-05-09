'use client'

import { useHotkey } from '@tanstack/react-hotkeys'
import { useSource } from '@tonex/core'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CornerDownLeftIcon,
  LockIcon,
  LockOpenIcon,
  Moon,
  Sun,
} from 'lucide-react'
import { matchSorter } from 'match-sorter'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandCollection,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandMenu,
  CommandMenuContent,
  CommandMenuFooter,
  CommandMenuTrigger,
  CommandScrollArea,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command-menu'
import { DialogTrigger } from '@/components/ui/dialog'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { useThemeToggle } from '@/features/theme-mode'
import type { NavTab } from '@/lib/nav-config'
import { community, links, resources } from './_links'
import { BASE_SHORTCUTS, type Group, type Item } from './_shortcuts'

// why: page shortcuts derive from the route's NavConfig.tabs (passed in by the
// layout). Same source of truth as NavTabs, so the command menu and the top
// tabs can't drift — adding a tab updates both surfaces in one edit.
function buildPageShortcuts(tabs: NavTab[]): Item[] {
  const componentItems: Item[] = tabs.map((tab, index) => ({
    value: `component-${index + 1}`,
    label: tab.label,
    icon: tab.icon,
    shortcut: String(index + 1),
    href: tab.href,
  }))

  return [...componentItems, ...BASE_SHORTCUTS]
}

function fuzzyFilter(item: Item, query: string): boolean {
  if (!query) return true

  const results = matchSorter([item], query, {
    keys: [
      'label',
      'value',
      { key: 'label', threshold: matchSorter.rankings.CONTAINS },
      { key: 'value', threshold: matchSorter.rankings.WORD_STARTS_WITH },
    ],
  })

  return results.length > 0
}

export function SiteCommandMenu({ pageShortcuts }: { pageShortcuts: NavTab[] }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [commandQuery, setCommandQuery] = React.useState('')
  const router = useRouter()
  const shortcuts = buildPageShortcuts(pageShortcuts)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const setSeedHexLock = useSource((s) => s.actions.setSeedHexLock)

  const { isDark, toggle: toggleTheme } = useThemeToggle()
  const toggleLock = () => setSeedHexLock(!seedHexLock)

  useHotkey('Mod+K', () => setIsOpen((prev) => !prev), {
    conflictBehavior: 'replace',
  })

  const dynamicShortcuts: Item[] = [
    {
      icon: seedHexLock ? LockOpenIcon : LockIcon,
      label: seedHexLock ? 'Unlock color' : 'Lock color',
      value: 'lock-color',
      shortcut: '⌘+L',
    },
    {
      icon: isDark ? Sun : Moon,
      label: isDark ? 'Switch to light' : 'Switch to dark',
      shortcut: 'D',
      value: 'toggle-theme-mode',
    },
  ]

  const groupedItems: Group[] = [
    { items: links, value: 'Links' },
    { items: [...shortcuts, ...dynamicShortcuts], value: 'Shortcuts' },
    { items: community, value: 'Community' },
    { items: resources, value: 'Resources' },
  ]

  function handleItemClick(item: Item) {
    if (!item.href) return
    setIsOpen(false)
    setCommandQuery('')
    if (item.href.startsWith('http')) {
      window.open(item.href, '_blank', 'noopener,noreferrer')
    } else {
      router.push(item.href)
    }
  }

  React.useEffect(() => {
    if (!isOpen) setCommandQuery('')
  }, [isOpen])

  return (
    <CommandMenu onOpenChange={setIsOpen} open={isOpen}>
      <CommandMenuTrigger render={<Button size="sm" variant="secondary" />}>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </CommandMenuTrigger>
      <CommandMenuContent aria-label="Command menu">
        <Command
          filter={fuzzyFilter}
          items={groupedItems}
          onValueChange={setCommandQuery}
          value={commandQuery}
        >
          <CommandInput
            actionsMode="clear"
            variant="ghost"
            autoFocus
            className="caret-primary border-0 border-b border-b-outline-variant"
            inputSize="lg"
            placeholder="Search site..."
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandScrollArea gradientScrollFade noScrollBar>
            <CommandList>
              {(group: Group) => (
                <React.Fragment key={group.value}>
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.value}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: Item) => {
                        const Icon = item.icon
                        const content = (
                          <>
                            <Icon className="size-4 text-on-surface-variant group-data-highlighted/command-item:text-on-surface" />
                            {item.label}
                            {item.shortcut && (
                              <CommandShortcut className="hidden md:block">
                                {item.shortcut}
                              </CommandShortcut>
                            )}
                          </>
                        )

                        if (item.handle) {
                          return (
                            <DialogTrigger
                              nativeButton={false}
                              key={item.value}
                              handle={item.handle}
                              render={<CommandItem value={item} onClick={() => setIsOpen(false)} />}
                            >
                              {content}
                            </DialogTrigger>
                          )
                        }

                        if (item.popoverHandle) {
                          return (
                            <CommandItem
                              key={item.value}
                              value={item}
                              onClick={() => {
                                item.popoverHandle?.open('shadcn-settings')
                                setIsOpen(false)
                              }}
                            >
                              {content}
                            </CommandItem>
                          )
                        }

                        if (item.value === 'lock-color') {
                          return (
                            <CommandItem
                              key={item.value}
                              value={item}
                              onClick={() => {
                                toggleLock()
                                setIsOpen(false)
                              }}
                            >
                              {content}
                            </CommandItem>
                          )
                        }

                        if (item.value === 'toggle-theme-mode') {
                          return (
                            <CommandItem
                              key={item.value}
                              value={item}
                              onClick={() => {
                                toggleTheme()
                                setIsOpen(false)
                              }}
                            >
                              {content}
                            </CommandItem>
                          )
                        }

                        return (
                          <CommandItem
                            key={item.value}
                            onClick={() => handleItemClick(item)}
                            value={item}
                          >
                            {content}
                          </CommandItem>
                        )
                      }}
                    </CommandCollection>
                  </CommandGroup>
                  <CommandSeparator />
                </React.Fragment>
              )}
            </CommandList>
          </CommandScrollArea>
        </Command>

        <CommandMenuFooter className="hidden md:flex">
          <div className="flex items-center gap-2">
            <KbdGroup>
              <Kbd>
                <ArrowUpIcon />
              </Kbd>
              <Kbd>
                <ArrowDownIcon />
              </Kbd>
            </KbdGroup>
            <span>Navigate</span>
          </div>

          <div className="flex items-center gap-2">
            <Kbd>
              <CornerDownLeftIcon />
            </Kbd>
            <span>Activate</span>
          </div>
        </CommandMenuFooter>
      </CommandMenuContent>
    </CommandMenu>
  )
}
