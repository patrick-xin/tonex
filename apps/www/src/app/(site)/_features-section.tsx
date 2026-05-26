'use client'

import { type TokenMap, useResolvedTokens } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { type MotionValue, m as motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'
import { useActiveMode } from '@/features/theme-mode'

const ANIMATION_SECTIONS = [
  {
    id: '01',
    title: 'Override the algorithm',
    description:
      'Five layers between seed and output: fine-tune the palettes, pin individual roles per mode, override shadcn roles, remap which MD token feeds each shadcn role. Every layer is reversible.',
  },
  {
    id: '02',
    title: 'Contrast is an audit, not a gate',
    description:
      'Every token pair the page uses, grouped failing / passing / decorative. AA and AAA toggle. Chart colors checked against both background and card surface. The algorithm informs. You decide.',
  },
  {
    id: '03',
    title: 'shadcn from the inside',
    description:
      'Remap which MD token feeds each shadcn role. Built by someone also building a shadcn-flavored Base UI library — the bindings track how shadcn tokens actually get used.',
  },
  {
    id: '04',
    title: 'CMF + four-variant groups',
    description:
      'The only 2026-spec aware tool. Dual source for tertiary + error. Variants grouped by CMF, Standard, Expressive, and Subdued — pick a character, not just a hue.',
  },
] as const

const PALETTE_MAP: Record<string, 'primary' | 'secondary' | 'tertiary' | 'neutral'> = {
  '01': 'primary',
  '02': 'tertiary',
  '03': 'neutral',
  '04': 'secondary',
}

function paletteColor(palette: TokenMap, family: string, tone: number): string {
  const argb = palette[`--color-${family}-${tone}`]
  return argb !== undefined ? hexString(argb) : '#000000'
}

function StackedFeature({
  section,
  index,
  progress,
}: {
  section: (typeof ANIMATION_SECTIONS)[number]
  index: number
  progress: MotionValue<number>
}) {
  const totalSections = ANIMATION_SECTIONS.length
  const step = 1 / (totalSections - 1)
  const theme = useResolvedTokens()
  const mode = useActiveMode()

  const nextStart = (index - 1) * step
  const nextEnd = index * step
  const start = index * step
  const end = (index + 1) * step

  const y = useTransform(progress, [nextStart, nextEnd], [index === 0 ? '0%' : '120vh', '0%'])
  const scale = useTransform(progress, [start, end], [1, 0.94])

  if (theme === null || mode === null) return null

  const isDark = mode === 'dark'
  const family = PALETTE_MAP[section.id]
  const bg = paletteColor(theme.md.palette, family, isDark ? 40 : 80)
  const fg = paletteColor(theme.md.palette, family, isDark ? 90 : 20)
  const mutedFg = paletteColor(theme.md.palette, family, isDark ? 70 : 50)
  const decorFg = `color-mix(in oklch, ${fg} 6%, ${bg})`
  const stripTones = isDark ? [60, 70, 80, 90] : [10, 30, 50, 70]

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        style={{
          y,
          scale: index === totalSections - 1 ? 1 : scale,
          zIndex: index,
          background: bg,
          color: fg,
        }}
        className="w-full h-[70vh] rounded-md flex flex-col md:flex-row items-center overflow-hidden relative"
      >
        <div className="flex-1 p-4 sm:p-16 flex flex-col justify-center gap-6">
          <div style={{ color: mutedFg }} className="font-mono text-sm uppercase tracking-[0.18em]">
            Feature {section.id}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{section.title}</h2>
          <p className="text-lg md:text-xl leading-relaxed max-w-sm">{section.description}</p>
        </div>
        <div className="hidden md:flex flex-1 h-full bg-surface-tint/5 items-center justify-center relative">
          <div
            style={{ color: decorFg }}
            className="text-[20rem] font-black absolute right-6 -top-20 select-none"
          >
            {section.id}
          </div>
          <div
            className="absolute -inset-1 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${bg} 0%, transparent 70%), linear-gradient(to left, ${bg} 0%, transparent 50%)`,
            }}
          />
          <div className="relative z-10 flex flex-col gap-2">
            {stripTones.map((tone) => (
              <div
                key={tone}
                className="size-20 rounded-lg shadow-md"
                style={{ backgroundColor: paletteColor(theme.md.palette, family, tone) }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function FeaturesSection() {
  const containerRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 120,
    mass: 0.4,
  })

  return (
    <section
      ref={containerRef}
      className="relative h-[260vh] px-4 sm:h-[450vh] sm:px-12 lg:px-16 xl:px-24"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        {ANIMATION_SECTIONS.map((section, index) => (
          <StackedFeature
            key={section.id}
            section={section}
            index={index}
            progress={smoothProgress}
          />
        ))}
      </div>
    </section>
  )
}
