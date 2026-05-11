'use client'

import { ArrowLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { AnimatePresence, m } from 'motion/react'
import type * as React from 'react'
import { useState } from 'react'
import { cn } from 'tailwind-variants'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerDragHandle, DrawerTrigger, SnapDrawerContent } from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CustomColorList } from '@/features/custom-colors'
import { SchemeVariantsToggle } from '@/features/scheme-variant'
import { SourceColorTabs } from '@/features/source-color'
import { SurfaceAdjustment } from '@/features/surface-adjustment'
import { SoftBordersToggle } from '../shadcn-soft-border/soft-borders-toggle'
import { ShadcnBindingsContent } from './bindings-content'
import { ShadcnOverrideContent } from './override-content'

type RailMode = 'controls' | 'overrides' | 'bindings'

const DRAWER_TOP_MARGIN_REM = 1
const DRAWER_SNAP_POINTS_REM = [40]
const drawerSnapPoints = [
  ...DRAWER_SNAP_POINTS_REM.map((h) => `${h + DRAWER_TOP_MARGIN_REM}rem`),
  1,
]

// why: shared between the desktop aside (ShadcnRail) and the mobile drawer
// (ShadcnRailDrawer). Owns the mode state machine so both shells expose the
// same controls/overrides/bindings flow. Each shell owns its own outer height
// constraint; this component only owns the content.
function ShadcnRailContent() {
  const [mode, setMode] = useState<RailMode>('controls')

  return mode === 'controls' ? (
    <m.div
      className="flex flex-col flex-1 min-h-0"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
    >
      <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0">
        <SourceColorTabs />
        <AnimatedCollapsible defaultOpen variant="ghost" title="Scheme Variant" height={0}>
          <SchemeVariantsToggle />
        </AnimatedCollapsible>
        <CustomColorList />
        <SurfaceAdjustment />
        <SoftBordersToggle />
        <Button
          className="w-full justify-between px-2! group leading-snug"
          variant="ghost"
          onClick={() => setMode('overrides')}
        >
          Overrides
          <CaretRightIcon
            weight="bold"
            className={cn(
              'size-3 transition-[transform,color] duration-200 text-on-surface-variant/60 group-hover:text-on-surface-variant',
            )}
          />
        </Button>
        <Button
          className="w-full justify-between px-2! group leading-snug"
          variant="ghost"
          onClick={() => setMode('bindings')}
        >
          Bindings
          <CaretRightIcon
            weight="bold"
            className={cn(
              'size-3 transition-[transform,color] duration-200 text-on-surface-variant/60 group-hover:text-on-surface-variant',
            )}
          />
        </Button>
      </ScrollArea>
    </m.div>
  ) : (
    <AnimatePresence>
      <m.div
        className="flex flex-col flex-1 min-h-0"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
      >
        <div className="flex-none flex items-center gap-2 py-2">
          <Button variant="ghost" size="icon-sm" onClick={() => setMode('controls')} title="Back">
            <ArrowLeftIcon />
          </Button>
          <div className="text-sm font-medium text-on-surface">
            {mode === 'overrides' ? 'Role overrides' : 'Role bindings'}
          </div>
        </div>
        <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0">
          {mode === 'overrides' ? <ShadcnOverrideContent /> : <ShadcnBindingsContent />}
        </ScrollArea>
      </m.div>
    </AnimatePresence>
  )
}

// why: prototype rail for /theme/shadcn — default Controls view + two
// takeover modes (overrides, bindings). Mounted only on (shadcn) layout;
// (md) keeps MdRail. Editor-rail-style.md will need amendment after the
// prototype settles. Auto-save via the existing store actions inside each
// editor — no commit step, takeover exit is just navigation.
export function ShadcnRail() {
  return (
    <aside
      className={cn(
        'w-64 lg:w-80 h-[calc(100dvh-16px)] my-auto ml-2 overflow-hidden rounded-2xl hidden sm:flex flex-col shadow-sm bg-surface-container px-2',
      )}
    >
      <ShadcnRailContent />
    </aside>
  )
}

// why: mobile-only action panel for shadcn rail content. Mirrors MdRailDrawer.
export function ShadcnRailDrawer() {
  return (
    <Drawer snapPoints={drawerSnapPoints}>
      <DrawerTrigger
        render={
          <Button className="sm:hidden" variant="fab">
            Build theme
          </Button>
        }
      />
      <SnapDrawerContent
        className="max-h-[calc(100dvh-var(--top-margin))]"
        style={{ '--top-margin': `${DRAWER_TOP_MARGIN_REM}rem` } as React.CSSProperties}
      >
        <DrawerDragHandle className="my-4" />
        <div className="min-h-0 flex-1 flex flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          <ShadcnRailContent />
        </div>
      </SnapDrawerContent>
    </Drawer>
  )
}
