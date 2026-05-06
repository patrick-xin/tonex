'use client'

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { CheckIcon, MinusIcon } from '@phosphor-icons/react'

import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from './styles'

function CheckboxRoot({ className, ...props }: BaseCheckbox.Root.Props) {
  return <BaseCheckbox.Root className={cn(className)} data-slot="checkbox" {...props} />
}

function CheckboxIndicator({ className, ...props }: BaseCheckbox.Indicator.Props) {
  return (
    <BaseCheckbox.Indicator className={cn(className)} data-slot="checkbox-indicator" {...props} />
  )
}

function Checkbox({ className, ...props }: BaseCheckbox.Root.Props) {
  return (
    <BaseCheckbox.Root
      className={cn(
        'peer inline-flex size-4 shrink-0 rounded-sm border border-outline hover:border-primary transition-[shadow,border-color] outline-0',
        'data-checked:bg-primary-container data-checked:text-on-primary-container data-checked:border-primary-container',
        'data-indeterminate:bg-primary-container data-indeterminate:text-on-primary-container data-indeterminate:border-primary',
        focusVisiblePrimaryRing,
        className,
      )}
      data-slot="checkbox"
      {...props}
    >
      <BaseCheckbox.Indicator
        className="flex items-center justify-center text-current data-unchecked:hidden"
        data-slot="checkbox-indicator"
        render={(props, state) => (
          <span {...props}>
            {state.indeterminate ? (
              <MinusIcon className="size-3.5" weight="bold" />
            ) : (
              <CheckIcon className="size-3.5" weight="bold" />
            )}
          </span>
        )}
      />
    </BaseCheckbox.Root>
  )
}

export {
  // Composite component
  Checkbox,
  CheckboxIndicator,
  CheckboxRoot,
}
