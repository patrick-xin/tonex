'use client'

import { DownloadIcon } from '@phosphor-icons/react'
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

const TABS = ['Tailwind', 'shadcn', 'TS', 'JSON', 'Dart'] as const satisfies readonly ExportTab[]

export const ExportButton = ({
  className,
  icon = false,
}: {
  className?: string
  icon?: boolean
}) => {
  const [exportTab, setExportTab] = useState<ExportTab>('Tailwind')
  const { exportContent, ext } = useExportContent({ exportTab })

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
          defaultValue="Tailwind"
          onValueChange={(value) => setExportTab(value as ExportTab)}
          className="h-full gap-0"
        >
          <TabsList className="border-b border-outline-variant">
            {TABS.map((tab) => (
              <TabsTab className="data-active:text-on-surface" key={tab} value={tab}>
                {tab}
              </TabsTab>
            ))}
            <TabsIndicator className="bg-primary -bottom-0.5 left-px h-0.5 translate-x-(--active-tab-left) translate-y-0" />
          </TabsList>
          {TABS.map((tab) => (
            <TabsPanel key={tab} value={tab} className="h-full flex flex-col min-h-0">
              <ExportContentDisplay content={exportContent} />
              <ExportControls exportContent={exportContent} ext={ext} />
            </TabsPanel>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
