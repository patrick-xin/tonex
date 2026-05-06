import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import type { VariantProps } from 'class-variance-authority'
import { ChevronRight } from 'lucide-react'

import { cn, tv } from 'tailwind-variants'

function Accordion({ ...props }: BaseAccordion.Root.Props) {
  return <BaseAccordion.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  variant = 'default',
  ...props
}: BaseAccordion.Item.Props & {
  variant?: 'default' | 'underline'
}) {
  return (
    <BaseAccordion.Item
      className={cn(
        'border-b last:border-b-0 data-disabled:opacity-38',
        variant === 'default' ? 'border-b-outline-variant' : 'border-b-outline-variant',
        className,
      )}
      data-slot="accordion-item"
      {...props}
    />
  )
}

function AccordionHeader({ className, ...props }: BaseAccordion.Header.Props) {
  return (
    <BaseAccordion.Header
      className={cn('flex', className)}
      data-slot="accordion-header"
      {...props}
    />
  )
}

const summaryVariants = tv({
  base: [
    'flex flex-1 w-full items-center justify-between text-sm font-medium transition-all text-left',
    '[&[data-panel-open]>svg]:rotate-90',
    '[&>svg]:transition-transform [&>svg]:duration-200 [&>svg]:shrink-0',
  ],
  variants: {
    variant: {
      default: [
        'bg-secondary-container text-on-secondary-container p-2',
        'hover:bg-[color-mix(in_srgb,var(--color-on-secondary-container)_8%,var(--color-secondary-container))]',
        '',
      ],
      underline: 'text-on-surface hover:underline py-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function AccordionSummary({
  className,
  children,
  variant = 'default',
  ...props
}: BaseAccordion.Trigger.Props & {
  variant?: 'default' | 'underline'
}) {
  return (
    <BaseAccordion.Header data-slot="accordion-summary">
      <BaseAccordion.Trigger
        className={cn(summaryVariants({ variant }), className)}
        data-slot="accordion-trigger"
        {...props}
      >
        {children}
        <ChevronRight className="h-4 w-4 text-on-surface-variant pointer-events-none" />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  )
}

function AccordionTrigger({ className, children, ...props }: BaseAccordion.Trigger.Props) {
  return (
    <BaseAccordion.Trigger
      className={cn(
        'flex flex-1 items-center justify-between font-medium',
        '[&>svg]:transition-transform [&>svg]:duration-200 [&>svg]:shrink-0',
        className,
      )}
      data-slot="accordion-trigger"
      {...props}
    >
      {children}
    </BaseAccordion.Trigger>
  )
}

const panelVariants = tv({
  base: 'overflow-hidden text-base',
  defaultVariants: {
    animation: 'css',
  },
  variants: {
    animation: {
      css: 'h-[var(--accordion-panel-height)] data-[starting-style]:h-0 data-[ending-style]:h-0 transition-[height] duration-200 ease-out',
      none: '',
    },
  },
})

function AccordionPanel({
  className,
  animation,
  children,
  ...props
}: BaseAccordion.Panel.Props & VariantProps<typeof panelVariants>) {
  return (
    <BaseAccordion.Panel
      className={cn(panelVariants({ animation }))}
      data-slot="accordion-panel"
      {...props}
    >
      <div className={cn('p-2 text-sm', className)}>{children}</div>
    </BaseAccordion.Panel>
  )
}

export {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  // Composite component
  AccordionSummary,
  AccordionTrigger,
}
