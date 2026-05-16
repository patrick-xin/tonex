'use client'

import { ArrowLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { AnimatePresence, m } from 'motion/react'
import { useState } from 'react'
import { cn } from 'tailwind-variants'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CustomColorList } from '@/features/custom-colors'
import { SchemeVariantsToggle } from '@/features/scheme-variant'
import { SoftBordersToggle } from '@/features/shadcn-soft-border'
import { SourceColorTabs } from '@/features/source-color'
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
