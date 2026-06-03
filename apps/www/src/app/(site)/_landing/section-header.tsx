import type React from 'react'
import { cn } from 'tailwind-variants'

export function SectionHeader({
  heading,
  description,
  headingClassName,
  className,
  align = 'center',
}: {
  heading: string
  description?: string
  headingClassName?: string
  className?: string
  align?: 'center' | 'start'
}) {
  const start = align === 'start'
  return (
    <div
      className={cn(
        'flex max-w-3xl flex-col gap-4',
        start ? 'items-start text-left' : 'mx-auto items-center text-center',
        className,
      )}
    >
      <h2 className={cn('text-balance text-4xl font-medium sm:text-5xl', headingClassName)}>
        {heading}
      </h2>
      <p className="max-w-xl text-balance text-base text-on-surface-variant sm:text-[1.2rem] mb-12">
        {description}
      </p>
    </div>
  )
}

export function SectionContent({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex max-w-5xl flex-col gap-12">{children}</div>
}
