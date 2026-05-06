import type * as React from 'react'

import { cn, type VariantProps } from 'tailwind-variants'
import { inputStyles } from './input'

interface TextareaProps extends React.ComponentProps<'textarea'> {
  variant?: VariantProps<typeof inputStyles>['variant']
}

function Textarea({ className, variant = 'default', ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'field-sizing-content min-h-16',
        inputStyles({
          variant,
        }),
        className,
      )}
      data-slot="textarea"
      {...props}
    />
  )
}

export { Textarea }
