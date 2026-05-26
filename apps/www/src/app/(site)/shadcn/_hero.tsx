'use client'

import { type TokenMap, useResolvedTokens } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { m as motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { cn } from 'tailwind-variants'
import { ShadcnIcon } from '@/components/icons/shadcn'
import { Button } from '@/components/ui/button'
import { MenuColorPicker } from '@/features/color-picker/custom/menu-color-picker'

const SMOOTH = [0.22, 1, 0.36, 1] as const

// Diverging palette — primary ↔ secondary meet at a near-white neutral midpoint.
// Saturated peaks at the edges (tone 40, near MD3 chroma peak), pale tints inward.
// On mobile every other column is hidden so the silhouette stays a clean 7-strip V.
const COLUMNS = [
  { family: 'primary', tone: 40, drift: 12 },
  { family: 'primary', tone: 50, drift: 10 },
  { family: 'primary', tone: 60, drift: 14 },
  { family: 'primary', tone: 70, drift: 11 },
  { family: 'primary', tone: 80, drift: 13 },
  { family: 'primary', tone: 90, drift: 9 },
  { family: 'neutral', tone: 95, drift: 12 },
  { family: 'secondary', tone: 90, drift: 9 },
  { family: 'secondary', tone: 80, drift: 13 },
  { family: 'secondary', tone: 70, drift: 11 },
  { family: 'secondary', tone: 60, drift: 14 },
  { family: 'secondary', tone: 50, drift: 10 },
  { family: 'secondary', tone: 40, drift: 12 },
] as const

export function ShadcnHero() {
  const theme = useResolvedTokens()

  const columnColors = useMemo(() => {
    if (!theme) return []
    return COLUMNS.map((c) => ({
      ...c,
      hex: pickHex(theme.md.palette, `--color-${c.family}-${c.tone}`),
    }))
  }, [theme])

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      {theme !== null && (
        <div aria-hidden className="absolute inset-0 flex">
          {columnColors.map((c, i) => (
            <motion.div
              key={`${c.family}-${c.tone}`}
              initial={{ opacity: 0, scaleY: 0.4 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{
                opacity: { duration: 0.7, delay: 0.05 + i * 0.045, ease: SMOOTH },
                scaleY: { duration: 0.9, delay: 0.05 + i * 0.045, ease: SMOOTH },
                y: {
                  duration: c.drift,
                  delay: 1 + i * 0.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                },
              }}
              style={{
                backgroundColor: c.hex,
                transformOrigin: 'bottom center',
                boxShadow: `1px 0 0 0 ${c.hex}`,
              }}
              className={cn(
                'group relative flex-1 focus:outline-none',
                i % 2 === 1 && 'hidden md:block',
              )}
              aria-label={`Seed from ${c.family} tone ${c.tone}`}
            />
          ))}
        </div>
      )}

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 45%, color-mix(in oklch, var(--color-surface) 70%, transparent) 0%, transparent 75%)',
        }}
      />
      <div className="absolute top-12 right-12">
        <MenuColorPicker />
      </div>

      <div className="relative z-20 mt-auto mb-auto flex flex-col items-center px-4 sm:px-6 py-8 sm:py-10 text-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: SMOOTH }}
          className="mb-6 sm:mb-8 text-xs sm:text-xs uppercase tracking-[0.28em] sm:tracking-[0.32em] text-on-surface"
          style={{ fontFamily: 'var(--shadcn-hero-mono)', fontWeight: 500 }}
        >
          Diverging palette · primary ↔ secondary · 2 systems
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: SMOOTH }}
          className="max-w-[14ch] text-[clamp(64px,9vw,240px)] leading-[0.9] sm:leading-[1.1] tracking-[-0.045em] text-balance font-black"
          style={{ fontFamily: 'var(--shadcn-hero-display)' }}
        >
          Pro-grade color tools, finally for the web.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.95, ease: SMOOTH }}
          className="mt-8 sm:mt-10 max-w-[44ch] text-sm sm:text-base leading-relaxed"
          style={{ fontFamily: 'var(--shadcn-hero-mono)', fontWeight: 400 }}
        >
          Real HCT. Five tonal families. Per-token contrast audit. MD3 and shadcn emit from the same
          source — no second pass, no drift.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.15, ease: SMOOTH }}
          className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <Button
            nativeButton={false}
            size="lg"
            className="rounded-xl px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base"
            render={<Link href="/theme/shadcn" />}
          >
            Shadcn Mode
            <ShadcnIcon className="ml-2 size-4 sm:size-5 text-surface-container-lowest" />
          </Button>
          <Button
            variant="inverse"
            nativeButton={false}
            render={<Link href="/theme" />}
            size="lg"
            className="rounded-xl px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base"
          >
            Try Tonex
            <Image
              loading="eager"
              src="/logo.png"
              alt="Logo"
              width={200}
              height={200}
              className="object-contain ml-2 size-4 sm:size-5"
            />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

function pickHex(palette: TokenMap, key: string, fallback = '#000000') {
  const argb = palette[key]
  return argb === undefined ? fallback : hexString(argb)
}
