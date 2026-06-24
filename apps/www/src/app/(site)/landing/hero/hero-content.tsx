'use client'

import { m as motion, type Variants } from 'motion/react'
import { CtaButtons } from '../cta-buttons'

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
      <motion.h1
        variants={item}
        className="text-[clamp(40px,6vw,96px)] font-semibold leading-tight sm:leading-none tracking-tight text-on-surface mb-8 font-display"
      >
        The color layer for your
        <br /> design system
      </motion.h1>
      <div className="ml-2">
        <motion.p variants={item} className="text-xl max-w-xl mb-10 text-pretty">
          Built on perceptual color science. One color becomes a full, role-mapped token set -
          coherent in any system it's bound into.
        </motion.p>
        <CtaButtons />
      </div>
    </motion.div>
  )
}
