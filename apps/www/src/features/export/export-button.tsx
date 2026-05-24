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
        {/* why: ExportOptions is one shared surface (ADR-0021 amendment
         * 2026-05-20), so the option row renders ONCE above the tab strip —
         * keyed to the active tab (exportTab) so a toggle set on any format
         * carries to every other — instead of once per TabsPanel. The wrapper
         * keeps the row + content as one flex column so DialogContent's gap-6
         * (dialog-section spacing) doesn't open a gap above the tabs.
         * ExportFilters itself renders nothing for option-less tabs (Dart). */}
        <div className="h-full flex flex-col min-h-0 gap-0">
          <ExportFilters tab={exportTab} options={options} onChange={setOptions} />
          {showTabs ? (
            // why: controlled (value, not defaultValue) so `exportTab` is the
            // single source of truth. `exportTab` lives in ExportButton (stays
            // mounted); the Tabs strip lives in DialogContent (unmounts on
            // close). An uncontrolled Tabs reset its visual selection to its
            // default on every reopen/remount while `exportTab` — which drives
            // the rendered content via useExportContent — kept the prior tab,
            // so the indicator and content desynced (#118). Binding value to
            // exportTab keeps them in lockstep across remounts.
            <Tabs
              value={exportTab}
              onValueChange={(value) => setExportTab(value as ExportTab)}
              className="flex-1 min-h-0 gap-0"
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
                  <ExportContentDisplay content={exportContent} />
                  <ExportControls exportContent={exportContent} ext={ext} />
                </TabsPanel>
              ))}
            </Tabs>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <ExportContentDisplay content={exportContent} />
              <ExportControls exportContent={exportContent} ext={ext} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
