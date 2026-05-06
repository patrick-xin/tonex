import { Button as BaseButton } from '@base-ui/react/button'
import { tv, type VariantProps } from 'tailwind-variants'
import {
  disabledState,
  errorState,
  focusVisibleDangerRing,
  focusVisiblePrimaryRing,
  focusVisibleRing,
  focusVisibleSecondaryRing,
  focusVisibleTertiaryRing,
} from './styles'

const buttonStyles = tv({
  base: [
    'inline-flex items-center justify-center gap-2 text-sm font-medium rounded-md whitespace-nowrap transition-[border-color,color,background-color,box-shadow,opacity,outline-color] shadow-xl border border-transparent outline-transparent',
    'select-none shrink-0 shadow-xs',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    disabledState,
    errorState,
  ],
  variants: {
    size: {
      default: 'h-9 px-4 py-2 has-[>svg]:px-3',
      icon: "size-9 [&_svg:not([class*='size-'])]:size-4.5",
      'icon-lg': "size-10 [&_svg:not([class*='size-'])]:size-5",
      'icon-sm': 'size-8',
      'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3.5",
      lg: 'h-10 px-6 has-[>svg]:px-4 text-base',
      sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
    },
    variant: {
      brand: [
        'bg-primary-container text-on-primary-container',
        'hover:bg-[color-mix(in_oklab,var(--color-on-primary-container)_8%,var(--color-primary-container))]',
        'active:bg-[color-mix(in_oklab,var(--color-on-primary-container)_12%,var(--color-primary-container))]',
        focusVisiblePrimaryRing,
      ],
      primary: [
        'bg-primary text-on-primary',
        'hover:bg-[color-mix(in_oklab,var(--color-on-primary)_8%,var(--color-primary))]',
        'active:bg-[color-mix(in_oklab,var(--color-on-primary)_12%,var(--color-primary))]',
        focusVisiblePrimaryRing,
      ],
      secondary: [
        'bg-secondary-container text-on-secondary-container',
        'hover:bg-[color-mix(in_srgb,var(--color-on-secondary-container)_8%,var(--color-secondary-container))]',
        focusVisibleSecondaryRing,
        'active:bg-[color-mix(in_srgb,var(--color-on-secondary-container)_12%,var(--color-secondary-container))]',
        'data-popup-open:bg-[color-mix(in_srgb,var(--color-on-secondary-container)_12%,var(--color-secondary-container))]',
      ],
      tertiary: [
        'bg-tertiary text-on-tertiary',
        'hover:bg-[color-mix(in_srgb,var(--color-on-tertiary)_8%,var(--color-tertiary))]',
        focusVisibleTertiaryRing,
        'active:bg-[color-mix(in_srgb,var(--color-on-tertiary)_12%,var(--color-tertiary))]',
      ],
      inverse: [
        'bg-inverse-surface text-inverse-on-surface',
        'hover:bg-[color-mix(in_srgb,var(--color-inverse-on-surface)_8%,var(--color-inverse-surface))]',
        'active:bg-[color-mix(in_srgb,var(--color-inverse-on-surface)_12%,var(--color-inverse-surface))]',
        focusVisiblePrimaryRing,
      ],
      danger: [
        'bg-error text-on-error',
        'hover:bg-[color-mix(in_srgb,var(--color-on-error)_8%,var(--color-error))]',
        focusVisibleDangerRing,
        'active:bg-[color-mix(in_srgb,var(--color-on-error)_12%,var(--color-error))]',
      ],
      ghost: ['shadow-none', 'hover:bg-primary/8', 'active:bg-primary/12', focusVisibleRing],
      link: [
        'text-primary shadow-none decoration-primary underline-offset-4 hover:underline aria-invalid:text-error',
        focusVisibleRing,
      ],
      outline: [
        'border-outline-variant shadow-none bg-transparent text-on-surface bg-clip-padding',
        'hover:bg-primary/8',
        'active:bg-primary/12',
        focusVisibleRing,
      ],
      fab: [
        'bg-primary-container text-on-primary-container elevation-3 transition-shadow',
        'hover:elevation-4 hover:bg-[color-mix(in_srgb,var(--color-on-primary-container)_8%,var(--color-primary-container))]',
        'focus-visible:outline-offset-2 focus-visible:outline-primary-container/50 focus-visible:ring-4 focus-visible:ring-primary-container/12',
        'active:bg-[color-mix(in_srgb,var(--color-on-primary-container)_12%,var(--color-primary-container))]',
      ],
      unstyled: 'bg-transparent hover:bg-transparent',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'brand',
    shape: 'default',
  },
})

type ButtonStylesProps = VariantProps<typeof buttonStyles>

const Button = ({
  className,
  variant = 'brand',
  size,
  isLoading,
  disabled,
  focusableWhenDisabled,
  ...props
}: Omit<BaseButton.Props, 'className'> &
  ButtonStylesProps & {
    isLoading?: boolean
    className?: string
  }) => {
  return (
    <BaseButton
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || isLoading}
      focusableWhenDisabled={focusableWhenDisabled || isLoading}
      {...props}
    />
  )
}

export { Button, type ButtonStylesProps, buttonStyles }
