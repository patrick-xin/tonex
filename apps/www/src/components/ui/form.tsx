'use client'

import { Form as BaseForm } from '@base-ui/react/form'
import { cn } from 'tailwind-variants'

function Form({ className, ...props }: BaseForm.Props) {
  return <BaseForm className={cn('flex flex-col gap-6', className)} data-slot="form" {...props} />
}

type FormProps = BaseForm.Props
type FormErrors = NonNullable<FormProps['errors']>
type FormValues = Record<string, unknown>

export type { FormErrors, FormProps, FormValues }
export { Form }
