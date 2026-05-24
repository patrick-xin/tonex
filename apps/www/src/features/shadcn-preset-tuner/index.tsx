'use client'

import { m } from 'motion/react'
import { cn } from 'tailwind-variants'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { ContrastLevelSlider } from '@/features/contrast-level'
import { SchemeVariantsToggle } from '@/features/scheme-variant'
import { ShadcnSourceColor } from '@/features/source-color'
import { SurfaceAdjustment } from '@/features/surface-adjustment'
import { ShadcnBindingsContent } from '../shadcn-rail/bindings-content'
import { SoftBordersToggle } from '../shadcn-soft-border/soft-borders-toggle'
import { BindingPresetTab } from './binding-preset-tab'
import { ChangesTab } from './changes-tab'

// why: dev-facing curator rail for issue #36 — replaces the production
// ShadcnRail on /theme/shadcn while the user tunes presets live. Three tabs:
// Bindings (source inputs + recipe + role→token map), Changes (emits a
// paste-back SHADCN_PRESETS theme-preset entry), and Binding preset (emits a
// binding-only SHADCN_BINDING_PRESETS entry — name + description + the current
// role→token map, no seed/contrast/recipe, ADR-0031 #1). Use the existing site
// mode toggle (cmd+. / command menu) to capture light + dark bindings — no mode
// toggle in this rail.
//
// No Overrides tab — deliberately. `shadcnRoleOverrides` (literal hex pins,
// ADR-0026) are end-user commitments *on top of* a preset, never part of one:
// ShadcnPreset carries no override field, Copy emits none, applyPreset clears
// them on load, and findActivePreset ignores them. So an override set here is
// never captured and is wiped on the next Load — dead weight for curation. The
// preset's user-facing routing is the role→token binding map (ADR-0031 #1: a
// named binding starting-point is a convenience input to the binding knob, not
// a preset), which the Bindings tab authors. The override picker stays in the
// production rail where end users reach it.
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
            <TabsTab value="changes">Changes</TabsTab>
            <TabsTab value="binding-preset">Binding preset</TabsTab>
          </TabsListContent>
          <TabsPanel value="bindings" className="min-h-0 flex-1">
            <ScrollArea gradientScrollFade noScrollBar className="h-full">
              {/* why: a preset's curated source inputs (seed + contrastLevel,
                  ADR-0031) lead the tab — the curator dials these in, and the
                  Changes tab captures them into the emitted entry. Below them
                  sit the recipe scalars (variant + surface fields + bindings),
                  all part of the preset. Reuses the same ShadcnSourceColor +
                  ContrastLevelSlider as the production rail (rail-content.tsx)
                  so the tuning controls stay identical. */}
              <ShadcnSourceColor />
              <div className="p-2">
                <ContrastLevelSlider />
              </div>
              <Separator className="opacity-20 mx-2" />
              <AnimatedCollapsible defaultOpen variant="ghost" title="Scheme Variant" height={0}>
                <SchemeVariantsToggle />
              </AnimatedCollapsible>
              <SurfaceAdjustment />
              <SoftBordersToggle />
              <ShadcnBindingsContent />
            </ScrollArea>
          </TabsPanel>
          <TabsPanel value="changes" className="min-h-0 flex-1">
            <ScrollArea gradientScrollFade noScrollBar className="h-full">
              <ChangesTab />
            </ScrollArea>
          </TabsPanel>
          <TabsPanel value="binding-preset" className="min-h-0 flex-1">
            <ScrollArea gradientScrollFade noScrollBar className="h-full">
              <BindingPresetTab />
            </ScrollArea>
          </TabsPanel>
        </Tabs>
      </m.div>
    </aside>
  )
}
