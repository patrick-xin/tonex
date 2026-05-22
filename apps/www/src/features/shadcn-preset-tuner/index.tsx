'use client'

import { m } from 'motion/react'
import { cn } from 'tailwind-variants'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { SchemeVariantsToggle } from '@/features/scheme-variant'
import { SurfaceAdjustment } from '@/features/surface-adjustment'
import { ShadcnBindingsContent } from '../shadcn-rail/bindings-content'
import { ShadcnOverrideContent } from '../shadcn-rail/override-content'
import { SoftBordersToggle } from '../shadcn-soft-border/soft-borders-toggle'
import { ChangesTab } from './changes-tab'

// why: dev-facing curator rail for issue #36 — replaces the production
// ShadcnRail on /theme/shadcn while the user tunes three preset bundles
// live. Three tabs: Bindings + Overrides reuse the existing rail-takeover
// content components; Changes is new and emits a paste-back TS literal.
// Use the existing site mode toggle (cmd+. / command menu) to capture
// light + dark bindings — no mode toggle in this rail.
export function ShadcnPresetTunerRail() {
  return (
    <aside
      className={cn(
        'w-80 h-[calc(100dvh-80px)] xl:h-[calc(100dvh-16px)] my-auto ml-2 overflow-hidden rounded-2xl hidden sm:flex flex-col shadow-sm bg-surface-container px-2',
      )}
    >
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col min-h-0 flex-1"
      >
        <div className="flex items-center justify-between gap-2 py-2 px-1">
          <div className="text-sm font-medium text-on-surface">Preset tuner</div>
          <div className="text-[10px] font-mono text-on-surface-variant">issue #36</div>
        </div>
        <Tabs defaultValue="bindings" className="flex flex-col min-h-0 flex-1 gap-2">
          <TabsListContent className="bg-transparent">
            <TabsTab value="bindings">Bindings</TabsTab>
            <TabsTab value="overrides">Overrides</TabsTab>
            <TabsTab value="changes">Changes</TabsTab>
          </TabsListContent>
          <TabsPanel value="bindings" className="min-h-0 flex-1">
            <ScrollArea gradientScrollFade noScrollBar className="h-full">
              {/* why: bundle scalars (variant + surface fields) live alongside
                  the bindings since they're all part of PresetBundle. Same
                  composition as the production rail Controls view, just
                  collapsed into one scrollable list rather than a
                  takeover-on-click flow. */}
              <AnimatedCollapsible defaultOpen variant="ghost" title="Scheme Variant" height={0}>
                <SchemeVariantsToggle />
              </AnimatedCollapsible>
              <SurfaceAdjustment />
              <SoftBordersToggle />
              <ShadcnBindingsContent />
            </ScrollArea>
          </TabsPanel>
          <TabsPanel value="overrides" className="min-h-0 flex-1">
            <ScrollArea gradientScrollFade noScrollBar className="h-full">
              <ShadcnOverrideContent />
            </ScrollArea>
          </TabsPanel>
          <TabsPanel value="changes" className="min-h-0 flex-1">
            <ScrollArea gradientScrollFade noScrollBar className="h-full">
              <ChangesTab />
            </ScrollArea>
          </TabsPanel>
        </Tabs>
      </m.div>
    </aside>
  )
}
