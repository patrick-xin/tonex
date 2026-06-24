'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cx } from 'tailwind-variants'

// why: z-index is set INSTANTLY via `style`, never animated — and it resets the
// moment hover ends, *before* the card animates back, not after. Animating it as
// a number lets the order creep through fractional values mid-tween (jitter), so
// z is pure: raise on enter, drop on leave, position animation follows under it.
//
// why (load-bearing structure): each card's centering shell is
// pointer-events-none so the top shell can't swallow hovers meant for cards
// beneath it; the middle layer holds the horizontal spread + lean + hover
// detection, the inner visual layer carries the arc dip/lift/straighten/scale.
// So hit areas never slide out from under the cursor — an upward sweep can't
// snag a lower side card, which lets a hovered card safely paint on top.

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

// Shared by every card — the single knob for the fan's feel. Tweak here.
const DEFAULT_GEOMETRY: FanGeometry = {
  spreadX: 208,
  dipY: 40,
  tilt: 10,
  stackX: 10,
  stackY: 6,
  stackTilt: 4,
}

export type FanDeckHoverProps = {
  items: FanItem[]
  geometry?: Partial<FanGeometry>
  /** px the hovered card lifts. */
  hoverLift?: number
  /** fraction of the original lean a card keeps on hover (0 = upright). */
  hoverStraighten?: number
  /**
   * Sizes the stage the cards center in. Use a FIXED width (not `w-full`) so the
   * deck can measure its natural size and scale down to fit narrow viewports.
   */
  stageClassName?: string
  /** wraps each card (e.g. a per-card shadow). */
  itemClassName?: string
}

export function FanDeckHover({
  items,
  geometry,
  hoverLift = 28,
  hoverStraighten = 0.35,
  stageClassName = 'h-[26rem] w-[48rem]',
  itemClassName,
}: FanDeckHoverProps) {
  const g = { ...DEFAULT_GEOMETRY, ...geometry }
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  // Gates hover lift/z until the fan-out spread has finished — see effect below.
  const [settled, setSettled] = useState(false)
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

  // Fan out first, then allow hover. While the deck opens, `settled` stays false
  // so no card can lift or jump to the top mid-spread; it flips true once the
  // spread animation would have finished, after which the card under the pointer
  // activates normally. Reduced motion (no spread to wait on) settles at once.
  useEffect(() => {
    if (!open) {
      setSettled(false)
      return
    }
    if (reduce) {
      setSettled(true)
      return
    }
    const timer = setTimeout(() => setSettled(true), FAN_TRANSITION.duration * 1000)
    return () => clearTimeout(timer)
  }, [open, reduce])

  // Center card sits highest; everything fans around it.
  const center = Math.floor(items.length / 2)

  const collapse = () => {
    setOpen(false)
    setActive(null)
  }

  return (
    <div ref={containerRef} className="flex w-full flex-col items-center">
      <div className="relative flex w-full items-start justify-center overflow-x-clip">
        {/* biome-ignore lint/a11y/noStaticElementInteractions: presentational hover/focus hit-zone that fans the decorative card deck — the cards inside are the interactive elements; onFocusCapture/onBlurCapture give keyboard parity */}
        <div
          ref={stageRef}
          className={cx('relative shrink-0', stageClassName)}
          // Hover/focus the stage to fan out; leaving collapses it. The stage is
          // sized to the *open* spread, so it's a stable hit zone — the cards
          // sliding underneath never change what counts as "inside".
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={collapse}
          onFocusCapture={() => setOpen(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) collapse()
          }}
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
            const isActive = settled && active === item.id
            // why: z-index lives in `style` so it flips instantly — raised the
            // moment a card is hovered, dropped the moment it isn't, *before* the
            // position animates back. A hovered card paints on top (50); center
            // is the resting top (40); side cards layer by distance otherwise.
            const zIndex = isActive ? 50 : index === center ? 40 : 20 - Math.abs(offset)
            // Net lean lands at `hoverStraighten` of the rest lean (the wrapper holds the full lean).
            const innerRotate = isActive ? -target.rotate * (1 - hoverStraighten) : 0

            const release = () => setActive((a) => (a === item.id ? null : a))

            return (
              <div
                key={item.id}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                style={{ zIndex }}
              >
                <motion.div
                  animate={{ x: target.x, rotate: target.rotate }}
                  transition={transition}
                  onHoverStart={() => setActive(item.id)}
                  onHoverEnd={release}
                  onFocusCapture={() => setActive(item.id)}
                  onBlurCapture={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) release()
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
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
