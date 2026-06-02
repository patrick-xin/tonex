'use client'

import { hexFromHct, selectSeedHex } from '@tonex/core'
import { useSource } from '@tonex/core-react'
import {
  animate,
  MotionValue,
  m as motion,
  type SpringOptions,
  type Transition,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'tailwind-variants'

function usePointerPosition() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [x, y])

  return { x, y }
}

function calculateAngle(index: number, totalInRing: number): number {
  return (index / totalInRing) * Math.PI * 2
}

function calculateBasePosition(angle: number, radius: number) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}

function calculateHue(angle: number): number {
  const hueDegrees = (angle * 180) / Math.PI - 90 - 180
  return ((hueDegrees % 360) + 360) % 360
}

const spatialTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 22,
  mass: 1,
}

const effectsTransition: Transition = {
  type: 'spring',
  stiffness: 1600,
  damping: 60,
  mass: 1,
}

function hctHex(hue: number, chroma: number, tone: number): string {
  return hexFromHct({ hue, chroma, tone })
}

const DEFAULT_SEED_HEX = '#6750a4'

interface ColorDotProps {
  ring: number
  index: number
  totalInRing: number
  centerX: number
  centerY: number
  pointerX: ReturnType<typeof usePointerPosition>['x']
  pointerY: ReturnType<typeof usePointerPosition>['y']
  pushMagnitude: number
  pushSpring: SpringOptions
  radius: number
  ringRadius: number
  dotSize: number
  selectedHex: string | null
  onSelectHex: (hex: string | null) => void
}

function ColorDot({
  ring,
  index,
  totalInRing,
  centerX,
  centerY,
  pointerX,
  pointerY,
  pushMagnitude,
  pushSpring,
  radius,
  ringRadius,
  dotSize,
  selectedHex,
  onSelectHex,
}: ColorDotProps) {
  const baseRadius = ring * ringRadius
  const angle = calculateAngle(index, totalInRing)
  const { x: baseX, y: baseY } = calculateBasePosition(angle, baseRadius)

  let dotHex = DEFAULT_SEED_HEX
  if (ring !== 0) {
    const hctHue = calculateHue(angle)
    const [chroma, tone] = ring === 1 ? [30, 85] : [80, 60]
    dotHex = hctHex(hctHue, chroma, tone)
  }

  const isSelected = selectedHex !== null && selectedHex === dotHex

  const pushDistance = useTransform(() => {
    if (centerX === 0 || centerY === 0) return 0
    const px = pointerX.get()
    const py = pointerY.get()
    const dx = px - centerX
    const dy = py - centerY
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)
    if (distanceFromCenter > radius) return 0

    const dotX = centerX + baseX
    const dotY = centerY + baseY
    const cursorToDotX = dotX - px
    const cursorToDotY = dotY - py
    const cursorToDotDistance = Math.sqrt(cursorToDotX * cursorToDotX + cursorToDotY * cursorToDotY)
    const minDistance = 80
    if (cursorToDotDistance < minDistance) {
      return (1 - cursorToDotDistance / minDistance) * pushMagnitude
    }
    return 0
  })

  const pushAngle = useTransform(() => {
    if (centerX === 0 || centerY === 0) return angle
    const px = pointerX.get()
    const py = pointerY.get()
    const dotX = centerX + baseX
    const dotY = centerY + baseY
    return Math.atan2(dotY - py, dotX - px)
  })

  const pushX = useTransform(() => Math.cos(pushAngle.get()) * pushDistance.get())
  const pushY = useTransform(() => Math.sin(pushAngle.get()) * pushDistance.get())

  const springPushX = useSpring(pushX, pushSpring)
  const springPushY = useSpring(pushY, pushSpring)

  const x = useTransform(() => baseX + springPushX.get())
  const y = useTransform(() => baseY + springPushY.get())

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer"
      style={{
        x,
        y,
        width: dotSize,
        height: dotSize,
        backgroundColor: dotHex,
        willChange: 'transform, background-color',
      }}
      variants={{
        default: { scale: 1 },
        hover: { scale: 1.5, transition: effectsTransition },
        tap: { scale: 1.2, transition: effectsTransition },
      }}
      initial="default"
      whileHover="hover"
      whileTap="tap"
      onTap={() => {
        if (ring === 0) {
          onSelectHex(dotHex)
          return
        }
        onSelectHex(isSelected ? null : dotHex)
      }}
      aria-label={`Seed color ${dotHex}`}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-white mix-blend-overlay pointer-events-none"
        variants={{
          default: { opacity: 0 },
          hover: {
            opacity: isSelected ? 0.7 : 0.4,
            transition: effectsTransition,
          },
        }}
      />
    </motion.div>
  )
}

interface GradientCircleProps {
  index: number
  totalInRing: number
  centerX: number
  centerY: number
  pointerX: ReturnType<typeof usePointerPosition>['x']
  pointerY: ReturnType<typeof usePointerPosition>['y']
  containerRadius: number
  glowSize: number
}

