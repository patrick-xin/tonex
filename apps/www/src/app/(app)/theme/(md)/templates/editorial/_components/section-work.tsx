'use client'

import { ArrowUpRight, BookOpen, Layers, Scale } from 'lucide-react'
import { AnimatePresence, m as motion } from 'motion/react'
import { useState } from 'react'
import { cn } from 'tailwind-variants'
import {
  createSheetHandle,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { PROJECTS } from '../data'
import type { Project } from '../types'

const workSheet = createSheetHandle<Project>()

export function SectionWork() {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'branding' | 'editorial' | 'digital' | 'type'
  >('all')
  const filteredProjects = PROJECTS.filter((proj) => {
    if (activeCategory === 'all') return true
    return proj.category === activeCategory
  })

  return (
    <section className="border-l border-r border-b border-outline-variant p-6 md:p-8 bg-surface-container-low">
      <div id="work-index-section" className="flex flex-col w-full text-on-surface">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-outline-variant pb-6 mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2">
              a <span className="italic font-medium font-serif">SELECTED INDEX</span> of WORK
              <span className="block text-sm font-mono font-normal tracking-wide text-on-surface-variant mt-1">
                designed between 2014 — 2026
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-1.5 bg-surface-container p-1 rounded-full border border-outline-variant">
            {(['all', 'branding', 'editorial', 'digital', 'type'] as const).map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-colors cursor-pointer uppercase',
                  activeCategory === cat
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-transparent text-on-surface-variant hover:text-on-surface',
                  focusVisiblePrimaryRing,
                )}
              >
                • {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col border-t border-outline-variant">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((proj) => (
              // motion.div is the *direct* AnimatePresence child so popLayout can
              // pop a leaving row out of flow (smooth filter reflow, no snap). The
              // full-width SheetTrigger inside is the real, keyboard-focusable
              // trigger spanning the whole row.
              <motion.div
                key={proj.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <SheetTrigger
                  nativeButton={false}
                  handle={workSheet}
                  payload={proj}
                  render={<div />}
                  className={cn(
                    'grid grid-cols-12 items-center w-full py-5 border-b border-outline-variant hover:bg-surface-container transition-colors cursor-pointer px-3 group text-left',
                    focusVisiblePrimaryRing,
                  )}
                >
                  <div className="col-span-2 md:col-span-1 font-mono text-xs text-on-surface-variant font-medium">
                    {proj.number}
                  </div>
                  <div className="col-span-8 md:col-span-4 font-sans text-sm md:text-base font-bold tracking-tight text-on-surface uppercase group-hover:text-primary transition-colors">
                    {proj.title}{' '}
                    <span className="font-display italic font-medium text-xs md:text-sm normal-case text-on-surface-variant ml-1">
                      {proj.serifAccent}
                    </span>
                  </div>
                  <div className="col-span-10 md:col-span-4 flex flex-wrap gap-1.5 mt-2 md:mt-0">
                    {proj.tags.map((tag, idx) => (
                      <span
                        key={String(idx)}
                        className="px-2 py-0.5 text-[9px] font-mono tracking-widest border border-outline-variant text-on-surface-variant rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Year */}
                  <div className="col-span-1 md:col-span-1 text-right font-mono text-xs text-on-surface-variant font-medium">
                    '{proj.year}
                  </div>

                  {/* Action indicator Dot */}
                  <div className="col-span-1 md:col-span-2 flex justify-end">
                    <div className="w-5 h-5 rounded-full border border-outline-variant group-hover:bg-primary-container group-hover:border-primary flex items-center justify-center transition-all">
                      <ArrowUpRight className="w-2.5 h-2.5 text-on-surface group-hover:text-on-primary-container transition-colors" />
                    </div>
                  </div>
                </SheetTrigger>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex justify-between items-center mt-6 text-xs font-mono text-on-surface-variant uppercase">
          <div className="flex gap-4">
            <span>01</span>
            <span>02</span>
            <span>03</span>
            <span>04</span>
          </div>
          <div>
            Showing {filteredProjects.length} of {PROJECTS.length} Monographs
          </div>
        </div>
        <Sheet handle={workSheet}>
          {({ payload: project }) => (
            <SheetContent
              className="max-w-lg justify-between gap-0 overflow-y-auto rounded-none"
              showCloseButton
            >
              {project && (
                <>
                  <div>
                    <div className="flex justify-between items-center border-b border-outline-variant pb-4 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary font-bold">
                          MONOGRAPH {project.number}
                        </span>
                        <span className="text-on-surface-variant text-xs">•</span>
                        <span className="font-mono text-xs uppercase text-on-surface-variant">
                          ARCHIVE ENTRY
                        </span>
                      </div>
                    </div>
                    <div className="aspect-4/3 rounded-sm overflow-hidden bg-surface-container-high border border-outline-variant mb-6">
                      <img
                        src={project.image}
                        alt={`${project.title} detail`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale contrast-110"
                      />
                    </div>
                    <SheetTitle className="font-sans text-3xl font-bold tracking-tight text-on-surface uppercase mb-3">
                      {project.title}{' '}
                      <span className="font-display italic font-medium normal-case block text-on-surface-variant text-lg mt-1">
                        & {project.serifAccent}
                      </span>
                    </SheetTitle>
                    <SheetDescription className="text-sm text-on-surface leading-relaxed mb-6 font-sans">
                      {project.description}
                    </SheetDescription>
                    <div className="border-t border-b border-outline-variant py-4 my-6 space-y-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <Layers className="w-3.5 h-3.5" />
                          <span>CLIENT</span>
                        </div>
                        <span className="font-mono font-medium text-on-surface uppercase text-right">
                          {project.client}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>FORMAT</span>
                        </div>
                        <span className="font-mono font-medium text-on-surface text-right">
                          {project.medium}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <Scale className="w-3.5 h-3.5" />
                          <span>DIMENSIONS</span>
                        </div>
                        <span className="font-mono font-medium text-on-surface text-right">
                          {project.dimension}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-outline-variant flex items-center justify-between text-xs font-mono text-on-surface-variant">
                    <span>EST: {project.year}/2026</span>
                    <SheetClose className="px-4 py-2 bg-on-surface text-surface hover:bg-primary hover:text-on-primary transition-colors cursor-pointer rounded-sm">
                      CLOSE JOURNAL
                    </SheetClose>
                  </div>
                </>
              )}
            </SheetContent>
          )}
        </Sheet>
      </div>
    </section>
  )
}
