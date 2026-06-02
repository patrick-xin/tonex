import { BellIcon } from 'lucide-react'
import { ShadcnIcon } from '@/components/icons/shadcn'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { SectionHeader } from '../section-header'
import { MdDemos } from './md-demos'
import { ShadcnDemos } from './shadcn-demos'

export function PreviewSection() {
  return (
    <section className="shadcn relative flex h-dvh flex-col mx-auto py-12 sm:py-24">
      <SectionHeader
        heading="Preview your theme on real components"
        description="Your palette renders on real components. Toggle dark mode and the system holds, because
        every value comes from one seed."
      />
      <Tabs
        defaultValue="profile"
        className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain mask-[linear-gradient(to_bottom,black_80%,transparent)] min-w-0 "
      >
        <TabsListContent className="mx-auto w-96 mb-8">
          <TabsTab value="shadcn">
            <ShadcnIcon /> Shadcn
          </TabsTab>
          <TabsTab value="md">
            <BellIcon /> MD
          </TabsTab>
        </TabsListContent>
        <TabsPanel value="shadcn">
          <ShadcnDemos />
        </TabsPanel>
        <TabsPanel value="md">
          <MdDemos />
        </TabsPanel>
      </Tabs>
    </section>
  )
}
