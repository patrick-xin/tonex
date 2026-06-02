'use client'

import { m, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/lib/hooks/use-mobile'
import { LandingLogo } from '../_landing/landing-logo'

const STICK_OFFSET = 80

export function SiteHeader() {
  const [isStuck, setIsStuck] = useState(false)
  const isMobile = useIsMobile()
  const reduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => {
    setIsStuck(y > STICK_OFFSET)
  })

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 sm:px-24 mx-auto h-20">
      <m.div
        initial={false}
        animate={{
          width: isStuck && !isMobile ? '80%' : '100%',
          height: isStuck && !isMobile ? '80%' : '100%',
          y: isStuck ? 4 : 0,
        }}
        transition={transition}
        className="relative flex items-center justify-between gap-2 px-4"
      >
        <m.div
          aria-hidden
          initial={false}
          animate={{ opacity: isStuck ? 1 : 0 }}
          transition={transition}
          className={cn(
            'pointer-events-none absolute inset-0 -z-10 rounded-md',
            'bg-surface/40 backdrop-blur-sm shadow-lg shadow-black/5',
          )}
        />
        <LandingLogo />
        <Button nativeButton={false} render={<Link href="/theme" />} variant="brand">
          Build your own
        </Button>
      </m.div>
    </header>
  )
}
