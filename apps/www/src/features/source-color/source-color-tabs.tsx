'use client'

import { useState } from 'react'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { HctControlSliders } from '@/features/hct-controls'
import { GuideAnchor } from '@/features/onboarding-guide'
import { ColorLock } from './color-lock'
import { ImagePicker } from './image-picker'
import { SourceColorSection } from './source-color-section'

export const SourceColorTabs = () => {
  // why: controlled value, not `defaultValue`. base-ui's uncontrolled Tabs
  // fallback resets value to null when its tab map momentarily empties during a
  // route-change remount and can't recover a null selection — leaving no active
  // panel and no indicator. Controlled roots skip that path entirely.
  const [tab, setTab] = useState('source-color')

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as string)} className="p-2 gap-2">
      <div className="flex items-center justify-between">
        <TabsListContent className="bg-transparent flex-1">
          <TabsTab value="source-color">Source color</TabsTab>
          <TabsTab value="image">Image</TabsTab>
        </TabsListContent>
        <ColorLock />
      </div>
      <TabsPanel value="source-color">
        <GuideAnchor anchorKey="seed-color" className="space-y-3">
          <SourceColorSection />
          <HctControlSliders />
        </GuideAnchor>
      </TabsPanel>
      <TabsPanel value="image" keepMounted>
        <ImagePicker />
      </TabsPanel>
    </Tabs>
  )
}
