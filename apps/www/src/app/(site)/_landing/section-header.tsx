import type React from 'react'
import { cn } from 'tailwind-variants'

export function SectionHeader({
  heading,
  description,
  headingClassName,
}: {
  heading: string
  description?: string
  headingClassName?: string
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
      <h2 className={cn('text-balance text-4xl font-medium sm:text-5xl', headingClassName)}>
        {heading}
      </h2>
      <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-base mb-12">
        {description}
      </p>
    </div>
  )
}

export function SectionContent({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex max-w-5xl flex-col gap-12">{children}</div>
}
