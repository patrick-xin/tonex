import type { ComponentProps } from 'react'

import { cn } from 'tailwind-variants'

/**
 * Tonex logo — single path (two subpaths, one fill).
 *
 * Color follows `currentColor`; drive it with a text color (`text-foreground`,
 * `text-primary`, …). Smallest/cheapest variant — use this everywhere you
 * don't need to color the two halves independently.
 *
 * Note: the mark is non-square (116×138). `size-*` letterboxes it without
 * distortion (default `preserveAspectRatio`); for an exact fit, size by one
 * axis, e.g. `className="h-6 w-auto"`.
 */
function TonexLogo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 116 138"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-current size-4.25', className)}
      {...props}
    >
      <path d="M116 0L90 2L45 82L77 138L101 137L73 81Z M10 27L21 56L0 95L25 96L49 54L33 28Z" />
    </svg>
  )
}

/**
 * Tonex logo — separate paths for independent styling / two-tone.
 *
 * Both halves default to `currentColor`, so this renders identically to
 * <TonexLogo /> until you split the colors. Recolor a half by targeting its
 * slot, e.g. on the parent:
 *
 *   <TonexLogoDuo className="[&_[data-slot=tonex-logo-accent]]:fill-red-500" />
 *
 * `tonex-logo-primary` is the large X stroke; `tonex-logo-accent` is the small
 * left chevron.
 */
function TonexLogoDuo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 116 138"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-6', className)}
      {...props}
    >
      <path
        data-slot="tonex-logo-primary"
        className="fill-primary-container"
        d="M116 0L90 2L45 82L77 138L101 137L73 81Z"
      />
      <path
        data-slot="tonex-logo-accent"
        className="fill-tertiary"
        d="M10 27L21 56L0 95L25 96L49 54L33 28Z"
      />
    </svg>
  )
}

export { TonexLogo, TonexLogoDuo }
