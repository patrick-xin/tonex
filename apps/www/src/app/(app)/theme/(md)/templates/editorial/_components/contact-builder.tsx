'use client'

import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'

export function ContactBuilder() {
  return (
    <div
      id="contact-builder-card"
      className="flex flex-col h-full justify-between p-6 md:p-8 bg-surface-container text-on-surface rounded-sm"
    >
      <div className="border-b border-outline-variant pb-3 mb-6">
        <h3 className="font-display italic text-lg text-primary font-medium tracking-tight">
          hello, TONEX STUDIO
        </h3>
        <p className="text-xs font-mono tracking-wider text-on-surface-variant uppercase mt-1">
          Brief Constructor
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col justify-center items-center text-center py-12 px-2"
        >
          <div className="w-12 h-12 bg-primary-container text-on-primary-container flex items-center justify-center rounded-full mb-6">
            <Check className="w-6 h-6" />
          </div>
          <h4 className="font-display italic text-2xl text-on-surface font-semibold mb-3">
            Thank you!
          </h4>
          <p className="text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
            Brief received. We read every note before the week closes and reply with a single,
            honest question.
          </p>
          <Button type="submit" className="font-mono text-xs tracking-wider shrink-0 uppercase">
            SEND ANOTHER BRIEF
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
