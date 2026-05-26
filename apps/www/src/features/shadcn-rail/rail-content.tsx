'use client'

import { ArrowLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { AnimatePresence, m } from 'motion/react'
import { useState } from 'react'
import { cn } from 'tailwind-variants'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ChartPaletteToggle } from '@/features/chart-palette'
import { ContrastLevelSlider } from '@/features/contrast-level'
import { CustomColorList } from '@/features/custom-colors'
import { SchemeVariantsToggle } from '@/features/scheme-variant'
import { SoftBordersToggle } from '@/features/shadcn-soft-border'
import { ShadcnSourceColor } from '@/features/source-color'
import { SurfaceAdjustment } from '@/features/surface-adjustment'
import { ShadcnBindingsContent } from './bindings-content'
import { ShadcnOverrideContent } from './override-content'

type RailMode = 'controls' | 'overrides' | 'bindings'

export function ShadcnRailContent() {
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
      <ScrollArea
        gradientScrollFade
        noScrollBar
        className="flex-1 min-h-0 w-full max-w-4xl mx-auto"
      >
        <div className="space-y-1">
          <ShadcnSourceColor />
          <AnimatedCollapsible variant="ghost" title="Scheme Variant">
            <SchemeVariantsToggle />
          </AnimatedCollapsible>
          <SurfaceAdjustment />
          <AnimatedCollapsible
            variant="ghost"
            title="Refinements"
            contentClassName="px-0 space-y-1"
          >
            <SoftBordersToggle />
            <Separator className="opacity-20 mx-2" />
            <div className="p-2">
              <ContrastLevelSlider />
            </div>
            <Separator className="opacity-20 mx-2" />
            <div className="p-2">
              <ChartPaletteToggle />
            </div>
          </AnimatedCollapsible>
          <CustomColorList />
          <Button
            className="w-full justify-between px-2! group leading-snug text-base"
            variant="ghost"
            onClick={() => setMode('overrides')}
          >
            Token Overrides
            <CaretRightIcon
              weight="bold"
              className={cn(
                'size-3 transition-[transform,color] duration-200 text-on-surface-variant group-hover:text-on-surface',
              )}
            />
          </Button>
          <Button
            className="w-full justify-between px-2! group leading-snug text-base"
            variant="ghost"
            onClick={() => setMode('bindings')}
          >
            Role Bindings
            <CaretRightIcon
              weight="bold"
              className={cn(
                'size-3 transition-[transform,color] duration-200 text-on-surface-variant group-hover:text-on-surface',
              )}
            />
          </Button>
        </div>
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
          <div className="text-base font-medium">
            {mode === 'overrides' ? 'Token Overrides' : 'Role Bindings'}
          </div>
        </div>
        <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0">
          {mode === 'overrides' ? <ShadcnOverrideContent /> : <ShadcnBindingsContent />}
        </ScrollArea>
      </m.div>
    </AnimatePresence>
  )
}
