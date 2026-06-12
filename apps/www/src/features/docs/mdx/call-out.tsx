'use client'

import {
  BookOpenIcon,
  CheckCircleIcon,
  type IconProps,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react'
import { cn, tv, type VariantProps } from 'tailwind-variants'

const calloutVariants = tv({
  base: 'not-prose relative my-4 flex gap-3 rounded-lg p-4 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: 'bg-tertiary-container text-on-tertiary-container border-outline',
      destructive: 'border-error-container/38 bg-error-container/38 text-error [&>svg]:text-error',
      info: 'bg-tnx-info text-on-tnx-info [&>svg]:text-on-tnx-info',
      success: 'border-tnx-success bg-tnx-success text-on-tnx-success [&>svg]:text-on-tnx-success',
      warning: 'border-tnx-warning bg-tnx-warning text-on-tnx-warning [&>svg]:text-on-tnx-warning',
    },
  },
})

const iconMap: Record<string, React.ComponentType<IconProps>> = {
  default: BookOpenIcon,
  destructive: XCircleIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
}

export interface CalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  title?: string
  icon?: React.ComponentType<IconProps>
}

export function Callout({
  className,
  variant = 'default',
  title,
  icon,
  children,
  ...props
}: CalloutProps) {
  const Icon = icon ?? iconMap[variant ?? 'default']

  return (
    <div className={cn(calloutVariants({ variant }), className)} role="alert" {...props}>
      <Icon className="size-4" />
      <div className="flex flex-col gap-2">
        {title && <div className="font-medium leading-none">{title}</div>}
        {children && (
          <div className="text-sm [&_p]:leading-relaxed w-full [&_code]:bg-primary/10 [&_code]:text-xs">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
