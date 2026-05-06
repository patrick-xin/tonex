'use client'

import { Field as BaseField } from '@base-ui/react/field'
import { cn, type VariantProps } from 'tailwind-variants'
import { inputStyles } from '@/components/ui/input'

function Field({ className, ...props }: BaseField.Root.Props) {
  return (
    <BaseField.Root
      className={cn(
        'group relative flex flex-col gap-2',
        'has-data-[slot=checkbox]:flex-row has-data-[slot=checkbox]:items-center has-data-[slot=checkbox]:flex-wrap',
        'has-data-[slot=radio]:flex-row has-data-[slot=radio]:items-center has-data-[slot=radio]:flex-wrap',
        'has-data-[slot=switch]:flex-row has-data-[slot=switch]:items-center has-data-[slot=switch]:flex-wrap',
        className,
      )}
      data-slot="field"
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: Omit<BaseField.Label.Props, 'className'> & { className?: string }) {
  return (
    <BaseField.Label
      className={cn(
        'inline-flex items-start gap-2 text-sm leading-snug font-medium select-none transition-colors text-on-surface',
        'data-disabled:opacity-38',
        "group-has-required:after:content-['*'] group-has-required:after:text-on-surface-variant group-has-required:after:-ml-0.5",
        "aria-required:after:content-['*'] aria-required:after:text-on-surface-variant aria-required:after:-ml-0.5 data-invalid:after:content-['*'] data-invalid:after:text-error data-invalid:after:-ml-0.5",
        'has-data-[slot=checkbox]:-mt-px has-data-[slot=switch]:-mt-0.5',
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  )
}

function FieldControl({
  className,
  inputSize = 'default',
  variant = 'default',
  ...props
}: BaseField.Control.Props & {
  inputSize?: VariantProps<typeof inputStyles>['inputSize']
  variant?: VariantProps<typeof inputStyles>['variant']
}) {
  return (
    <BaseField.Control
      className={cn(inputStyles({ inputSize, variant }), className)}
      data-slot="field-control"
      {...props}
    />
  )
}

function FieldDescription({
  className,
  ...props
}: Omit<BaseField.Description.Props, 'className'> & {
  className?: string
}) {
  return (
    <BaseField.Description
      className={cn('text-xs text-on-surface-variant', className)}
      data-slot="field-description"
      {...props}
    />
  )
}

function FieldItem({ className, ...props }: BaseField.Item.Props) {
  return (
    <BaseField.Item
      className={cn('flex items-center gap-2', className)}
      data-slot="field-item"
      {...props}
    />
  )
}

function FieldError({
  className,
  ...props
}: Omit<BaseField.Error.Props, 'className'> & { className?: string }) {
  return (
    <BaseField.Error
      className={cn('text-xs text-error text-pretty', className)}
      data-slot="field-error"
      {...props}
    />
  )
}

const FieldValidity = BaseField.Validity

export { Field, FieldControl, FieldDescription, FieldError, FieldItem, FieldLabel, FieldValidity }
