'use client'

import { DownloadIcon } from '@phosphor-icons/react'
import type { ExportOptions } from '@tonex/core'
import { useState } from 'react'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { ExportContentDisplay } from './export-content-display'
import { type ExportTab, useExportContent } from './export-content-manager'
import { ExportControls } from './export-controls'
import { ExportFilters } from './export-filters'

// why: ADR-0021 commitment 8 — route-agnostic. md routes pass
// `['Tailwind', 'TS', 'JSON', 'Dart']`; shadcn routes pass
// `['shadcn', 'TS', 'JSON', 'Dart']`. Tab choice is a prop, not internal
// path-sniffing logic. The fallback default mirrors today's md-route
// behavior so any caller that hasn't migrated still works.
const DEFAULT_TABS: readonly ExportTab[] = ['Tailwind', 'TS', 'JSON', 'Dart']

// why: ADR-0021 consequences — toggle state is React-local, not zustand.
// Each dialog open starts at lean defaults (story 19). An empty options
// object equals "everything off, oklch" per ExportOptions defaults.
const LEAN_DEFAULTS: ExportOptions = {}

export const ExportButton = ({
  className,
  icon = false,
  tabs = DEFAULT_TABS,
}: {
  className?: string
  icon?: boolean
  tabs?: readonly ExportTab[]
}) => {
  const initialTab = tabs[0]
  const [exportTab, setExportTab] = useState<ExportTab>(initialTab)
  const [options, setOptions] = useState<ExportOptions>(LEAN_DEFAULTS)
  const { exportContent, ext } = useExportContent({ exportTab, options })

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="secondary" className={cn(className)} size={icon ? 'icon-sm' : 'default'}>
            {!icon ? 'Copy/Export' : <DownloadIcon />}
          </Button>
        }
      />
      <DialogContent layout="scrollable">
        <DialogTitle className="sr-only">Export theme</DialogTitle>
        <DialogDescription className="sr-only">
          Copy or download the theme for your target framework.
        </DialogDescription>
        <Tabs
          defaultValue={initialTab}
          onValueChange={(value) => setExportTab(value as ExportTab)}
          className="h-full gap-0"
        >
          <TabsList className="border-b border-outline-variant">
            {tabs.map((tab) => (
              <TabsTab className="data-active:text-on-surface" key={tab} value={tab}>
                {tab}
              </TabsTab>
            ))}
            <TabsIndicator className="bg-primary -bottom-0.5 left-px h-0.5 translate-x-(--active-tab-left) translate-y-0" />
          </TabsList>
          {tabs.map((tab) => (
            <TabsPanel key={tab} value={tab} className="h-full flex flex-col min-h-0">
              <ExportFilters tab={tab} options={options} onChange={setOptions} />
              <ExportContentDisplay content={exportContent} />
              <ExportControls exportContent={exportContent} ext={ext} />
            </TabsPanel>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
