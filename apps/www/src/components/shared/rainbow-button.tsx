'use client'

import type { ReactNode } from 'react'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'

// PROTOTYPE — "Announcing …" rainbow-border pill (Resend Forward style).
//
// The look is a 1px gradient ring that slowly rotates around a solid pill. The
// trick is a conic-ish linear-gradient whose angle is a custom property; we
// register --angle with @property so the browser can interpolate it (plain CSS
// vars don't animate), then drive it 0→360deg on a long linear loop.
//
// Two layers share that one gradient + animation so they stay phase-locked:
//   1. the ring — gradient as the anchor's background, with a 1px-inset solid
//      pill (bg-surface) sitting on top, leaving only the rim showing.
//   2. the glow — an aria-hidden copy behind (-z-10), blurred + dimmed, so the
//      rim bleeds a soft halo onto the page.
//
// Inner fill is bg-surface (not a hardcoded color) so the pill reads correctly
// in light/dark and survives the chameleon recolor. The gradient stops below
// are the iconic cyan→amber→violet; swap them for var(--color-chart-N) to make
// the rim track the picked palette.
//
// Pure CSS animation (no motion/react) — respects prefers-reduced-motion by
// freezing the angle in the style block, so reduced-motion users get a static
// gradient rim instead of a spinning one.

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
