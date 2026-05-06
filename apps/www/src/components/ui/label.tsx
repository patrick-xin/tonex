import type * as React from 'react'

import { cn } from 'tailwind-variants'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: primitive — consumer composes the input/htmlFor association
    <label
      className={cn(
        'flex items-center text-on-surface gap-2 text-sm leading-none font-medium group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-38 peer-disabled:cursor-not-allowed peer-disabled:opacity-38',
        className,
      )}
      data-slot="label"
      {...props}
    />
  )
}

export { Label }
