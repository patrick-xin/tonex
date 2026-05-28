'use client'

import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { RulerSlider } from '@/components/ui/ruler-slider'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
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
            className="w-full min-h-0 h-6 bg-surface-container-high p-0"
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
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Tint level</span>
                <span className="font-mono text-xs tabular-nums text-on-surface-variant w-9 text-right">
                  {m.tintLevel.toFixed(2)}
                </span>
              </div>
              <RulerSlider
                aria-label="Tint level"
                disabled={m.isPending}
                fill
                max={1}
                min={0}
                onValueChange={(v) => m.setTint(m.resolvedMode, v)}
                size="xs"
                step={0.1}
                value={m.tintLevel}
              />
            </div>
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Text accent</span>
                <span className="font-mono text-xs tabular-nums text-on-surface-variant w-9 text-right">
                  {m.textLevel.toFixed(2)}
                </span>
              </div>
              <RulerSlider
                aria-label="Text accent"
                disabled={m.isPending}
                fill
                max={1}
                min={0}
                onValueChange={(v) => m.setText(m.resolvedMode, v)}
                size="xs"
                step={0.1}
                value={m.textLevel}
              />
            </div>
          </TabsPanel>
          <TabsPanel value="desaturate" className="space-y-4 pt-1">
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-on-surface-variant">Desaturate level</span>
                <span className="font-mono text-xs tabular-nums text-on-surface-variant w-9 text-right">
                  {m.desatLevel.toFixed(2)}
                </span>
              </div>
              <RulerSlider
                aria-label="Desaturate level"
                disabled={m.isPending}
                fill
                max={1}
                min={0}
                onValueChange={(v) => m.setDesat(m.resolvedMode, v)}
                size="xs"
                step={0.1}
                value={m.desatLevel}
              />
            </div>
          </TabsPanel>
        </Tabs>
      </AnimatedCollapsible>
    </GuideAnchor>
  )
}
