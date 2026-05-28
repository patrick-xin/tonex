'use client'

import {
  CircleHalfIcon,
  DownloadIcon,
  GearSixIcon,
  PaintBrushIcon,
  PaletteIcon,
  QuestionIcon,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { DrawerTrigger } from '@/components/ui/drawer'
import {
  checkContrastDialogHandle,
  exportDialogHandle,
  helpDialogHandle,
  mobilePresetDrawerHandle,
  railDrawerHandle,
  settingsDrawerHandle,
} from '@/lib/handles'

// why: ADR-0022 surface feature. The desktop chrome cluster (features/nav-tabs,
// `hidden sm:flex`) and the desktop rail footer are unreachable below sm; this
// bar is their `sm:hidden` home (issue #142, variant C). Export/Contrast/Help
// mount NO second dialogs — those single instances live in the (hidden) nav-tabs
// cluster and are driven here through their handles, exactly as the command menu
// drives them. Settings is the exception: the desktop popover anchors to a
// hidden trigger below sm, so the bar opens a dedicated bottom drawer instead
// (settingsDrawer / settingsDrawerHandle) that re-renders the same SettingsFields.
//
// railDrawer is the layer's drawer content (MdRailDrawer / ShadcnRailDrawer) and
// settingsDrawer the layer's SettingsDrawer, both mounted here so their triggers
// (railDrawerHandle / settingsDrawerHandle) can open content the layout owns.
// App-level navigation (page list, theme toggle, social) lives in the top-nav
// drawer (components/shared/mobile-nav-drawer), so this bar stays focused on
// editing/output chrome.
export function MobileActionBar({
  railDrawer,
  settingsDrawer,
  presetDrawer,
}: {
  railDrawer: React.ReactNode
  settingsDrawer: React.ReactNode
  // why: shadcn-only — md has no preset concept (ADR-0026). Layouts opt in by
  // passing the drawer + its trigger lights up; the md layout omits both.
  presetDrawer?: React.ReactNode
}) {
  return (
    <>
      {railDrawer}
      {settingsDrawer}
      {presetDrawer}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-md border border-outline-variant/50 bg-surface-container-high px-3 py-1 text-on-surface-variant elevation-2">
          <DrawerTrigger
            handle={railDrawerHandle}
            render={<Button variant="ghost" size="icon" aria-label="Build theme" />}
          >
            <PaletteIcon />
          </DrawerTrigger>
          {presetDrawer && (
            <DrawerTrigger
              handle={mobilePresetDrawerHandle}
              render={<Button variant="ghost" size="icon" aria-label="Preset" />}
            >
              <PaintBrushIcon />
            </DrawerTrigger>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Export"
            onClick={() => exportDialogHandle.open(null)}
          >
            <DownloadIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Contrast checker"
            onClick={() => checkContrastDialogHandle.open(null)}
          >
            <CircleHalfIcon />
          </Button>
          <DrawerTrigger
            handle={settingsDrawerHandle}
            render={<Button variant="ghost" size="icon" aria-label="Settings" />}
          >
            <GearSixIcon />
          </DrawerTrigger>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Help"
            onClick={() => helpDialogHandle.open(null)}
          >
            <QuestionIcon />
          </Button>
        </div>
      </div>
    </>
  )
}
