'use client'

import { DownloadIcon } from '@phosphor-icons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
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
import { Kbd } from '@/components/ui/kbd'
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { exportDialogHandle } from '@/lib/handles'
import { ExportContentDisplay } from './export-content-display'
import { ExportControls } from './export-controls'
import { ExportFilters } from './export-filters'
import { type ExportTab, useExportContent } from './use-export-content'

// why: ADR-0021 commitment 8 — route-agnostic. md routes pass
// `['Tailwind', 'TS', 'JSON', 'Dart']`; shadcn routes pass `['shadcn']`. Tab
// choice is a prop, not internal path-sniffing logic. The fallback default
// mirrors today's md-route behavior so any caller that hasn't migrated still
// works.
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

  // why: command-menu shortcut (E) opens the export dialog from anywhere in
  // the app via the shared handle. Same pattern as help-dialog.
  useHotkey('E', () => exportDialogHandle.open(null), {
    ignoreInputs: true,
    requireReset: true,
    meta: { name: 'Export', description: 'Press E to open export' },
  })

  // why: single-tab routes (shadcn — we only support Tailwind v4) skip the
  // tab chrome and render the panel directly. The tab strip is meaningful
  // only when the user has a choice between formats.
  const showTabs = tabs.length > 1

  return (
    <Dialog handle={exportDialogHandle}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={
                <Button
                  variant="secondary"
                  className={cn(className)}
                  size={icon ? 'icon-sm' : 'default'}
                  aria-label="Export theme"
                >
                  {!icon ? 'Copy/Export' : <DownloadIcon />}
                </Button>
              }
            />
          }
        />
        <TooltipContent>
          Export <Kbd>E</Kbd>
        </TooltipContent>
      </Tooltip>
      <DialogContent layout="scrollable">
        <DialogTitle className="sr-only">Export theme</DialogTitle>
        <DialogDescription className="sr-only">
          Copy or download the theme for your target framework.
        </DialogDescription>
        {showTabs ? (
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
        ) : (
          <div className="h-full flex flex-col min-h-0 gap-0">
            <ExportFilters tab={initialTab} options={options} onChange={setOptions} />
            <ExportContentDisplay content={exportContent} />
            <ExportControls exportContent={exportContent} ext={ext} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
