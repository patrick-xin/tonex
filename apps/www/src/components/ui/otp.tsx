import { OTPFieldPreview as BaseOTPField } from '@base-ui/react/otp-field'
import { MinusIcon } from '@phosphor-icons/react/dist/ssr'
import { cn, type VariantProps } from 'tailwind-variants'
import { inputStyles } from './input'

const OTPFieldRoot = ({
  className,
  length,
  ...props
}: BaseOTPField.Root.Props & { length: number }) => {
  return <BaseOTPField.Root {...props} length={length} className={cn(className)} />
}

const OTPFieldInput = ({
  className,
  variant = 'default',

  ...props
}: BaseOTPField.Input.Props & {
  variant?: VariantProps<typeof inputStyles>['variant']
}) => {
  return (
    <BaseOTPField.Input
      {...props}
      className={cn(inputStyles({ variant }), 'text-center', className)}
    />
  )
}

const OTPFieldSeparator = ({ className, ...props }: BaseOTPField.Separator.Props) => {
  return (
    <BaseOTPField.Separator
      {...props}
      className={cn('flex w-4 items-center justify-center text-on-surface-variant', className)}
    >
      <MinusIcon />
    </BaseOTPField.Separator>
  )
}

export { OTPFieldInput, OTPFieldRoot, OTPFieldSeparator }
