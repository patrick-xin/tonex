import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export const BrandHover = ({
  text,
  duration,
}: {
  text: string
  duration?: number
  automatic?: boolean
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [maskPosition, setMaskPosition] = useState({ cx: '50%', cy: '50%' })
  const reduceMotion = useReducedMotion()
  const [isMounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect()
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      })
    }
  }, [cursor])

  // why: viewBox aspect (4:1) drives the rendered height because the svg is
  // `w-full h-auto` — so the wordmark always spans the footer width and the band
  // height scales with it, instead of the old `height=100%` + `meet` version that
  // floated a small word in the middle of wide screens. textLength then stretches
  // the glyphs to fill that width on every breakpoint.
  const FILL = 300 // user units; ~94% of the 320-wide viewBox, leaves a hair of inset
  const textProps = {
    x: '50%',
    y: '50%',
    textAnchor: 'middle' as const,
    dominantBaseline: 'middle' as const,
    textLength: FILL,
    lengthAdjust: 'spacingAndGlyphs' as const,
    strokeWidth: '0.3',
  }

  if (!isMounted) return null

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 320 80"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      aria-hidden="true"
      className="block h-auto w-full select-none"
    >
      <defs>
        <linearGradient id="textGradient" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="25%">
          {hovered && (
            <>
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="25%" stopColor="var(--color-chart-5)" />
              <stop offset="50%" stopColor="var(--color-secondary)" />
              <stop offset="75%" stopColor="var(--color-chart-3)" />
              <stop offset="100%" stopColor="var(--color-tertiary)" />
            </>
          )}
        </linearGradient>
        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: '50%', cy: '50%' }}
          animate={maskPosition}
          transition={{ duration: reduceMotion ? 0 : (duration ?? 0), ease: 'easeOut' }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>
      <text
        {...textProps}
        className="fill-transparent stroke-outline-variant text-6xl font-bold font-display"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        {...textProps}
        className="fill-transparent stroke-outline-variant text-6xl font-bold font-display"
        initial={
          reduceMotion
            ? { strokeDashoffset: 0, strokeDasharray: 1000 }
            : { strokeDashoffset: 1000, strokeDasharray: 1000 }
        }
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: reduceMotion ? 0 : 4,
          ease: 'easeInOut',
        }}
      >
        {text}
      </motion.text>
      <text
        {...textProps}
        stroke="url(#textGradient)"
        mask="url(#textMask)"
        className="fill-transparent text-6xl font-bold font-display"
      >
        {text}
      </text>
    </svg>
  )
}
