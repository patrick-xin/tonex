'use client'

import { m, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from 'tailwind-variants'
import { SiteLogo } from '@/components/shared/chrome/site-logo'
import { RainbowButton } from '@/components/shared/rainbow-button'
import { useIsMobile } from '@/lib/hooks/use-mobile'

const STICK_OFFSET = 80

export function SiteHeader() {
  const [isStuck, setIsStuck] = useState(false)
  // The header lives in a persistent layout, so its state survives navigation.
  // Only animate after a real user scroll: on a route change we snap to the new
  // page's scroll position instantly (`animate` reset to false), then re-arm on
  // the next genuine scroll input. `initial={false}` can't help here because the
  // dock/undock is a post-mount state change, not a mount.
  const [animate, setAnimate] = useState(false)
  const isMobile = useIsMobile()
  const reduceMotion = useReducedMotion()
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => {
    setIsStuck(y > STICK_OFFSET)
  })

  useEffect(() => {
    // On mount and on every route change, snap to the correct state for the
    // current scroll position without animating, then re-arm on user scroll.
    setAnimate(false)
    setIsStuck(window.scrollY > STICK_OFFSET)
    const enable = () => setAnimate(true)
    const opts = { once: true, passive: true } as const
    window.addEventListener('wheel', enable, opts)
    window.addEventListener('touchmove', enable, opts)
    window.addEventListener('keydown', enable, { once: true })
    return () => {
      window.removeEventListener('wheel', enable)
      window.removeEventListener('touchmove', enable)
      window.removeEventListener('keydown', enable)
    }
  }, [])

  const transition =
    reduceMotion || !animate
      ? { duration: 0 }
      : { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 sm:px-24 mx-auto h-14 sm:h-20">
      <m.div
        initial={false}
        animate={{
          width: isStuck && !isMobile ? '90%' : '100%',
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
          className={cn('pointer-events-none absolute inset-0 -z-10 rounded-md')}
        />
        <SiteLogo />
        <RainbowButton />
      </m.div>
    </header>
  )
}
