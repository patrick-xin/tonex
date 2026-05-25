import { mergeProps, useRender } from '@base-ui/react'
import { cn, tv, type VariantProps } from 'tailwind-variants'

const chipStyles = tv({
  base: [
    'flex items-center justify-between w-fit rounded-md cursor-default whitespace-nowrap transition-colors group outline outline-transparent',
    '[&_svg]:size-4',
    'focus-visible:outline-1 focus-visible:outline-primary focus-visible:outline-offset-2',
    'aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:text-disabled-content',
  ],
  variants: {
    variant: {
      outline: [
        'bg-transparent text-on-surface',
        'outline outline-outline-variant',
        'hover:bg-primary/8',
        'focus-visible:bg-primary/10 [@media(hover:hover)]:data-highlighted:bg-primary/10',
      ],
      filled: [
        'bg-secondary-container text-on-secondary-container',
        'hover:bg-[color-mix(in_srgb,var(--color-on-secondary-container)_8%,var(--color-secondary-container))]',
        'focus-visible:bg-[color-mix(in_srgb,var(--color-on-secondary-container)_10%,var(--color-secondary-container))]',
        '[@media(hover:hover)]:data-highlighted:bg-[color-mix(in_srgb,var(--color-on-secondary-container)_10%,var(--color-secondary-container))]',
      ],
      dimmed: [
        'bg-surface-container-highest dark:bg-surface-container-low text-on-surface',
        'hover:bg-surface-container-highest dark:hover:bg-surface-container-low',
        'focus-visible:bg-surface-container-highest dark:focus-visible:bg-surface-container-low',
        '[@media(hover:hover)]:data-highlighted:bg-surface-container-highest dark:[@media(hover:hover)]:data-highlighted:bg-surface-container-low',
      ],
      vibrant: [
        'bg-tertiary-container text-on-tertiary-container',
        'hover:bg-[color-mix(in_srgb,var(--color-tertiary-container)_8%,var(--color-tertiary-container))]',
        'focus-visible:bg-[color-mix(in_srgb,var(--color-tertiary-container)_10%,var(--color-tertiary-container))]',
        '[@media(hover:hover)]:data-highlighted:bg-[color-mix(in_srgb,var(--color-tertiary-container)_10%,var(--color-tertiary-container))]',
      ],
    },
    size: {
      xs: ['gap-0.5 px-1 py-px text-xs rounded-sm'],
      sm: ['gap-0.5 px-1.5 py-0.5 text-xs'],
      default: ['gap-1 px-2 py-1 text-sm'],
      lg: ['gap-1 px-2.5 py-1 text-[15px]'],
    },
  },
  defaultVariants: {
    variant: 'filled',
    size: 'default',
  },
})

interface ChipProps extends useRender.ComponentProps<'button'>, VariantProps<typeof chipStyles> {}

const Chip = ({ className, variant = 'filled', size, render, ...props }: ChipProps) => {
  const element = useRender({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(
      {
        className: cn(chipStyles({ variant, size }), className),
      },
      props,
    ),
    state: {
      chip: 'chip',
    },
  })
  return element
}

export { Chip, chipStyles }
