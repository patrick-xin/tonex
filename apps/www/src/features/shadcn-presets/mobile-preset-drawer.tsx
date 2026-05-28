'use client'

import { CheckIcon } from '@phosphor-icons/react/ssr'
import { selectPortable, useSource } from '@tonex/core'
import { findActivePreset, SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import { cn } from 'tailwind-variants'
import { useShallow } from 'zustand/react/shallow'
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerDescription,
  DrawerDragHandle,
  DrawerHeader,
  DrawerPopup,
  DrawerPortal,
  DrawerSelectable,
  DrawerTitle,
  DrawerViewport,
} from '@/components/ui/drawer'
import { ScrollAreaContent, ScrollAreaRoot, ScrollAreaViewport } from '@/components/ui/scroll-area'
import { mobilePresetDrawerHandle } from '@/lib/handles'
import { PresetSwitchDialog } from './preset-dialog'
import { COLUMN_ORDER } from './preset-preview-card'
import type { Swatches } from './preview-swatches'
import { requestPresetSwitch } from './request'
import { usePresetPreview } from './use-preset-preview'

// why: shadcn-only mobile counterpart to the desktop preset popover. Trigger-
// less (handle-driven) — its trigger lives in the mobile action bar so the
// shell can mount the content from the layout, mirroring railDrawer /
// settingsDrawer (issue #142). PresetSwitchDialog is mounted here too because
// its sibling on desktop lives inside PresetPicker, which is `hidden sm:flex`;
// without this remount, a switch that needs the confirm dialog would silently
// no-op below sm.
const PRESET_NAMES = Object.keys(SHADCN_PRESETS) as ShadcnPresetName[]

export function MobilePresetDrawer() {
  const portable = useSource(useShallow(selectPortable))
  const activePreset = findActivePreset(portable)

  return (
    <>
      <Drawer handle={mobilePresetDrawerHandle}>
        <DrawerPortal>
          <DrawerBackdrop />
          <DrawerViewport>
            <ScrollAreaRoot
              className="h-full overscroll-contain transition-[transform,translate] duration-600 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-[starting-style]:translate-y-[100dvh] group-data-[ending-style]:pointer-events-none"
              style={{ position: undefined }}
            >
              <ScrollAreaViewport className="h-full overscroll-contain touch-auto">
                <ScrollAreaContent className="flex min-h-full items-end justify-center pt-8 md:py-16 md:px-16">
                  <DrawerPopup className="w-full max-w-[42rem] outline-none transition-transform duration-800 ease-[cubic-bezier(0.45,1.005,0,1.005)] [transform:translateY(var(--drawer-swipe-movement-y))] data-[swiping]:select-none data-[ending-style]:[transform:translateY(calc(max(100dvh,100%)+2px))] data-[ending-style]:duration-350 data-[ending-style]:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] rounded-t-2xl md:rounded-xl">
                    <div className="relative flex flex-col bg-surface px-4 pt-4 pb-6 outline outline-outline-variant transition-shadow duration-350 ease-[cubic-bezier(0.375,0.015,0.545,0.455)] rounded-t-2xl md:rounded-xl">
                      <DrawerDragHandle className="mb-4" />
                      <DrawerSelectable className="w-full">
                        <DrawerHeader className="text-left mb-3 px-1">
                          <DrawerTitle className="text-base">Preset</DrawerTitle>
                          <DrawerDescription className="text-xs">
                            Start from a curated aesthetic recipe.
                          </DrawerDescription>
                        </DrawerHeader>
                        <ul className="grid list-none gap-1">
                          {PRESET_NAMES.map((name) => (
                            <li key={name} className="flex">
                              <PresetRow name={name} active={name === activePreset} />
                            </li>
                          ))}
                        </ul>
                      </DrawerSelectable>
                    </div>
                  </DrawerPopup>
                </ScrollAreaContent>
              </ScrollAreaViewport>
            </ScrollAreaRoot>
          </DrawerViewport>
        </DrawerPortal>
      </Drawer>
      <PresetSwitchDialog />
    </>
  )
}

function HexChip({ hex, label }: { hex: string; label?: string }) {
  return (
    <span className="flex items-center gap-1.5 px-0.5 font-mono text-xs text-on-surface-variant">
      {label && <span>{label}</span>}
      <span
        className="size-2.5 rounded-sm border border-outline-variant/60"
        style={{ backgroundColor: hex }}
      />
      {hex}
    </span>
  )
}

function TriggerStrip({ swatches }: { swatches: Swatches }) {
  return (
    <span className="flex h-5 overflow-hidden rounded-sm border border-outline-variant">
      {COLUMN_ORDER.map((k) => (
        <span key={k} className="flex-1" style={{ backgroundColor: swatches[k] }} />
      ))}
    </span>
  )
}

function PresetRow({ name, active }: { name: ShadcnPresetName; active: boolean }) {
  const { swatches, presetHex, currentHex } = usePresetPreview(name, active)
  return (
    <DrawerClose
      aria-current={active ? 'true' : undefined}
      onClick={() => requestPresetSwitch(name)}
      className={cn(
        'flex w-full flex-col gap-2 rounded-md p-3 text-left transition-colors hover:bg-primary/8',
        active && 'bg-primary/12 hover:bg-primary/12!',
      )}
    >
      <TriggerStrip swatches={swatches} />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 px-0.5 text-sm capitalize text-on-surface">
          {name}
          {active && <CheckIcon weight="bold" className="size-3 text-primary" />}
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {currentHex && <HexChip label="Current:" hex={currentHex} />}
          <HexChip hex={presetHex} />
        </div>
      </div>
    </DrawerClose>
  )
}
