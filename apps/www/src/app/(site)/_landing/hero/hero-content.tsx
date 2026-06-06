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
      <motion.span
        variants={item}
        className="mb-5 inline-flex items-center flex-wrap text-xs font-mono uppercase tracking-widest text-on-surface-variant gap-4"
      >
        preview beta
      </motion.span>
      <motion.h1
        variants={item}
        className="text-[clamp(40px,6vw,96px)] font-semibold leading-tight sm:leading-none tracking-tight text-on-surface mb-8 font-display"
      >
        Pro-grade color system.
        <br />
        Yours only.
      </motion.h1>
      <motion.p
        variants={item}
        className="text-xl text-on-surface-variant max-w-[54ch] mb-10 text-pretty"
      >
        Built on perceptual color science.
        <br /> One seed, one coherent palette, one identity across every product.
      </motion.p>
      <CtaButtons />
    </motion.div>
  )
}
