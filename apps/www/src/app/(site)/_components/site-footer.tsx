'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { GitHubLink } from '@/components/shared/chrome/github-link'
import { XLink } from '@/components/shared/chrome/x-link'

export const TextHoverEffect = ({
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

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      aria-hidden="true"
      className="select-none"
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
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-outline-variant text-7xl font-bold"
        style={{ opacity: hovered ? 0.7 : 0 }}
      >
        {text}
      </text>
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        className="fill-transparent stroke-outline-variant text-7xl font-bold"
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
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.3"
        mask="url(#textMask)"
        className="fill-transparent text-7xl font-bold"
      >
        {text}
      </text>
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-outline-variant/80">
      <div className="mx-auto w-full">
        <div className="aspect-3/1 w-full">
          <TextHoverEffect text="TONEX" />
        </div>
        <div className="relative z-20 mt-[-14%] bg-surface-container">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 py-4 text-sm text-on-surface-variant sm:flex-row sm:py-10">
            <ul className="flex items-center gap-4">
              <li>
                <XLink />
              </li>
              <li>
                <GitHubLink />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
