'use client'

import { Camera, Check, Layers, LayoutGrid, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'

export function Capabilities() {
  const [selectedTab, setSelectedTab] = useState<string>('BRAND')
  return (
    <section id="capabilities-section" className="border-t border-outline-variant pt-14 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs p-1 text-on-tertiary-container bg-tertiary-container rounded-md mb-4 inline-block">
            WHAT WE DELIVER
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-on-surface">
            What we actually deliver.
          </h2>
        </div>
        <div className="inline-flex flex-wrap bg-surface-container p-1 rounded-lg border border-outline-variant">
          {['BRAND', 'PRODUCT', 'EDITORIAL', 'MOTION'].map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                'px-4 py-2 font-mono text-xs font-black rounded-md transition-all cursor-pointer outline-transparent',
                selectedTab === tab
                  ? 'bg-tertiary text-on-tertiary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface',
                focusVisiblePrimaryRing,
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {capabilitiesData.map((cap) => {
          const isActive = selectedTab === cap.id
          return (
            <button
              type="button"
              key={cap.id}
              onClick={() => setSelectedTab(cap.id)}
              className={cn(
                'border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer outline-transparent',
                isActive
                  ? 'bg-surface-container border-tertiary-container shadow-sm'
                  : 'bg-surface-container-low border-outline-variant hover:border-outline-variant',
                focusVisiblePrimaryRing,
              )}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-tertiary text-on-tertiary'
                        : 'bg-surface-container-high text-on-surface-variant',
                    )}
                  >
                    {cap.icon}
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-on-surface text-left">
                  {cap.title}
                </h3>
                <ul className="space-y-2 font-sans text-xs">
                  {cap.checklist.map((item, idx) => (
                    <li key={String(idx)} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-tertiary" />
                      <span className="text-on-surface-variant font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/60 pt-4 text-left">
                  {cap.desc}
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-outline-variant/60 flex items-center justify-between text-on-surface-variant">
                <span className="font-mono text-xs tracking-widest font-black uppercase">
                  SYSTEM PIECE
                </span>
                <span className="font-mono text-xs">{cap.id}</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

const capabilitiesData = [
  {
    id: 'BRAND',
    icon: <Layers className="w-5 h-5" />,
    title: 'Identity systems',
    checklist: [
      'Wordmark, lockup, usage rules',
      'Token-based color architecture',
      'Print and digital specimen set',
    ],
    desc: 'A documented identity that engineers can implement without interpretation and designers can extend without breaking. Every decision is written down.',
  },
  {
    id: 'PRODUCT',
    icon: <LayoutGrid className="w-5 h-5" />,
    title: 'Interface design',
    checklist: [
      'Dense data layouts, clear hierarchy',
      'Configurator and dashboard UX',
      'Accessibility-first component specs',
    ],
    desc: 'We design for operators, not tourists. Complex workflows, large tables, state-heavy interfaces — made readable without being simplified.',
  },
  {
    id: 'EDITORIAL',
    icon: <Camera className="w-5 h-5" />,
    title: 'Component libraries',
    checklist: [
      'Typed, versioned, documented',
      'Storybook integration and testing',
      'Design token sync with Figma',
    ],
    desc: 'A typed component library your engineers ship with confidence. Consumed from a package, not copy-pasted — with a changelog your team actually reads.',
  },
  {
    id: 'MOTION',
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Product sites',
    checklist: [
      'Structured content architecture',
      'Performance-first builds',
      'Integrated with your CMS or MDX',
    ],
    desc: 'Product marketing that shares the same design system as the product. One type scale, one token set — the site looks like software, not a brochure about software.',
  },
]
