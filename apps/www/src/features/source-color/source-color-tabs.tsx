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

// why: md-rail only. Material You is HCT-native, but setting the seed is a
// set-once gesture even here — tweak HCT, done. So md mirrors shadcn's layout
// (ShadcnSourceColor): hex always-on at the top as the canonical seed, with
// HCT/image folded into a "Source control" disclosure that opens to adjust and
// hides when done, reclaiming rail space for the parts users revisit. The
// blocks are intentionally kept as two components (ADR-0028) — same structure
// today, but free to diverge in copy/behavior without disturbing shadcn.
export const SourceColorTabs = () => {
  // why: controlled value, not `defaultValue`. base-ui's uncontrolled Tabs
  // fallback resets value to null when its tab map momentarily empties during a
  // route-change remount and can't recover a null selection — leaving no active
  // panel and no indicator. Controlled roots skip that path entirely.
  const [src, setSrc] = useState('hct')
  // why: a locked seed can't be changed by any path, so the alternate inputs
  // (HCT/image) are inert too — dim and block the whole disclosure, matching the
  // disabled state SourceColorSection already gives the hex input. The lock
  // itself lives in SourceColorSection (always-on, outside this wrapper) so it
  // stays reachable to unlock.
  const seedHexLock = useSource((s) => s.seedHexLock)

  // why: locking blocks the disclosure (pointer-events-none), so a user who
  // locks while it's open would be stranded — unable to fold it without first
  // unlocking. Force it closed on lock so locking always tidies the rail.
  const [open, setOpen] = useState(false)
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
