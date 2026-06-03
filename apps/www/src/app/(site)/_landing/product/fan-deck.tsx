'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cx } from 'tailwind-variants'
import { Button } from '@/components/ui/button'

/**
 * Reusable fan-out card deck: a stacked pile that springs into an arc when
 * triggered. Hovering or focusing an open card straightens, lifts, and floats
 * it to the front. Content-agnostic — pass any nodes via `items` and tune the
 * geometry per use, so the same mechanic fits small cards or large phone frames.
 *
 * Two structural details keep it clean. Each card's centering shell is
 * pointer-events-none (so the top shell can't swallow hovers meant for cards
 * beneath it). And the stable wrapper holds only the horizontal spread + lean
 * with hover detection, while the inner visual layer carries everything that
 * either changes on hover or offsets vertically (the arc dip, lift, straighten,
 * scale). So hit areas never slide out from under the cursor AND stay vertically
 * aligned — sweeping up to the center isn't intercepted by the lower side cards,
 * which lets a hovered card safely paint on top. Responsiveness comes from
 * scaling the whole stage to fit its container, shrinking cards and offsets in
 * proportion.
 */

const FAN_TRANSITION = { type: 'tween', duration: 0.5, ease: [0.22, 1, 0.36, 1] } as const

export type FanItem = { id: string; content: React.ReactNode }

export type FanGeometry = {
  /** open (fanned) per-step offsets, multiplied by distance from center */
  spreadX: number
  dipY: number
  tilt: number
  /** collapsed (stacked) per-step offsets */
  stackX: number
  stackY: number
  stackTilt: number
}

const DEFAULT_GEOMETRY: FanGeometry = {
  spreadX: 208,
  dipY: 40,
  tilt: 10,
  stackX: 10,
  stackY: 6,
  stackTilt: 4,
}

export type FanDeckProps = {
  items: FanItem[]
  geometry?: Partial<FanGeometry>
  /** px the hovered card lifts. */
  hoverLift?: number
  /** fraction of the original lean a card keeps on hover (0 = upright). */
  hoverStraighten?: number
  triggerLabel?: { open: string; closed: string }
  /**
   * Sizes the stage the cards center in. Use a FIXED width (not `w-full`) so the
   * deck can measure its natural size and scale down to fit narrow viewports.
   */
  stageClassName?: string
  /** wraps each card (e.g. a per-card shadow). */
  itemClassName?: string
  defaultOpen?: boolean
}

export function FanDeck({
  items,
  geometry,
  hoverLift = 28,
  hoverStraighten = 0.35,
  triggerLabel = { open: 'Collapse', closed: 'Fan out' },
  stageClassName = 'h-[26rem] w-[48rem]',
  itemClassName,
  defaultOpen = false,
}: FanDeckProps) {
  const g = { ...DEFAULT_GEOMETRY, ...geometry }
  const [open, setOpen] = useState(defaultOpen)
  const [active, setActive] = useState<string | null>(null)
  const reduce = useReducedMotion() === true
  const transition = reduce ? { duration: 0 } : FAN_TRANSITION

  // Scale the fixed-width stage down so it fits a narrow container; the cards and
  // their px offsets shrink together, preserving the fan. The stage stays in flow
  // (so the slot always has a height — no first-paint collapse) and a negative
  // margin reclaims the whitespace left below the scaled-down content.
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [stageHeight, setStageHeight] = useState<number | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const stage = stageRef.current
    if (!container || !stage) return
    const measure = () => {
      const natural = stage.offsetWidth
      setStageHeight(stage.offsetHeight)
      setScale(natural > 0 ? Math.min(1, container.clientWidth / natural) : 1)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  // Center card sits highest; everything fans around it.
  const center = Math.floor(items.length / 2)

  return (
    <div ref={containerRef} className="flex w-full flex-col items-center gap-10">
      <Button
        variant={open ? 'outline' : 'brand'}
        size="lg"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full"
      >
        {open ? triggerLabel.open : triggerLabel.closed}
      </Button>
      <div className="relative flex w-full items-start justify-center overflow-x-clip">
        <div
          ref={stageRef}
          className={cx('relative shrink-0', stageClassName)}
          style={{
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top center',
            marginBottom:
              stageHeight != null && scale < 1 ? -(stageHeight * (1 - scale)) : undefined,
          }}
        >
          {items.map((item, index) => {
            const offset = index - center
            const target = open
              ? { x: offset * g.spreadX, y: Math.abs(offset) * g.dipY, rotate: offset * g.tilt }
              : {
                  x: offset * g.stackX,
                  y: Math.abs(offset) * g.stackY,
                  rotate: offset * g.stackTilt,
                }
            const isActive = open && active === item.id
            // why: a hovered card paints on top (fully visible). Safe to do now
            // that the dip is visual-only and hit areas stay vertically aligned,
            // so an upward sweep can't snag a lower side card. Center is the
            // resting top so it wins overlaps when nothing is hovered.
            const zIndex = isActive ? 50 : index === center ? 40 : 20 - Math.abs(offset)
            // Net lean lands at `hoverStraighten` of the rest lean (the wrapper holds the full lean).
            const innerRotate = isActive ? -target.rotate * (1 - hoverStraighten) : 0

            return (
              <motion.div
                key={item.id}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                animate={{ zIndex }}
                transition={transition}
              >
                <motion.div
                  animate={{ x: target.x, rotate: target.rotate }}
                  transition={transition}
                  onHoverStart={() => open && setActive(item.id)}
                  onHoverEnd={() => setActive((a) => (a === item.id ? null : a))}
                  onFocusCapture={() => open && setActive(item.id)}
                  onBlurCapture={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node))
                      setActive((a) => (a === item.id ? null : a))
                  }}
                  className="pointer-events-auto"
                >
                  <motion.div
                    animate={{
                      y: target.y - (isActive ? hoverLift : 0),
                      rotate: innerRotate,
                      scale: isActive ? 1.02 : 1,
                    }}
                    transition={transition}
                    className={itemClassName}
                  >
                    {item.content}
                  </motion.div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
