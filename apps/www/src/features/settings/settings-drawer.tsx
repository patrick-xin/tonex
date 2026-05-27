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
        {/* Neutralize the handle's default -mt-2 (tuned for the pt-4 snap drawer);
            this plain drawer only has pt-2, so without this the grabber hugs the
            top edge. mt-1 + pt-2 leaves ~12px of room above it. */}
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
