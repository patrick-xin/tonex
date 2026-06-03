import type { ComponentProps } from 'react'

import { cn } from 'tailwind-variants'

/**
 * Recolor logo — single fill (bar + dot share `currentColor`).
 *
 * Drive the color with a text color (`text-foreground`, `text-primary`, …).
 * Smallest variant — use this everywhere you don't need to color the two
 * shapes independently.
 *
 * Note: the mark is non-square (206×257). `size-*` letterboxes it without
 * distortion; for an exact fit, size by one axis, e.g. `className="h-6 w-auto"`.
 */
function RecolorLogo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      data-slot="recolor-logo"
      viewBox="0 0 206 257"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-current size-12', className)}
      {...props}
    >
      <rect x="0" y="7" width="93" height="250" />
      <circle cx="160.5" cy="45.5" r="45.5" />
    </svg>
  )
}

/**
 * Recolor logo — separate elements for independent styling / two-tone.
 *
 * Both shapes default to `currentColor`, so this renders identically to
 * <RecolorLogo /> until you split the colors. Recolor a shape by targeting its
 * slot, e.g. on the parent:
 *
 *   <RecolorLogoDuo className="[&_[data-slot=recolor-logo-accent]]:fill-primary" />
 *
 * `recolor-logo-primary` is the bar; `recolor-logo-accent` is the dot.
 */
function RecolorLogoDuo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      data-slot="recolor-logo"
      viewBox="0 0 206 257"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-6', className)}
      {...props}
    >
      <rect
        data-slot="recolor-logo-primary"
        className="fill-current"
        x="0"
        y="7"
        width="93"
        height="250"
      />
      <circle
        data-slot="recolor-logo-accent"
        className="fill-current"
        cx="160.5"
        cy="45.5"
        r="45.5"
      />
    </svg>
  )
}

export { RecolorLogo, RecolorLogoDuo }
