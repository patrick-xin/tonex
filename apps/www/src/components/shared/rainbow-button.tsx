'use client'

import type { ReactNode } from 'react'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'

// PROTOTYPE — rainbow-border pill: a rotating gradient ring around a solid pill.
// why: the rim angle is an @property-registered custom prop so the browser can
// interpolate it — plain CSS vars don't animate. Reduced-motion freezes it.

const GRADIENT = 'linear-gradient(var(--rb-angle), #02fcef 0%, #ffb52b 50%, #a02bfe 100%)'

export function RainbowButton({ children = 'Announcing Tonex' }: { children?: ReactNode }) {
  return (
    <>
      <style>{`
        @property --rb-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes rb-rotate {
          to { --rb-angle: 360deg; }
        }
        .rb-rim {
          background: ${GRADIENT};
          animation: rb-rotate 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .rb-rim { animation: none; }
        }
      `}</style>

      <button
        type="button"
        className={cn(
          'rb-rim group relative isolate inline-flex items-center justify-center rounded-full p-px text-sm leading-none',
          focusVisiblePrimaryRing,
        )}
      >
        {/* glow: same rotating gradient, blurred + dimmed, parked behind */}
        <span
          aria-hidden
          className="rb-rim pointer-events-none absolute inset-0 -z-10 rounded-full blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        />

        {/* content pill: solid fill sits 1px in, leaving the rim as a border */}
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-surface-container px-4 py-1.5 text-on-surface h-full">
          {children}
        </span>
      </button>
    </>
  )
}
