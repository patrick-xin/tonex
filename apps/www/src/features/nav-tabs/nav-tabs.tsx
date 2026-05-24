'use client'

import type { RegisterableHotkey } from '@tanstack/react-hotkeys'
import { useHotkeys } from '@tanstack/react-hotkeys'
import { AnimatePresence, m } from 'motion/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Tabs, TabsIndicator, TabsList, TabsTab } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ExportButton } from '@/features/export'
import { GuideAnchor } from '@/features/onboarding-guide'
import { Settings } from '@/features/settings'
import { SiteCommandMenu } from '@/features/site-command-menu'
import type { NavConfig } from '@/lib/nav-config'
import { ContrastChecker } from '../contrast-checker'
import { HelpDialog } from '../help-dialog'

// why: ADR-0021 commitment 8 + ADR-0022 commitment 3 — the route layout owns
// audience and layer; this component is route-agnostic and takes everything
// it needs as one config prop. Tabs, export tabs, command-menu shortcuts and
// the cross-layer link all derive from the same source so they can't drift.
export function NavTabs({ config, extras }: { config: NavConfig; extras?: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  const { tabs, exportTabs, crossLink } = config

  useHotkeys(
    tabs.map((tab, index) => ({
      hotkey: String(index + 1) as RegisterableHotkey,
      callback: () => {
        setSelected(index)
        router.push(tab.href)
      },
      options: {
        ignoreInputs: true,
        requireReset: true,
        meta: {
          name: `Go to ${tab.label}`,
          description: `Navigate to ${tab.label} page`,
          group: 'Navigation',
          href: tab.href,
        },
      },
    })),
  )

  useHotkeys(
    tabs.map((tab, index) => ({
      hotkey: `Alt+${index + 1}` as RegisterableHotkey,
      callback: () => router.push(tab.href),
      options: {
        meta: {
          name: `${tab.label} (Alt)`,
          description: `Alternative: Alt+${index + 1}`,
          group: 'Navigation',
          href: tab.href,
        },
      },
    })),
    { conflictBehavior: 'allow' },
  )

  useEffect(() => {
    if (selected !== null) {
      const timer = setTimeout(() => {
        setSelected(null)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [selected])

  return (
    <div className="flex gap-2 items-center justify-between flex-none overflow-x-auto no-scrollbar border-b border-b-px border-outline-variant/80 mask-[linear-gradient(to_right,transparent,black_0.5rem,black_calc(100%-0.5rem),transparent)] overflow-hidden px-2">
      <Tabs
        className="flex-1"
        value={tabs.find((tab) => tab.href === pathname)?.label || tabs[0]?.label}
      >
        <TabsList className="gap-6">
          {tabs.map((tab, index) => (
            <TabsTab
              className="sm:w-28 data-active:text-on-surface flex-1 h-12"
              nativeButton={false}
              key={tab.label}
              value={tab.label}
              render={<Link href={tab.href} />}
            >
              <div className="relative">
                {tab.label}
                <AnimatePresence>
                  {index === selected && (
                    <m.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.1 } }}
                      exit={{
                        opacity: 0,
                        transition: { delay: 0, duration: 0.5 },
                      }}
                      className="absolute top-0 -right-6 text-xs font-mono"
                    >
                      <Kbd>{selected + 1}</Kbd>
                    </m.span>
                  )}
                </AnimatePresence>
              </div>
            </TabsTab>
          ))}
          <TabsIndicator className="bg-primary-container -bottom-1.5 left-0 h-2 translate-x-(--active-tab-left) translate-y-0" />
        </TabsList>
      </Tabs>
      <div className="items-center gap-2 hidden sm:flex">
        {extras}
        <SiteCommandMenu pageShortcuts={tabs} />
        <TooltipProvider>
          <GuideAnchor anchorKey="export">
            <ExportButton tabs={exportTabs} icon />
          </GuideAnchor>
          <Settings layer={config.layer} />
          <ContrastChecker layer={config.layer} />
          <HelpDialog />
        </TooltipProvider>
        <Button
          size="sm"
          variant="link"
          nativeButton={false}
          render={<Link href={crossLink.href} />}
        >
          {crossLink.label}
        </Button>
      </div>
    </div>
  )
}
