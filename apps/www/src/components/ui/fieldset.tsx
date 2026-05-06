'use client'

import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset'
import type * as React from 'react'
import { cn } from 'tailwind-variants'

function Fieldset({ className, ...props }: BaseFieldset.Root.Props) {
  return (
    <BaseFieldset.Root
      className={cn(
        'flex flex-col gap-3',
        '[&_[data-slot=fieldset-legend]+[data-slot=fieldset-description]]:-mt-3.5',
        className,
      )}
      data-slot="fieldset"
      {...props}
    />
  )
}

function FieldsetLegend({
  className,
  ...props
}: Omit<BaseFieldset.Legend.Props, 'className'> & {
  className?: string
}) {
  return (
    <BaseFieldset.Legend
      className={cn('font-medium text-base', className)}
      data-slot="fieldset-legend"
      {...props}
    />
  )
}

function FieldsetDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm text-on-surface-variant', className)}
      data-slot="fieldset-description"
      {...props}
    />
  )
}

export { Fieldset, FieldsetDescription, FieldsetLegend }
