'use client'

import { ArrowRight } from 'lucide-react'
import { m as motion, type Variants } from 'motion/react'
import Link from 'next/link'
import { ShadcnIcon } from '@/components/icons/shadcn'
import { Button } from '@/components/ui/button'

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

export function HeroContent() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col items-start justify-center"
    >
      <motion.span
        variants={item}
        className="mb-8 text-xs font-mono uppercase tracking-[0.18em] text-on-surface-variant"
      >
        2026 spec · Open source
      </motion.span>

      <motion.h1
        variants={item}
        className="text-[clamp(40px,6vw,104px)] font-semibold leading-[0.92] tracking-[-0.045em] text-on-surface mb-8"
      >
        The MD3 engine.
        <br />
        <span className="inline bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent pb-1">
          With dials.
        </span>
      </motion.h1>

      <motion.p
        variants={item}
        className="text-[17px] text-on-surface-variant leading-normal max-w-[54ch] mb-10 text-pretty tracking-[-0.005em]"
      >
        Real HCT math, not an approximation. Per-role pins layered on top. Contrast audited across
        every token pair the page uses.{' '}
        <strong className="text-on-surface font-medium">
          shadcn tokens emit alongside the MD3 theme — no second pass.
        </strong>
      </motion.p>

      <motion.div variants={item} className="flex flex-wrap items-center gap-4">
        <Button
          nativeButton={false}
          render={<Link href="/theme" />}
          size="lg"
          className="rounded-xl px-8 h-12 text-base font-semibold shadow-2xl"
        >
          Try tonex
          <ArrowRight className="ml-2 size-5" />
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          size="lg"
          className="rounded-xl px-8 h-12 text-base font-medium"
          render={<Link href="/theme/shadcn" />}
        >
          shadcn mode
          <ShadcnIcon className="ml-2 size-5" />
        </Button>
      </motion.div>

      <motion.div
        variants={item}
        className="mt-10 flex flex-wrap items-center gap-4 text-sm font-mono text-on-surface-variant"
      >
        <span>No signup</span>
        <div className="size-1 rounded-full bg-outline" />
        <span>MIT licensed</span>
      </motion.div>
    </motion.div>
  )
}
