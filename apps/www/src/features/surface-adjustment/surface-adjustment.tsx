'use client'

import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { HctSlider } from '@/features/hct-controls'
import { GuideAnchor } from '@/features/onboarding-guide'
import { NeutralPaletteChips } from './neutral-palette-chips'
import { useSurfaceModel } from './use-surface-model'

export const SurfaceAdjustment = () => {
  const m = useSurfaceModel()

  return (
    <GuideAnchor anchorKey="surface-adjustment">
      <AnimatedCollapsible variant="ghost" title="Surface Adjustment" contentClassName="mb-2">
        <Tabs
          value={m.algo}
          onValueChange={(v) => m.setAlgo(v as 'tint' | 'desaturate')}
          className="gap-3 -mx-0.5"
        >
          <TabsListContent
            indicatorClassName="bg-secondary-container h-full!"
            className="w-full min-h-0 h-6 bg-secondary-container/40 p-0"
          >
            <TabsTab
              className="text-xs data-active:text-on-secondary-container text-on-surface-variant hover:text-on-surface"
              value="tint"
            >
              Tint
            </TabsTab>
            <TabsTab
              className="text-xs data-active:text-on-secondary-container text-on-surface-variant hover:text-on-surface"
              value="desaturate"
            >
              Desaturate
            </TabsTab>
          </TabsListContent>
          <TabsPanel value="tint" className="space-y-4 pt-1">
            <NeutralPaletteChips />
            <HctSlider
              label="Tint level"
              value={m.tintLevel}
              max={1}
              step={0.1}
              gradient={m.tintG}
              disabled={m.isPending}
              onValueChange={(v) => m.setTint(m.resolvedMode, v)}
            />
            <HctSlider
              label="Text accent"
              value={m.textLevel}
              max={1}
              step={0.1}
              gradient={m.textG}
              disabled={m.isPending}
              onValueChange={(v) => m.setText(m.resolvedMode, v)}
            />
          </TabsPanel>
          <TabsPanel value="desaturate" className="space-y-4 pt-1">
            <HctSlider
              label="Desaturate level"
              value={m.desatLevel}
              max={1}
              step={0.1}
              gradient={m.desatG}
              disabled={m.isPending}
              onValueChange={(v) => m.setDesat(m.resolvedMode, v)}
            />
          </TabsPanel>
        </Tabs>
      </AnimatedCollapsible>
    </GuideAnchor>
  )
}
