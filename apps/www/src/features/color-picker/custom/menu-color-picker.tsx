'use client'

import { PaletteIcon, XIcon } from '@phosphor-icons/react'
import { AnimatePresence, m, type Transition } from 'motion/react'
import { useState } from 'react'
import { cx } from 'tailwind-variants'
import {
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AnimatedColorPicker } from './animated-color-picker'

const effectsTransition: Transition = {
  type: 'spring',
  stiffness: 1600,
  damping: 60,
  mass: 1,
}

const spatialTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 22,
  mass: 1,
}

const FAB_SIZE = 48
const CLOSE_SIZE = 32

export function MenuColorPicker() {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-center size-12">
        <PopoverTrigger
          render={
            <m.button
              aria-label="Menu color picker"
              type="button"
              animate={{
                width: open ? CLOSE_SIZE : FAB_SIZE,
                height: open ? CLOSE_SIZE : FAB_SIZE,
                borderRadius: open ? CLOSE_SIZE / 2 : 28,
                background: open ? 'var(--color-secondary)' : 'var(--color-primary)',
              }}
              transition={{
                ...spatialTransition,
                background: effectsTransition,
              }}
              className={cx('flex items-center justify-center cursor-pointer elevation-3')}
            />
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={open ? 'close' : 'palette'}
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={effectsTransition}
              className="flex items-center justify-center pointer-events-none"
              style={{
                color: open ? 'var(--color-on-secondary)' : 'var(--color-on-primary)',
              }}
            >
              {open ? <XIcon size={20} weight="bold" /> : <PaletteIcon size={28} />}
            </m.span>
          </AnimatePresence>
        </PopoverTrigger>
      </div>
      <AnimatePresence>
        {open && (
          <PopoverPortal keepMounted>
            <PopoverPositioner side="bottom" align="start" sideOffset={12} className="z-50">
              <PopoverPopup
                render={
                  <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                }
              >
                <AnimatedColorPicker />
              </PopoverPopup>
            </PopoverPositioner>
          </PopoverPortal>
        )}
      </AnimatePresence>
    </Popover>
  )
}
