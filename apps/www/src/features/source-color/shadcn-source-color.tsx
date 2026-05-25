'use client'

import { useSource } from '@tonex/core'
import { useEffect, useState } from 'react'
import { cn } from 'tailwind-variants'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { HctControlSliders } from '@/features/hct-controls'
import { GuideAnchor } from '@/features/onboarding-guide'
import { ImagePicker } from './image-picker'
import { SourceColorSection } from './source-color-section'

// why: shadcn users arrive with a brand hex, so hex is the always-on primary —
// the input sits inline at the top of the rail rather than behind a tab. HCT
// and image are the *other* ways to set the one canonical seed (ADR-0028: hex,
// HCT, and image all write the same value), folded into a single "Source
// control" disclosure so they read as alternate inputs, not a mode-switch that
// swaps the whole rail. md-rail's SourceColorTabs mirrors this layout — setting
// the seed is a set-once gesture in both layers, so folding reclaims rail space.
export function ShadcnSourceColor() {
  const [src, setSrc] = useState('hct')
  // why: a locked seed can't be changed by any path, so the alternate inputs
  // (HCT/image) are inert too — dim and block the whole disclosure, matching the
  // disabled state SourceColorSection already gives the hex input.
  const seedHexLock = useSource((s) => s.seedHexLock)

  // why: locking blocks the disclosure (pointer-events-none), so a user who
  // locks while it's open would be stranded — unable to fold it without first
  // unlocking. Force it closed on lock so locking always tidies the rail.
  const [open, setOpen] = useState(true)
  useEffect(() => {
    if (seedHexLock) setOpen(false)
  }, [seedHexLock])

  return (
    <GuideAnchor anchorKey="seed-color" className="space-y-4 pt-4">
      <SourceColorSection />
      <div
        aria-disabled={seedHexLock}
        className={cn(seedHexLock && 'pointer-events-none opacity-50')}
      >
        <AnimatedCollapsible
          defaultOpen
          variant="ghost"
          title="Source Control"
          height={0}
          open={open}
          onOpenChange={setOpen}
        >
          <Tabs value={src} onValueChange={(value) => setSrc(value as string)} className="gap-3">
            <TabsListContent
              indicatorClassName="bg-secondary-container h-full!"
              className="w-full min-h-0 h-6 bg-secondary-container/40 p-0 -mx-0.5"
            >
              <TabsTab
                className="text-xs data-active:text-on-secondary-container text-on-surface-variant hover:text-on-surface"
                value="hct"
              >
                HCT
              </TabsTab>
              <TabsTab
                className="text-xs data-active:text-on-secondary-container text-on-surface-variant hover:text-on-surface"
                value="image"
              >
                Image
              </TabsTab>
            </TabsListContent>
            <TabsPanel value="hct">
              <HctControlSliders className="h-40" />
            </TabsPanel>
            <TabsPanel value="image" keepMounted>
              <ImagePicker className="h-40" />
            </TabsPanel>
          </Tabs>
        </AnimatedCollapsible>
      </div>
    </GuideAnchor>
  )
}
