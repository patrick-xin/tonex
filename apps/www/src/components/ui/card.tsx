import type * as React from 'react'
import { cn, tv, type VariantProps } from 'tailwind-variants'

const cardStyles = tv({
  base: 'flex flex-col gap-6 rounded-md py-4 text-on-surface has-data-[slot=card-footer]:pb-0',
  variants: {
    variant: {
      lowest: 'bg-surface-container-lowest',
      low: 'bg-surface-container-low',
      default: 'bg-surface-container',
      high: 'bg-surface-container-high',
      highest: 'bg-surface-container-highest',
      dimmed: 'bg-surface-dim',
      bright: 'bg-surface-bright',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type CardStylesProps = VariantProps<typeof cardStyles>

function Card({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & CardStylesProps) {
  return <div className={cardStyles({ variant, className })} data-slot="card" {...props} />
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      data-slot="card-header"
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('leading-none font-semibold text-on-surface', className)}
      data-slot="card-title"
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-sm text-on-surface-variant', className)}
      data-slot="card-description"
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      data-slot="card-action"
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-4 flex-1', className)} data-slot="card-content" {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center px-6 [.border-t]:pt-6 border-t border-outline-variant bg-surface-container-low p-4 group-data-[size=sm]/card:p-3',
        className,
      )}
      data-slot="card-footer"
      {...props}
    />
  )
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  type CardStylesProps,
  CardTitle,
  cardStyles,
}
