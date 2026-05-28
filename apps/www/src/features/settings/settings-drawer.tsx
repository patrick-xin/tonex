'use client'

import {
  Drawer,
  DrawerContent,
  DrawerDragHandle,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { settingsDrawerHandle } from '@/lib/handles'
import type { Layer } from '@/lib/layer-context'
import { SettingsFields } from './settings-fields'

// why: the mobile (sm:hidden) counterpart to the desktop Settings popover. A
// plain bottom drawer — no snap points — mounted by the layout and opened from
// the mobile action bar's gear trigger via settingsDrawerHandle.
export function SettingsDrawer({ layer }: { layer: Layer }) {
  return (
    <Drawer handle={settingsDrawerHandle}>
      <DrawerContent side="bottom">
        <DrawerDragHandle className="mt-1 mb-3" />
        <DrawerHeader className="text-left">
          <DrawerTitle>Settings</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-2">
          <SettingsFields layer={layer} onAfterReset={() => settingsDrawerHandle.close()} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
