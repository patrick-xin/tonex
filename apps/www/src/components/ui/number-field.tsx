'use client'

import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import { MinusIcon, PlusIcon } from '@phosphor-icons/react'
import type * as React from 'react'

import { cn } from 'tailwind-variants'
import { errorState } from './styles'

const NumberFieldRoot = ({ className, ...props }: BaseNumberField.Root.Props) => (
  <BaseNumberField.Root
    className={cn('grid gap-1.5', className)}
    data-slot="number-field"
    {...props}
  />
)

const NumberFieldGroup = ({ className, ...props }: BaseNumberField.Group.Props) => (
  <BaseNumberField.Group
    className={cn('w-full overflow-hidden data-disabled:opacity-50', className)}
    data-slot="number-field-group"
    {...props}
  />
)

const NumberFieldInput = ({ className, ...props }: BaseNumberField.Input.Props) => (
  <BaseNumberField.Input
    className={cn('tabular-nums outline-none', className)}
    data-slot="number-field-input"
    {...props}
  />
)

const NumberFieldDecrement = ({
  className,
  children,
  ...props
}: BaseNumberField.Decrement.Props) => (
  <BaseNumberField.Decrement
    className={cn('flex items-center justify-center select-none', 'disabled:opacity-50', className)}
    data-slot="number-field-decrement"
    {...props}
  >
    {children}
  </BaseNumberField.Decrement>
)

const NumberFieldIncrement = ({
  className,
  children,
  ...props
}: BaseNumberField.Increment.Props) => (
  <BaseNumberField.Increment
    className={cn('flex items-center justify-center select-none', 'disabled:opacity-50', className)}
    data-slot="number-field-increment"
    {...props}
  >
    {children}
  </BaseNumberField.Increment>
)

const NumberFieldScrubAreaRoot = ({ className, ...props }: BaseNumberField.ScrubArea.Props) => (
  <BaseNumberField.ScrubArea
    className={cn('cursor-ew-resize', className)}
    data-slot="number-field-scrub-area"
    {...props}
  />
)

const NumberFieldScrubAreaCursor = (props: BaseNumberField.ScrubAreaCursor.Props) => (
  <BaseNumberField.ScrubAreaCursor data-slot="number-field-scrub-area" {...props} />
)

function CursorGrowIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      fill="black"
      height="14"
      stroke="white"
      viewBox="0 0 24 14"
      width="26"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>cursor icon</title>
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  )
}

const NumberFieldScrubArea = ({
  className,
  children,
  ...props
}: BaseNumberField.ScrubArea.Props) => (
  <BaseNumberField.ScrubArea
    className={cn(
      'flex cursor-ew-resize items-center gap-1.5 select-none text-sm font-medium text-foreground data-disabled:opacity-50',
      className,
    )}
    data-slot="number-field-scrub-area"
    {...props}
  >
    <BaseNumberField.ScrubAreaCursor data-slot="number-field-scrub-area-cursor">
      <CursorGrowIcon />
    </BaseNumberField.ScrubAreaCursor>
    {children}
  </BaseNumberField.ScrubArea>
)

type NumberFieldProps = BaseNumberField.Root.Props & {
  inputRef?: React.Ref<HTMLInputElement>
}

function NumberField({ className, children, inputRef, ...props }: NumberFieldProps) {
  return (
    <BaseNumberField.Root
      className="flex flex-col gap-2 data-disabled:opacity-50  data-disabled:pointer-events-none"
      data-slot="number-field"
      {...props}
    >
      {children}
      <BaseNumberField.Group
        className={cn(
          'flex h-9 w-full overflow-hidden rounded-md border border-outline bg-transparent shadow-xs',
          errorState,
        )}
        data-slot="number-field-group"
      >
        <BaseNumberField.Decrement
          className={cn(
            'group flex items-center justify-center shrink-0 h-full aspect-square select-none',
            'border-r border-outline bg-surface-container text-on-surface',
            'transition-colors hover:bg-surface-container-high active:bg-surface-container-high',
            'group-disabled:text-disabled-container',
          )}
          data-slot="number-field-decrement"
        >
          <MinusIcon className="size-4 group-disabled:text-disabled-content" />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input
          className={cn(
            'flex-1 min-w-0 px-2 text-center text-sm tabular-nums rounded-xs',
            'placeholder:text-on-surface-variant/50',
            'focus:z-1 focus:outline focus:-outline-offset-1 focus:outline-primary/50',
            'focus:ring-3 focus:ring-primary/12',
            'data-invalid:outline-error data-invalid:ring-1 data-invalid:ring-error/50 data-invalid:ring-offset-1 data-invalid:ring-offset-error/5',
          )}
          data-slot="number-field-input"
          ref={inputRef}
        />
        <BaseNumberField.Increment
          className={cn(
            'group flex items-center justify-center shrink-0 h-full aspect-square select-none',
            'border-l border-outline bg-surface-container text-on-surface',
            'transition-colors hover:bg-surface-container-high',
            'data-disabled:opacity-38',
          )}
          data-slot="number-field-increment"
        >
          <PlusIcon className="size-4 group-disabled:text-disabled-content" />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  )
}

export {
  // Composite component
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
  NumberFieldScrubAreaRoot,
}
