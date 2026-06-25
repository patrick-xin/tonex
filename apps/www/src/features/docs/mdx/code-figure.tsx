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
        'not-prose not-first:mt-4 max-h-120 overflow-y-auto no-scrollbar rounded-xl relative min-w-0 w-full',
        className,
      )}
      {...props}
    >
      <div className="mdx-code-copy-overlay sticky z-10 flex justify-end pointer-events-none">
        <CopyButton getText={getText} className="pointer-events-auto" />
      </div>
      {children}
    </figure>
  )
}
