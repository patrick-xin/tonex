'use client'

import { Menu as BaseMenu } from '@base-ui/react/menu'
import { CaretRightIcon, CheckIcon, CircleIcon } from '@phosphor-icons/react'
import type * as React from 'react'

import { cn, tv, type VariantProps } from 'tailwind-variants'
import { ArrowSvg } from '@/components/ui/arrow-svg'

function DropdownMenu<Payload>(props: BaseMenu.Root.Props<Payload>) {
  return <BaseMenu.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger<Payload>({ className, ...props }: BaseMenu.Trigger.Props<Payload>) {
  return (
    <BaseMenu.Trigger
      className={cn('select-none', className)}
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuPortal({ className, ...props }: BaseMenu.Portal.Props) {
  return <BaseMenu.Portal className={cn(className)} data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuBackdrop({ className, ...props }: BaseMenu.Backdrop.Props) {
  return (
    <BaseMenu.Backdrop
      className={cn('fixed inset-0', className)}
      data-slot="dropdown-menu-backdrop"
      {...props}
    />
  )
}

function DropdownMenuPositioner({ className, ...props }: BaseMenu.Positioner.Props) {
  return (
    <BaseMenu.Positioner
      className={cn('max-w-(--available-width)', className)}
      data-slot="dropdown-menu-positioner"
      {...props}
    />
  )
}

function DropdownMenuPopup({ className, ...props }: BaseMenu.Popup.Props) {
  return (
    <BaseMenu.Popup
      className={cn('relative', className)}
      data-slot="dropdown-menu-popup"
      {...props}
    />
  )
}

function DropdownMenuArrow({ className, ...props }: BaseMenu.Arrow.Props) {
  return (
    <BaseMenu.Arrow
      className={cn(
        'data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180',
        className,
      )}
      data-slot="dropdown-menu-arrow"
      {...props}
    >
      <ArrowSvg variant="popover" />
    </BaseMenu.Arrow>
  )
}

// =============================================================================
// Item variant
// =============================================================================

const dropdownMenuItemStyles = tv({
  base: [
    'flex items-center gap-2 py-1.5 px-3.5 text-sm text-on-surface',
    'outline-none select-none cursor-default',
    'highlight-on-active',
    'data-disabled:opacity-50 data-disabled:pointer-events-none',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-on-surface-variant",
  ],
  variants: {
    variant: {
      default: '',
      destructive: [
        'text-error [&_svg]:!text-error',
        'data-[highlighted]:text-error data-[highlighted]:before:bg-error/12! brightness-110',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type DropdownMenuItemProps = BaseMenu.Item.Props &
  VariantProps<typeof dropdownMenuItemStyles> & {
    unstyled?: boolean
  }

function DropdownMenuItem({
  className,
  variant = 'default',
  unstyled = false,
  ...props
}: DropdownMenuItemProps) {
  return (
    <BaseMenu.Item
      className={cn(unstyled ? '' : dropdownMenuItemStyles({ variant }), className)}
      data-slot="dropdown-menu-item"
      {...props}
    />
  )
}

function DropdownMenuLinkItem({
  className,
  unstyled = false,
  ...props
}: BaseMenu.LinkItem.Props & {
  unstyled?: boolean
}) {
  return (
    <BaseMenu.LinkItem
      className={cn(unstyled ? '' : dropdownMenuItemStyles({ variant: 'default' }), className)}
      data-slot="dropdown-menu-link-item"
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: BaseMenu.Separator.Props) {
  return (
    <BaseMenu.Separator
      className={cn('bg-outline-variant pointer-events-none my-1 h-px', className)}
      data-slot="dropdown-menu-separator"
      {...props}
    />
  )
}

function DropdownMenuGroup({ className, ...props }: BaseMenu.Group.Props) {
  return <BaseMenu.Group className={cn(className)} data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuGroupLabel({ className, ...props }: BaseMenu.GroupLabel.Props) {
  return (
    <BaseMenu.GroupLabel
      className={cn(
        'px-3.5 py-1.5 text-xs uppercase text-on-surface-variant font-semibold select-none',
        className,
      )}
      data-slot="dropdown-menu-group-label"
      {...props}
    />
  )
}

function DropdownMenuRadioGroup({ className, ...props }: BaseMenu.RadioGroup.Props) {
  return (
    <BaseMenu.RadioGroup
      className={cn(className)}
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({ children, className, ...props }: BaseMenu.RadioItem.Props) {
  return (
    <BaseMenu.RadioItem className={cn(className)} {...props} data-slot="dropdown-menu-radio-item" />
  )
}

function DropdownMenuCheckboxItem({ className, ...props }: BaseMenu.CheckboxItem.Props) {
  return (
    <BaseMenu.CheckboxItem
      className={cn(className)}
      data-slot="dropdown-menu-checkbox-item"
      {...props}
    />
  )
}

function DropdownMenuCheckboxItemIndicator({
  className,
  ...props
}: BaseMenu.CheckboxItemIndicator.Props) {
  return (
    <BaseMenu.CheckboxItemIndicator
      className={cn(className)}
      data-slot="dropdown-menu-checkbox-item-indicator"
      {...props}
    />
  )
}

function DropdownMenuSubMenu(props: BaseMenu.SubmenuRoot.Props) {
  return <BaseMenu.SubmenuRoot data-slot="dropdown-menu-sub-menu" {...props} />
}

function DropdownMenuSubMenuTrigger({ className, ...props }: BaseMenu.SubmenuTrigger.Props) {
  return (
    <BaseMenu.SubmenuTrigger
      className={cn(className)}
      data-slot="dropdown-menu-sub-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuSubMenuContent({
  align = 'start',
  side = 'right',
  sideOffset = -4,
  alignOffset = 0,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      align={align}
      alignOffset={alignOffset}
      data-slot="dropdown-menu-sub-menu-content"
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn('text-on-surface-variant ml-auto text-xs tracking-widest', className)}
      data-slot="dropdown-menu-shortcut"
      {...props}
    />
  )
}

function DropdownMenuSubMenuTriggerGroup({
  children,
  className,
  ...props
}: BaseMenu.SubmenuTrigger.Props) {
  return (
    <BaseMenu.SubmenuTrigger
      className={cn(
        'flex items-center gap-2 py-1.5 px-3.5 text-sm text-on-surface',
        'outline-none select-none cursor-default',
        'highlight-on-active',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-on-surface-variant",
        className,
      )}
      data-slot="dropdown-menu-sub-menu-trigger"
      {...props}
    >
      {children}
      <CaretRightIcon className="ml-auto size-4" />
    </BaseMenu.SubmenuTrigger>
  )
}

type DropdownMenuContentProps = BaseMenu.Popup.Props & {
  side?: BaseMenu.Positioner.Props['side']
  sideOffset?: BaseMenu.Positioner.Props['sideOffset']
  align?: BaseMenu.Positioner.Props['align']
  alignOffset?: BaseMenu.Positioner.Props['alignOffset']
  showArrow?: boolean
  matchAnchorWidth?: boolean
}

function DropdownMenuContent({
  children,
  className,
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 8,
  showArrow = false,
  matchAnchorWidth = true,
  ...props
}: DropdownMenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        align={align}
        alignOffset={alignOffset}
        className={cn(matchAnchorWidth && 'w-(--anchor-width)', 'max-h-(--available-height)')}
        side={side}
        sideOffset={sideOffset}
      >
        <BaseMenu.Popup
          className={cn(
            'relative bg-surface-container text-on-surface rounded-md shadow-md py-1',
            'overlay-outline animate-popup',
            className,
          )}
          data-slot="dropdown-menu-content"
          {...props}
        >
          {showArrow && <DropdownMenuArrow />}
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

interface DropdownMenuCheckboxItemContentProps extends BaseMenu.CheckboxItem.Props {
  indicatorPlacement?: 'start' | 'end'
  indicatorIcon?: React.ReactNode
}

function DropdownMenuCheckboxItemContent({
  className,
  children,
  checked,
  indicatorPlacement = 'start',
  indicatorIcon = <CheckIcon className="size-4" />,
  ...props
}: DropdownMenuCheckboxItemContentProps) {
  return (
    <BaseMenu.CheckboxItem
      checked={checked}
      className={cn(
        'grid items-center gap-2 py-1.5 pr-3 pl-3.5 text-sm',
        'outline-none select-none cursor-default',
        'highlight-on-active',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        indicatorPlacement === 'start' && 'grid-cols-[1rem_1fr]',
        indicatorPlacement === 'end' && 'grid-cols-[1fr_1rem]',
        className,
      )}
      data-slot="dropdown-menu-checkbox-item-content"
      {...props}
    >
      <BaseMenu.CheckboxItemIndicator
        className={cn(
          'flex items-center justify-center row-start-1',
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          indicatorPlacement === 'start' ? 'col-start-1' : 'col-start-2',
        )}
      >
        {indicatorIcon}
      </BaseMenu.CheckboxItemIndicator>
      <div
        className={cn(
          'flex items-center gap-2 row-start-1',
          indicatorPlacement === 'start' ? 'col-start-2' : 'col-start-1',
        )}
      >
        {children}
      </div>
    </BaseMenu.CheckboxItem>
  )
}

interface DropdownMenuRadioItemContentProps extends BaseMenu.RadioItem.Props {
  indicatorPlacement?: 'start' | 'end'
  indicatorIcon?: React.ReactNode
}

function DropdownMenuRadioItemContent({
  children,
  className,
  indicatorPlacement = 'start',
  indicatorIcon = <CircleIcon className="size-2.5 fill-current" />,
  ...props
}: DropdownMenuRadioItemContentProps) {
  return (
    <BaseMenu.RadioItem
      className={cn(
        'grid items-center gap-2 py-1.5 pr-3 pl-3.5 text-sm',
        'outline-none select-none cursor-default',
        'highlight-on-active',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        indicatorPlacement === 'start' && 'grid-cols-[1rem_1fr]',
        indicatorPlacement === 'end' && 'grid-cols-[1fr_1rem]',
        className,
      )}
      data-slot="dropdown-menu-radio-item-content"
      {...props}
    >
      <BaseMenu.RadioItemIndicator
        className={cn(
          'flex items-center justify-center row-start-1',
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          indicatorPlacement === 'start' ? 'col-start-1' : 'col-start-2',
        )}
      >
        {indicatorIcon}
      </BaseMenu.RadioItemIndicator>
      <div
        className={cn(
          'flex items-center gap-2 row-start-1',
          indicatorPlacement === 'start' ? 'col-start-2' : 'col-start-1',
        )}
      >
        {children}
      </div>
    </BaseMenu.RadioItem>
  )
}

const createDropdownMenuHandle = BaseMenu.createHandle

export {
  createDropdownMenuHandle,
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuBackdrop,
  DropdownMenuCheckboxItem,
  DropdownMenuCheckboxItemContent,
  DropdownMenuCheckboxItemIndicator,
  // Composite components
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuPopup,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRadioItemContent,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuSubMenuTriggerGroup,
  DropdownMenuTrigger,
  dropdownMenuItemStyles,
}
