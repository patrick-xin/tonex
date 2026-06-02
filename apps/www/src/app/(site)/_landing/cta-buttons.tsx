'use client'

import { ArrowRight } from 'lucide-react'
import { m as motion, type Variants } from 'motion/react'
import Link from 'next/link'
import { cn } from 'tailwind-variants'
import { ShadcnIcon } from '@/components/icons/shadcn'
import { Button } from '@/components/ui/button'

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

export function CtaButtons({ className }: { className?: string }) {
  return (
    <motion.div
      variants={item}
      className={cn('flex flex-wrap items-center gap-4 w-full', className)}
    >
      <Button
        variant="brand"
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
        Shadcn mode
        <ShadcnIcon className="ml-2 size-5" />
      </Button>
    </motion.div>
  )
}
