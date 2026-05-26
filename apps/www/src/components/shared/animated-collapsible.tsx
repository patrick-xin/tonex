'use client'

import { CaretRightIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { cn } from 'tailwind-variants'
import { Button, type ButtonStylesProps } from '@/components/ui/button'
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/components/ui/collapsible'

export function AnimatedCollapsible({
  children,
  title,
  className,
  variant = 'secondary',
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  contentClassName,
  triggerRef,
  overridden = false,
}: {
  children: React.ReactNode
  title: string
  className?: string
  variant?: ButtonStylesProps['variant']
  defaultOpen?: boolean
  // why: optional controlled mode. Omit both and the disclosure manages its own
  // open state (the common case). Pass them to drive it from outside — e.g. the
  // seed block force-folds itself when the seed locks.
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contentClassName?: string
  triggerRef?: React.Ref<HTMLButtonElement>
  overridden?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Collapsible className="w-full" onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger
        ref={triggerRef}
        render={
          <Button
            variant={variant}
            className={cn(
              'w-full justify-between px-2! group leading-snug font-semibold',
              className,
            )}
          >
            <span className="flex items-center gap-2">
              {overridden && (
                <span className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
              )}
              {title}
            </span>
            <CaretRightIcon
              weight="bold"
              className={cn(
                'size-3 transition-[transform,color] duration-200 text-on-surface-variant group-hover:text-on-surface',
                open && 'rotate-90',
              )}
            />
          </Button>
        }
      />
      <CollapsiblePanel>
        <div className={cn('p-2', contentClassName)}>{children}</div>
      </CollapsiblePanel>
    </Collapsible>
  )
}
