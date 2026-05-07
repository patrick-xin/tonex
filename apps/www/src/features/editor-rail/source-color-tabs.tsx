import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { ColorLock } from './color-lock'
import { HctControlSliders } from './hct/hct-control-sliders'
import { ImagePicker } from './image-picker'
import { SourceColorSection } from './source-color-section'

export const SourceColorTabs = () => {
  return (
    <Tabs defaultValue="source-color" className="p-2 gap-2">
      <div className="flex items-center justify-between">
        <TabsListContent className="bg-transparent flex-1">
          <TabsTab value="source-color">Source color</TabsTab>
          <TabsTab value="image">Image</TabsTab>
        </TabsListContent>
        <ColorLock />
      </div>
      <TabsPanel value="source-color" className="space-y-3">
        <SourceColorSection />
        <HctControlSliders />
      </TabsPanel>
      <TabsPanel value="image" keepMounted>
        <ImagePicker />
      </TabsPanel>
    </Tabs>
  )
}
