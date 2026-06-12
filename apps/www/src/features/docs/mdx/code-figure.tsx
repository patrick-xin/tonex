'use client'

import { type ComponentProps, useRef } from 'react'
import { cn } from 'tailwind-variants'
import { CopyButton } from './copy-button'

export function CodeFigure({ className, children, ...props }: ComponentProps<'figure'>) {
  const figureRef = useRef<HTMLElement>(null)

  const getText = () => {
    const code = figureRef.current?.querySelector('code')
    return code?.textContent ?? ''
  }

  return (
    <figure
      ref={figureRef}
      className={cn(
        'not-prose not-first:mt-4 max-h-120 overflow-y-auto no-scrollbar rounded-md relative min-w-0 w-full',
        className,
      )}
      {...props}
    >
      {children}
      <CopyButton getText={getText} className="absolute top-2 right-2" />
    </figure>
  )
}
