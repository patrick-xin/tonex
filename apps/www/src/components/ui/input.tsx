import { Input as BaseInput } from '@base-ui/react/input'
import { cx, tv, type VariantProps } from 'tailwind-variants'
import { errorState, focusVisibleRing, focusWithinRing } from './styles'

const inputVariant = {
  default: cx('bg-transparent'),
  filled: cx('bg-surface-container-high'),
  inset: cx('bg-surface-container-highest dark:bg-surface-container-lowest'),
  ghost: cx('bg-transparent shadow-none rounded-none outline-none border-transparent'),
}

const baseStyles = cx([
  'rounded-md border border-outline shadow-xs transition-[color,box-shadow] duration-120',
  'w-full min-w-0 cursor-text text-base md:text-sm',
  'data-disabled:cursor-default data-disabled:opacity-38 data-disabled:select-none aria-disabled:cursor-default aria-disabled:opacity-38 aria-disabled:select-none',
])

const inputStyles = tv({
  base: [
    baseStyles,
    'appearance-none',
    'placeholder:text-on-surface/60 placeholder:text-sm',
    'data-disabled:placeholder:text-on-surface',
  ],
  variants: {
    variant: {
      default: cx(inputVariant.default, focusVisibleRing, errorState),
      filled: cx(inputVariant.filled, focusVisibleRing, errorState),
      inset: cx(inputVariant.inset, focusWithinRing, errorState),
      ghost: inputVariant.ghost,
    },
    inputSize: {
      default: 'h-9 py-1.5 px-2.5',
      lg: 'h-10 py-2 px-3',
      sm: 'h-8 py-1 px-2.5',
    },
    file: {
      true: 'file:text-on-surface file:inline-flex file:items-center file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium',
    },
  },
  defaultVariants: {
    variant: 'default',
    inputSize: 'default',
  },
})

const inputContainerStyles = tv({
  base: [baseStyles, 'flex items-center w-full'],
  variants: {
    variant: {
      default: cx(inputVariant.default, focusWithinRing),
      ghost: inputVariant.ghost,
    },
    inputSize: {
      default: 'min-h-9 px-2',
      lg: 'min-h-10 px-3',
      sm: 'min-h-8 px-2.5',
    },
  },
  defaultVariants: {
    variant: 'default',
    inputSize: 'default',
  },
})

type InputStylesProps = VariantProps<typeof inputStyles>
type InputContainerStylesProps = VariantProps<typeof inputContainerStyles>

function Input({
  variant,
  inputSize,
  className,
  ...props
}: Omit<BaseInput.Props, 'className'> & InputStylesProps & { className?: string }) {
  return <BaseInput className={inputStyles({ variant, inputSize, className })} {...props} />
}

export {
  Input,
  type InputContainerStylesProps,
  type InputStylesProps,
  inputContainerStyles,
  inputStyles,
  inputVariant,
}
