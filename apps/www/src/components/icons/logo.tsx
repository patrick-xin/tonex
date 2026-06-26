import type { ComponentProps } from 'react'

import { cn } from 'tailwind-variants'

function TonexLogo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 116 138"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-current size-full fill-primary', className)}
      {...props}
    >
      <path d="M116 0L90 2L45 82L77 138L101 137L73 81Z M10 27L21 56L0 95L25 96L49 54L33 28Z" />
    </svg>
  )
}

function TonexLogoDuo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 116 138"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-full', className)}
      {...props}
    >
      <path
        fill="#b8b0a1"
        data-slot="tonex-logo-primary"
        d="M116 0L90 2L45 82L77 138L101 137L73 81Z"
      />
      <path fill="#A1A9B8" data-slot="tonex-logo-accent" d="M10 27L21 56L0 95L25 96L49 54L33 28Z" />
    </svg>
  )
}

export { TonexLogo, TonexLogoDuo }
