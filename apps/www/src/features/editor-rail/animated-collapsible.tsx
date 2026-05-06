'use client'

import { CaretRightIcon } from '@phosphor-icons/react'
import { m } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from 'tailwind-variants'
import { Button, type ButtonStylesProps } from '@/components/ui/button'
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@/components/ui/collapsible'

export function AnimatedCollapsible({
  children,
  title,
  height,
  className,
  variant = 'secondary',
  defaultOpen = false,
  contentClassName,
  triggerRef,
}: {
  children: React.ReactNode
  title: string
  height: number
  className?: string
  variant?: ButtonStylesProps['variant']
  defaultOpen?: boolean
  contentClassName?: string
  triggerRef?: React.Ref<HTMLButtonElement>
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return null
  return (
    <Collapsible className="w-full" onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger
        ref={triggerRef}
        render={
          <Button
            variant={variant}
            className={cn('w-full justify-between px-2! group leading-snug', className)}
          >
            {title}
            <CaretRightIcon
              weight="bold"
              className={cn(
                'size-3 transition-[transform,color] duration-200 text-on-surface-variant/60 group-hover:text-on-surface-variant',
                open && 'rotate-90 text-on-surface',
              )}
            />
          </Button>
        }
      />
      <CollapsiblePanel
        animation="none"
        keepMounted
        render={
          <m.div
            animate={{ height: open ? 'auto' : height }}
            className="relative overflow-hidden"
            hidden={false}
            initial={false}
          >
            <div className={cn('px-2 pt-3 pb-2', contentClassName)}>{children}</div>
          </m.div>
        }
      />
    </Collapsible>
  )
}
