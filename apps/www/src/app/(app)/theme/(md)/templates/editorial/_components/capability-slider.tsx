'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { CAPABILITIES } from '../data'

export default function CapabilitySlider() {
  const [activeIndex, setActiveIndex] = useState(0)
  const current = CAPABILITIES[activeIndex]
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % CAPABILITIES.length)
  }
  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + CAPABILITIES.length) % CAPABILITIES.length)
  }

  return (
    <div
      id="capability-slider-container"
      className="flex flex-col h-full justify-between p-6 md:p-8 bg-surface text-on-surface"
    >
      <div className="flex justify-between items-start border-b border-outline-variant pb-4 mb-6">
        <span className="font-mono text-xs tracking-wider text-on-surface-variant font-medium">
          STUDIO CAPABILITY
        </span>
        <div className="flex gap-1.5">
          {CAPABILITIES.map((cap, idx) => (
            <button
              type="button"
              key={cap.id}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                'group flex flex-col items-center cursor-pointer',
                focusVisiblePrimaryRing,
              )}
              title={`Switch to ${cap.title}`}
            >
              <span
                className={`font-mono text-xs transition-colors mb-1 ${
                  idx === activeIndex ? 'text-primary font-bold' : 'text-on-surface-variant'
                }`}
              >
                {cap.number.split('/')[0]}
              </span>
              <div
                className={`h-1 w-6 transition-all duration-300 rounded ${
                  idx === activeIndex
                    ? 'bg-primary'
                    : 'bg-surface-container-highest hover:bg-outline'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden grow flex flex-col justify-center min-h-55">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col justify-between h-full"
          >
            <div>
              <div className="font-display text-4xl italic text-primary/80 font-semibold mb-2">
                {current.number}
              </div>
              <h3 className="font-sans text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-4 uppercase">
                {current.title}{' '}
                <span className="font-display italic font-medium normal-case block text-on-surface-variant mt-1 text-lg md:text-xl">
                  & {current.serfWord}
                </span>
              </h3>
              <p className="text-on-surface-variant leading-relaxed mb-6 max-w-md">
                {current.description}
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4 border-t border-outline-variant pt-4">
                {current.details.map((detail, idx) => (
                  <li
                    key={String(idx)}
                    className="flex items-start gap-2 text-xs text-on-surface-variant"
                  >
                    <span className="text-primary mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-between items-center border-t border-outline-variant pt-4 mt-6">
        <button
          type="button"
          onClick={handlePrev}
          className={cn(
            'group flex items-center gap-1.5 text-xs font-mono tracking-wider text-on-surface hover:text-primary transition-colors cursor-pointer',
            focusVisiblePrimaryRing,
          )}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>PREV SYSTEM</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className={cn(
            'group flex items-center gap-1.5 text-xs font-mono tracking-wider text-on-surface hover:text-primary transition-colors cursor-pointer',
            focusVisiblePrimaryRing,
          )}
        >
          <span>VIEW {CAPABILITIES[(activeIndex + 1) % CAPABILITIES.length].title}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
