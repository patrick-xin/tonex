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
        className="mb-8 text-xs font-mono uppercase tracking-widest text-on-surface-variant"
      >
        2026 spec · Open source
      </motion.span>
      <motion.h1
        variants={item}
        className="text-[clamp(40px,6vw,96px)] font-semibold leading-tight sm:leading-none tracking-tight text-on-surface mb-8"
      >
        Pro-grade color tools,
        <br />
        <span>made for the web.</span>
      </motion.h1>
      <motion.p
        variants={item}
        className="text-lg font-medium text-on-surface-variant max-w-[54ch] mb-10 text-pretty"
      >
        Real HCT math, not an approximation. Per-role pins layered on top. Contrast audited across
        every token pair the page uses.
      </motion.p>
      <motion.div variants={item} className="flex flex-wrap items-center gap-4">
        <Button
          nativeButton={false}
          render={<Link href="/theme" />}
          size="lg"
          className="px-8 h-12 text-base font-semibold shadow-2xl"
        >
          Try tonex
          <ArrowRight className="ml-2 size-5" />
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          size="lg"
          className="px-8 h-12 text-base font-medium"
          render={<Link href="/theme/shadcn" />}
        >
          shadcn mode
          <ShadcnIcon className="ml-2 size-5" />
        </Button>
      </motion.div>
    </motion.div>
  )
}
