import { Separator as BaseSeparator } from '@base-ui/react/separator'

import { cn } from 'tailwind-variants'

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: Omit<BaseSeparator.Props, 'className'> & { className?: string }) {
  return (
    <BaseSeparator
      className={cn(
        'bg-outline-variant shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  )
}

export { Separator }
