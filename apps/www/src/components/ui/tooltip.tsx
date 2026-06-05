'use client'

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cn, tv, type VariantProps } from 'tailwind-variants'
import { ArrowSvg, type arrowVariants } from '@/components/ui/arrow-svg'

function TooltipProvider({ delay = 150, ...props }: BaseTooltip.Provider.Props) {
  return <BaseTooltip.Provider data-slot="tooltip-provider" delay={delay} {...props} />
}

function Tooltip<Payload>(props: BaseTooltip.Root.Props<Payload>) {
  return <BaseTooltip.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger<Payload>({ className, ...props }: BaseTooltip.Trigger.Props<Payload>) {
  return <BaseTooltip.Trigger className={className} data-slot="tooltip-trigger" {...props} />
}

function TooltipPortal({ className, ...props }: BaseTooltip.Portal.Props) {
  return <BaseTooltip.Portal className={className} data-slot="tooltip-portal" {...props} />
}

function TooltipPositioner({ className, ...props }: BaseTooltip.Positioner.Props) {
  return (
    <BaseTooltip.Positioner
      className={cn(
        'outline-none h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)',
        className,
      )}
      data-slot="tooltip-positioner"
      {...props}
    />
  )
}

function TooltipPopup({ className, ...props }: BaseTooltip.Popup.Props) {
  return (
    <BaseTooltip.Popup className={cn('relative', className)} data-slot="tooltip-popup" {...props} />
  )
}

function TooltipArrow({
  className,
  variant,
  ...props
}: BaseTooltip.Arrow.Props & {
  variant?: VariantProps<typeof arrowVariants>['variant']
}) {
  return (
    <BaseTooltip.Arrow
      className={cn(
        'flex items-center justify-center',
        'data-[side=bottom]:-top-2 data-[side=bottom]:rotate-0',
        'data-[side=left]:-right-3 data-[side=left]:rotate-90',
        'data-[side=right]:-left-3 data-[side=right]:-rotate-90',
        'data-[side=top]:-bottom-2 data-[side=top]:rotate-180',
        className,
      )}
      data-slot="tooltip-arrow"
      style={{
        width: 'max(20px, calc(var(--radius) * 1.7))',
      }}
      {...props}
    >
      <ArrowSvg variant={variant} />
    </BaseTooltip.Arrow>
  )
}

function TooltipViewport({ className, ...props }: BaseTooltip.Viewport.Props) {
  return (
    <BaseTooltip.Viewport
      className={cn('relative size-full', className)}
      data-slot="tooltip-viewport"
      {...props}
    />
  )
}

const tooltipVariants = tv({
  base: [
    'w-fit rounded-md px-3 py-1.5 text-xs text-balance',
    'animate-popup duration-0 data-instant:transition-none',
  ],
  variants: {
    variant: {
      default: 'bg-surface-container overlay-outline',
      inverse: 'bg-inverse-surface text-inverse-on-surface',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

// Composite component
function TooltipContent({
  className,
  sideOffset = 10,
  side = 'top',
  align = 'center',
  alignOffset = 0,
  showArrow = true,
  variant = 'default',
  children,
  ...props
}: BaseTooltip.Popup.Props &
  Pick<BaseTooltip.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'> & {
    variant?: VariantProps<typeof tooltipVariants>['variant']
    showArrow?: boolean
  }) {
  return (
    <TooltipPortal>
      <BaseTooltip.Positioner
        align={align}
        alignOffset={alignOffset}
        data-slot="tooltip-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <BaseTooltip.Popup
          className={cn(tooltipVariants({ variant }), className)}
          data-slot="tooltip-content"
          {...props}
        >
          {children}
          {showArrow && (
            <TooltipArrow variant={variant === 'inverse' ? 'tooltipInverse' : 'tooltip'} />
          )}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </TooltipPortal>
  )
}

const createTooltipHandle = BaseTooltip.createHandle

export {
  createTooltipHandle,
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipProvider,
  TooltipTrigger,
  TooltipViewport,
  tooltipVariants,
}
