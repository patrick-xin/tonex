'use client'

import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'
import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import type { toggleVariants } from '@/components/ui/toggle'
import { focusVisibleRing } from './styles'

const ToggleGroupContext = React.createContext<{
  variant: 'default' | 'outline'
  size: 'default' | 'sm' | 'lg' | 'xs'
  spacing: number
  orientation: 'horizontal' | 'vertical'
}>({
  variant: 'default',
  size: 'default',
  spacing: 0,
  orientation: 'horizontal',
})

const styles = tv({
  slots: {
    root: 'group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md',
    item: [
      'shrink-0 inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap rounded-md transition-all border border-transparent',
      'disabled:pointer-events-none disabled:opacity-38',
      "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
      focusVisibleRing,
      'bg-transparent hover:bg-primary/8 data-pressed:text-on-secondary-container data-pressed:bg-secondary-container data-pressed:hover:bg-secondary-container',
    ],
  },
  variants: {
    size: {
      default: { item: 'h-9 px-2 min-w-9' },
      sm: {
        root: 'rounded-[min(var(--radius-md),10px)]',
        item: 'h-8 px-1.5 min-w-8',
      },
      lg: { item: 'h-10 px-2.5 min-w-10' },
      xs: { item: 'h-7 px-1 min-w-7 text-xs' },
    },
    variant: {
      default: {},
      outline: {
        item: 'border border-outline-variant shadow-xs data-pressed:border-primary/12',
      },
    },
    orientation: {
      horizontal: { root: 'flex-row' },
      vertical: { root: 'flex-col items-stretch' },
    },
    joined: {
      true: { item: 'rounded-none px-2' },
    },
  },
  compoundVariants: [
    {
      joined: true,
      orientation: 'horizontal',
      class: { item: 'first:rounded-l-lg last:rounded-r-lg' },
    },
    {
      joined: true,
      orientation: 'vertical',
      class: { item: 'first:rounded-t-lg last:rounded-b-lg' },
    },
    {
      joined: true,
      variant: 'outline',
      orientation: 'horizontal',
      class: { item: '[&:not(:first-child)]:border-l-0' },
    },
    {
      joined: true,
      variant: 'outline',
      orientation: 'vertical',
      class: { item: '[&:not(:first-child)]:border-t-0' },
    },
  ],
  defaultVariants: {
    size: 'default',
    variant: 'default',
    orientation: 'horizontal',
    joined: true,
  },
})

function ToggleGroup({
  className,
  variant = 'default',
  size = 'default',
  spacing = 0,
  orientation = 'horizontal',
  children,
  ...props
}: Omit<BaseToggleGroup.Props, 'className'> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: 'horizontal' | 'vertical'
    className?: string
  }) {
  const { root } = styles({
    variant,
    size,
    orientation,
    joined: spacing === 0,
  })
  return (
    <ToggleGroupContext.Provider
      value={{
        variant: variant ?? 'default',
        size: size ?? 'default',
        spacing,
        orientation,
      }}
    >
      <BaseToggleGroup
        data-slot="toggle-group"
        style={{ '--gap': spacing } as React.CSSProperties}
        className={root({ className })}
        {...props}
      >
        {children}
      </BaseToggleGroup>
    </ToggleGroupContext.Provider>
  )
}

function ToggleGroupItem({
  className,
  children,
  ...props
}: Omit<BaseToggle.Props, 'className'> & { className?: string }) {
  const { variant, size, spacing, orientation } = React.useContext(ToggleGroupContext)
  const { item } = styles({
    variant,
    size,
    orientation,
    joined: spacing === 0,
  })
  return (
    <BaseToggle data-slot="toggle-group-item" className={item({ className })} {...props}>
      {children}
    </BaseToggle>
  )
}

export { ToggleGroup, ToggleGroupItem }