function GradientCircle({
  index,
  totalInRing,
  centerX,
  centerY,
  pointerX,
  pointerY,
  containerRadius,
  glowSize,
}: GradientCircleProps) {
  const angle = calculateAngle(index, totalInRing)
  const baseRadius = containerRadius - 40
  const { x: baseX, y: baseY } = calculateBasePosition(angle, baseRadius)
  const normalizedHue = calculateHue(angle)
  const gradient = `radial-gradient(circle, hsla(${normalizedHue}, 90%, 60%, 1) 0%, hsla(${normalizedHue}, 90%, 60%, 0) 66%)`

  const proximity = useTransform(() => {
    if (centerX === 0 || centerY === 0) return 0
    const px = pointerX.get()
    const py = pointerY.get()
    const gradientX = centerX + baseX
    const gradientY = centerY + baseY
    const dx = px - gradientX
    const dy = py - gradientY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = 100
    return Math.max(0, 1 - distance / maxDistance)
  })

  const { opacity, scale } = useTransform(proximity, [0, 1], {
    opacity: [0.15, 0.35],
    scale: [1, 1.2],
  })

  const springOpacity = useSpring(opacity, { damping: 30, stiffness: 100 })
  const springScale = useSpring(scale, { damping: 30, stiffness: 100 })

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      style={{
        x: baseX,
        y: baseY,
        width: glowSize,
        height: glowSize,
        opacity: springOpacity,
        scale: springScale,
        background: gradient,
        mixBlendMode: 'color-burn',
        willChange: 'transform, opacity',
      }}
    />
  )
}

interface AnimatedColorPickerProps {
  pushMagnitude?: number
  pushSpring?: SpringOptions
  className?: string
  /**
   * Outer disc size in px. Inner ring radius and dot size scale from this.
   * Default 160 keeps parity with the prototype.
   */
  size?: number
}

export function AnimatedColorPicker({
  pushMagnitude = 5,
  pushSpring = { damping: 30, stiffness: 100 },
  className,
  size = 160,
}: AnimatedColorPickerProps) {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const containerRef = useRef<HTMLDivElement>(null)
  const [{ centerX, centerY, radius }, setContainerDimensions] = useState({
    centerX: 0,
    centerY: 0,
    radius: size / 2,
  })

  const pointer = usePointerPosition()

  const [selectedHex, setSelectedHex] = useState<string | null>(seedHex)

  useEffect(() => {
    setSelectedHex(seedHex)
  }, [seedHex])

  const handleSelectHex = (hex: string | null) => {
    setSelectedHex(hex)
    if (hex !== null) {
      setSeedHex(hex)
    }
  }

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const update = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setContainerDimensions({
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        radius: rect.width / 2,
      })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
    }
  }, [])

  const rings = [{ count: 1 }, { count: 6 }, { count: 12 }]
  const dots: Array<{ ring: number; index: number; totalInRing: number }> = []
  rings.forEach((ring, ringIndex) => {
    for (let i = 0; i < ring.count; i++) {
      dots.push({ ring: ringIndex, index: i, totalInRing: ring.count })
    }
  })

  const originalStopValues = useMemo(() => {
    const values: string[] = []
    for (let i = 0; i <= 360; i += 30) {
      values.push(`hsl(${i}, 90%, 60%)`)
    }
    return values
  }, [])

  const stopMotionValues = useMemo(
    () => originalStopValues.map((v: string) => new MotionValue(v)),
    [originalStopValues],
  )

  useEffect(() => {
    if (selectedHex !== null) {
      for (const stopValue of stopMotionValues) {
        animate(stopValue, selectedHex, { duration: 0.2 })
      }
    } else {
      for (let i = 0; i < stopMotionValues.length; i++) {
        animate(stopMotionValues[i], originalStopValues[i], { duration: 0.2 })
      }
    }
  }, [selectedHex, stopMotionValues, originalStopValues])

  const gradientBackground = useTransform(() => {
    let stops = ''
    for (let i = 0; i < stopMotionValues.length; i++) {
      stops += stopMotionValues[i].get()
      if (i < stopMotionValues.length - 1) stops += ', '
    }
    return `conic-gradient(from 0deg, ${stops})`
  })

  const gradientScale = useMotionValue(1)

  useEffect(() => {
    animate(
      gradientScale,
      selectedHex !== null ? 1.1 : 1,
      selectedHex !== null
        ? { ...spatialTransition, velocity: 2 }
        : { ...spatialTransition, damping: 40 },
    )
  }, [selectedHex, gradientScale])

  const ringRadius = size * 0.125
  const dotSize = Math.max(18, Math.round(size * 0.2))
  const glowSize = Math.round(size * 0.95)

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 size-full">
        <motion.div
          className="absolute inset-0 size-full rounded-full"
          style={{ background: gradientBackground, scale: gradientScale }}
        />
        <motion.div
          className="absolute inset-0 size-full rounded-full bg-surface-container"
          animate={{ scale: selectedHex !== null ? 0.88 : 0.98 }}
          transition={spatialTransition}
        />
      </div>

      <div
        ref={containerRef}
        className="relative rounded-full overflow-visible z-2 w-[calc(100%-5px)] h-[calc(100%-5px)]"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <GradientCircle
            key={`gradient-${String(index)}`}
            index={index}
            totalInRing={6}
            centerX={centerX}
            centerY={centerY}
            pointerX={pointer.x}
            pointerY={pointer.y}
            containerRadius={radius}
            glowSize={glowSize}
          />
        ))}

        {dots
          .slice()
          .reverse()
          .map((dot) => (
            <ColorDot
              key={`${dot.ring}-${dot.index}`}
              ring={dot.ring}
              index={dot.index}
              totalInRing={dot.totalInRing}
              centerX={centerX}
              centerY={centerY}
              pointerX={pointer.x}
              pointerY={pointer.y}
              radius={radius}
              ringRadius={ringRadius}
              dotSize={dotSize}
              pushMagnitude={pushMagnitude}
              pushSpring={pushSpring}
              selectedHex={selectedHex}
              onSelectHex={handleSelectHex}
            />
          ))}
      </div>
    </div>
  )
}
