'use client'

import { Radio as BaseRadio } from '@base-ui/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import { cn } from 'tailwind-variants'
import { focusVisibleRing } from './styles'

function RadioGroup({ className, ...props }: BaseRadioGroup.Props) {
  return (
    <BaseRadioGroup className={cn('grid gap-2', className)} data-slot="radio-group" {...props} />
  )
}

function RadioRoot({ className, ...props }: BaseRadio.Root.Props) {
  return <BaseRadio.Root className={cn('rounded-full', className)} data-slot="radio" {...props} />
}

function RadioIndicator({ className, ...props }: BaseRadio.Indicator.Props) {
  return (
    <BaseRadio.Indicator
      className={cn('data-unchecked:hidden', className)}
      data-slot="radio-indicator"
      {...props}
    />
  )
}

function Radio({ className, ...props }: BaseRadio.Root.Props) {
  return (
    <BaseRadio.Root
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-full',
        'bg-transparent border border-outline data-checked:border-primary',
        'transition-[color,box-shadow]',
        focusVisibleRing,
        'aria-invalid:border-error aria-invalid:outline aria-invalid:outline-error',
        'data-disabled:cursor-not-allowed data-disabled:opacity-38',
        className,
      )}
      data-slot="radio"
      {...props}
    >
      <BaseRadio.Indicator
        className="flex items-center justify-center before:size-2 before:rounded-full before:bg-primary data-unchecked:hidden"
        data-slot="radio-group-indicator"
      />
    </BaseRadio.Root>
  )
}

export {
  // Composite component
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioRoot,
}
