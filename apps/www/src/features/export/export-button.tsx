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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/kbd'
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { exportDialogHandle } from '@/lib/handles'
import { ExportContentDisplay } from './export-content-display'
import { ExportControls } from './export-controls'
import {
  ExportFilters,
  ExportFormatChooser,
  tabHasOptions,
  tabSupportsFormat,
} from './export-filters'
import { type ExportTab, useExportContent } from './use-export-content'

// why: ADR-0021 commitment 8 — route-agnostic. md routes pass
// `['Tailwind', 'JSON', 'Dart']`; shadcn routes pass `['shadcn']`. Tab
// choice is a prop, not internal path-sniffing logic. The fallback default
// mirrors today's md-route behavior so any caller that hasn't migrated still
// works.
const DEFAULT_TABS: readonly ExportTab[] = ['Tailwind', 'CSS', 'JSON', 'Dart']

// why: toggle state stays React-local, not zustand (UI prefs aren't portable
// theme). ADR-0021's 2026-05-20 amendment named the JSON formatter the
// "second consumer" that could justify a UI store but left the lift optional
// (#86) — one useState shared across every tab is already a single source of
// truth, so a store would add indirection with no second reader. Each dialog
// open starts at lean defaults (story 19): empty options == oklch, all off.
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

  useHotkey('E', () => exportDialogHandle.open(null), {
    ignoreInputs: true,
    requireReset: true,
    meta: { name: 'Export', description: 'Press E to open export' },
  })

  // why: single-tab routes (shadcn — we only support Tailwind v4) skip the
  // tab chrome and render the panel directly. The tab strip is meaningful
  // only when the user has a choice between formats.
  const showTabs = tabs.length > 1
  const hasOptions = tabHasOptions(exportTab)

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
      <DialogContent className="flex flex-col gap-0 p-0! w-full max-w-3xl max-h-[calc(100dvh-10rem)] sm:max-h-[calc(100dvh-6rem)] overflow-hidden">
        <DialogHeader className="flex flex-row justify-between p-4 border-b border-outline-variant/40 text-left">
          <div className="flex flex-col gap-1">
            <DialogTitle>Export theme</DialogTitle>
            <DialogDescription>Copy or download your current theme.</DialogDescription>
          </div>
          {tabSupportsFormat(exportTab) && (
            <ExportFormatChooser options={options} onChange={setOptions} />
          )}
        </DialogHeader>
        <div
          className={cn(
            'grid min-h-0 flex-1 grid-cols-1',
            hasOptions && 'lg:grid-cols-[13rem_minmax(0,1fr)]',
          )}
        >
          {hasOptions && <ExportFilters tab={exportTab} options={options} onChange={setOptions} />}
          {showTabs ? (
            <Tabs
              value={exportTab}
              onValueChange={(value) => setExportTab(value as ExportTab)}
              className="flex min-h-0 min-w-0 flex-col gap-0"
            >
              <TabsList className="border-b border-outline-variant/60">
                {tabs.map((tab) => (
                  <TabsTab className="data-active:text-on-surface" key={tab} value={tab}>
                    {tab}
                  </TabsTab>
                ))}
                <TabsIndicator className="bg-primary -bottom-0.5 left-px h-0.5 translate-x-(--active-tab-left) translate-y-0" />
              </TabsList>
              {tabs.map((tab) => (
                <TabsPanel key={tab} value={tab} className="flex h-full min-h-0 flex-col">
                  <ExportContentDisplay content={exportContent} />
                  <ExportControls exportContent={exportContent} ext={ext} />
                </TabsPanel>
              ))}
            </Tabs>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-col">
              <ExportContentDisplay content={exportContent} />
              <ExportControls exportContent={exportContent} ext={ext} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
