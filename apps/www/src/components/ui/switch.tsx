import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { cn, tv, type VariantProps } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from './styles'

function SwitchRoot(props: BaseSwitch.Root.Props) {
  return <BaseSwitch.Root data-slot="switch" {...props} />
}

function SwitchThumb({ className, ...props }: BaseSwitch.Thumb.Props) {
  return (
    <BaseSwitch.Thumb
      className={cn('pointer-events-none', className)}
      data-slot="switch-thumb"
      {...props}
    />
  )
}

const switchVariants = tv({
  base: [
    'shrink-0 rounded-full peer group/switch relative inline-flex items-center outline-0 shadow-xs',
    'transition-colors duration-100 ease-out',
    'after:absolute after:-inset-1.5',
    'data-checked:bg-primary-container data-unchecked:bg-surface-container-highest',
    focusVisiblePrimaryRing,
    'aria-invalid:outline-2 aria-invalid:outline-error aria-invalid:outline-offset-2',
    'data-disabled:cursor-not-allowed data-disabled:opacity-38',
  ],
  variants: {
    size: {
      default: 'h-5 w-7.5 p-[3px]',
      lg: 'h-6 w-9 p-1',
      sm: 'h-4 w-6 p-0.5',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

const switchThumbVariants = tv({
  base: [
    'data-checked:bg-on-primary-container data-unchecked:bg-outline shadow-sm',
    'rounded-full pointer-events-none block ring-0',
    'transition-transform duration-100 ease-out',
  ],

  defaultVariants: {
    size: 'default',
  },
  variants: {
    size: {
      default: 'size-3.5 data-checked:translate-x-2.5 data-unchecked:translate-x-0',
      lg: 'size-4 data-checked:translate-x-3 data-unchecked:translate-x-0',
      sm: 'size-3 data-checked:translate-x-2 data-unchecked:translate-x-0',
    },
  },
})

function Switch({
  className,
  size = 'default',
  ...props
}: BaseSwitch.Root.Props & VariantProps<typeof switchVariants>) {
  return (
    <BaseSwitch.Root
      className={cn(switchVariants({ size }), className)}
      data-slot="switch"
      {...props}
    >
      <BaseSwitch.Thumb className={cn(switchThumbVariants({ size }))} data-slot="switch-thumb" />
    </BaseSwitch.Root>
  )
}

export { Switch, SwitchRoot, SwitchThumb, switchThumbVariants, switchVariants }
