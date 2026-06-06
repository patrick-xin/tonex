'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'

const GRADIENT =
  'linear-gradient(var(--rb-angle), var(--color-primary) 0%, var(--color-chart-4) 20%, var(--color-error) 70%, var(--color-tertiary) 100%)'

export function RainbowButton({ children = 'Enter app' }: { children?: ReactNode }) {
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
          'rb-rim group relative isolate inline-flex items-center justify-center rounded-md p-px text-sm leading-none',
          focusVisiblePrimaryRing,
        )}
      >
        {/* glow: same rotating gradient, blurred + dimmed, parked behind */}
        <span
          aria-hidden
          className="rb-rim pointer-events-none absolute inset-0 -z-10 rounded-md blur-md transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        />

        {/* content pill: solid fill sits 1px in, leaving the rim as a border */}
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-surface-container text-on-surface h-full font-semibold text-sm">
          <Link
            className={cn('px-3 sm:px-4 py-1.5 sm:py-2 rounded-md', focusVisiblePrimaryRing)}
            href="/theme"
          >
            {children}
          </Link>
        </span>
      </button>
    </>
  )
}
