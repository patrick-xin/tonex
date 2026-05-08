'use client'

import type { Dialog as BaseDialog, Popover as BasePopover } from '@base-ui/react'
import { GithubLogoIcon, QuestionMarkIcon, TwitterLogoIcon } from '@phosphor-icons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useSource } from '@tonex/core'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BarChart3,
  BookOpen,
  Contrast,
  CornerDownLeftIcon,
  Cuboid,
  Download,
  Home,
  LayoutGrid,
  LockIcon,
  LockOpenIcon,
  Moon,
  Palette,
  PanelLeft,
  Settings,
  Square,
  Sun,
} from 'lucide-react'
import { matchSorter } from 'match-sorter'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { MdIcon } from '@/components/icons/md'
import { ShadcnIcon } from '@/components/icons/shadcn'
import { TailwindCSSIcon } from '@/components/icons/tailwind'
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
import {
  checkContrastDialogHandle,
  exportDialogHandle,
  helpDialogHandle,
  shadcnSettingsPopoverHandle,
} from '@/lib/handles'

interface Item {
  value: string
  label: string
  href?: string
  icon: React.ElementType
  shortcut?: string
  handle?: BaseDialog.Handle<null>
  popoverHandle?: BasePopover.Handle<null>
}

interface Group {
  value: string
  items: Item[]
}

const COMPONENTS_SHORTCUTS: Record<
  'theme' | 'shadcn',
  { key: string; label: string; icon: React.ElementType; href: string }[]
> = {
  theme: [
    { key: '1', label: 'Color Roles', icon: LayoutGrid, href: '/theme' },
    { key: '2', label: 'Overview', icon: LayoutGrid, href: '/theme/overview' },
    { key: '3', label: 'Tone Palettes', icon: Palette, href: '/theme/palettes' },
    { key: '4', label: 'Components', icon: Square, href: '/theme/components' },
  ],
  shadcn: [
    { key: '1', label: 'Components', icon: LayoutGrid, href: '/theme/shadcn' },
    { key: '2', label: 'Blocks', icon: Cuboid, href: '/theme/shadcn/blocks' },
    { key: '3', label: 'Dashboard', icon: PanelLeft, href: '/theme/shadcn/dashboard' },
    { key: '4', label: 'Charts', icon: BarChart3, href: '/theme/shadcn/charts' },
    { key: '5', label: 'Palettes', icon: Palette, href: '/theme/shadcn/palettes' },
  ],
}

const BASE_SHORTCUTS: Item[] = [
  {
    icon: Download,
    label: 'Export',
    value: 'export',
    shortcut: 'E',
    handle: exportDialogHandle,
  },
  {
    icon: Contrast,
    label: 'Check Contrast',
    shortcut: '⌘+C',
    value: 'check-contrast',
    handle: checkContrastDialogHandle,
  },
  {
    icon: Settings,
    label: 'Settings',
    shortcut: 'S',
    value: 'settings',
    popoverHandle: shadcnSettingsPopoverHandle,
  },
  {
    icon: QuestionMarkIcon,
    label: 'Help',
    shortcut: 'H',
    value: 'help',
    handle: helpDialogHandle,
  },
]

const links: Item[] = [
  { icon: Home, label: 'Home Page', value: 'home-page', href: '/' },
  { icon: LayoutGrid, label: 'Components', value: 'components', href: '/components' },
  { icon: BookOpen, label: 'Blog', value: 'blog', href: '/blog' },
  { icon: MdIcon, label: 'MD3 Builder', value: 'md3-builder', href: '/theme' },
  { icon: ShadcnIcon, label: 'Shadcn Builder', value: 'shadcn-builder', href: '/theme/shadcn' },
]

const community: Item[] = [
  { icon: GithubLogoIcon, label: 'GitHub', value: 'github' },
  { icon: TwitterLogoIcon, label: 'Twitter', value: 'twitter' },
]

const resources: Item[] = [
  {
    icon: MdIcon,
    label: 'Material Design',
    value: 'material-design',
    href: 'https://m3.material.io/',
  },
  { icon: ShadcnIcon, label: 'Shadcn', value: 'shadcn', href: 'https://ui.shadcn.com/' },
  {
    icon: TailwindCSSIcon,
    label: 'Tailwind CSS',
    value: 'tailwind-css',
    href: 'https://tailwindcss.com/',
  },
]

function usePathShortcuts(): Item[] {
  const pathname = usePathname()
  const isShadcn = pathname.startsWith('/theme/shadcn')
  const isMD3 = !isShadcn && pathname.startsWith('/theme')

  const key = isShadcn ? 'shadcn' : isMD3 ? 'theme' : null
  const componentItems: Item[] = key
    ? COMPONENTS_SHORTCUTS[key].map(({ key: shortcut, label, icon, href }) => ({
        value: `component-${shortcut}`,
        label,
        icon,
        shortcut,
        href,
      }))
    : []

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

export function SiteCommandMenu() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [commandQuery, setCommandQuery] = React.useState('')
  const router = useRouter()
  const shortcuts = usePathShortcuts()
  const seedHexLock = useSource((s) => s.seedHexLock)
  const setSeedHexLock = useSource((s) => s.actions.setSeedHexLock)

  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
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
      icon: resolvedTheme === 'dark' ? Sun : Moon,
      label: resolvedTheme === 'dark' ? 'Switch to light' : 'Switch to dark',
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
