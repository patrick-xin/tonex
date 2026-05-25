'use client'

import { Radio as BaseRadio } from '@base-ui/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import type { ReactNode } from 'react'
import { cn } from 'tailwind-variants'
import { focusVisibleRing } from './styles'

function RadioGroup({ className, ...props }: BaseRadioGroup.Props) {
  return (
    <BaseRadioGroup className={cn('grid gap-2', className)} data-slot="radio-group" {...props} />
  )
}

function RadioRoot({ className, ...props }: BaseRadio.Root.Props) {
  return <BaseRadio.Root className={cn('rounded-full', className)} data-slot="radio" {...props} />
}

function RadioIndicator({ className, ...props }: BaseRadio.Indicator.Props) {
  return (
    <BaseRadio.Indicator
      className={cn('data-unchecked:hidden', className)}
      data-slot="radio-indicator"
      {...props}
    />
  )
}

function Radio({ className, ...props }: BaseRadio.Root.Props) {
  return (
    <BaseRadio.Root
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-full',
        'bg-transparent border border-outline data-checked:border-primary',
        'transition-[color,box-shadow]',
        focusVisibleRing,
        'aria-invalid:border-error aria-invalid:outline aria-invalid:outline-error',
        'data-disabled:cursor-not-allowed data-disabled:opacity-38',
        className,
      )}
      data-slot="radio"
      {...props}
    >
      <BaseRadio.Indicator
        className="flex items-center justify-center before:size-2 before:rounded-full before:bg-primary data-unchecked:hidden"
        data-slot="radio-group-indicator"
      />
    </BaseRadio.Root>
  )
}

// why: the selectable card shell shared by every "pick one of N" surface (the
// preset-switch dialog's keep-vs-preset choice, custom-colors' color/container
// pair). The whole card is a <label> whose associated control is the nested
// Radio — clicking anywhere selects it, and assistive tech announces the card's
// `label` plus its body. Centralized so the border/selected styling can't drift
// between call sites; each site passes its own value body as `children`.
function RadioCard({
  value,
  selected,
  label,
  className,
  children,
}: {
  value: string
  selected: boolean
  label: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the nested Radio (a Base UI <button>, a labelable control) is the associated control
    <label
      className={cn(
        'flex cursor-pointer flex-col gap-2 rounded-md border p-2 transition-colors',
        selected
          ? 'border-outline-variant bg-primary/8'
          : 'border-outline-variant/60 hover:border-outline-variant',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-on-surface">{label}</span>
        <Radio value={value} />
      </div>
      {children}
    </label>
  )
}

export {
  // Composite component
  Radio,
  RadioCard,
  RadioGroup,
  RadioIndicator,
  RadioRoot,
}
