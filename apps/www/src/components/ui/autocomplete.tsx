'use client'

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import { CaretDownIcon, XIcon } from '@phosphor-icons/react'
import type * as React from 'react'
import { cn, tv, type VariantProps } from 'tailwind-variants'
import { ArrowSvg } from '@/components/ui/arrow-svg'
import { Button } from '@/components/ui/button'
import {
  type InputContainerStylesProps,
  inputContainerStyles,
  inputStyles,
} from '@/components/ui/input'

const Autocomplete = BaseAutocomplete.Root

function AutocompleteInputGroup({
  children,
  variant = 'default',
  inputSize = 'default',
  className,
  ...props
}: Omit<BaseAutocomplete.InputGroup.Props, 'className'> & {
  variant?: VariantProps<typeof inputContainerStyles>['variant']
  inputSize?: VariantProps<typeof inputContainerStyles>['inputSize']
  className?: string
}) {
  return (
    <BaseAutocomplete.InputGroup
      className={inputContainerStyles({
        variant,
        inputSize,
        className,
      })}
      {...props}
    />
  )
}

function AutocompleteValue({ children, ...props }: BaseAutocomplete.Value.Props) {
  return (
    <BaseAutocomplete.Value data-slot="autocomplete-value" {...props}>
      {children}
    </BaseAutocomplete.Value>
  )
}

function AutocompleteIcon({ className, ...props }: BaseAutocomplete.Icon.Props) {
  return (
    <BaseAutocomplete.Icon
      className={cn(
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-on-surface-variant",
        className,
      )}
      data-slot="autocomplete-icon"
      {...props}
    />
  )
}

function AutocompleteInput({
  className,
  variant = 'default',
  inputSize = 'default',
  ...props
}: BaseAutocomplete.Input.Props & {
  variant?: VariantProps<typeof inputStyles>['variant']
  inputSize?: VariantProps<typeof inputStyles>['inputSize']
}) {
  return (
    <BaseAutocomplete.Input
      className={cn(inputStyles({ inputSize, variant }), className)}
      data-slot="autocomplete-input"
      {...props}
    />
  )
}

function AutocompleteClear({ className, ...props }: BaseAutocomplete.Clear.Props) {
  return (
    <BaseAutocomplete.Clear
      aria-label="Clear selection"
      className={cn(
        'outline-none pointer-coarse:after:absolute pointer-coarse:after:min-h-10 pointer-coarse:after:min-w-10',
        className,
      )}
      data-slot="autocomplete-clear"
      {...props}
    />
  )
}

function AutocompleteTrigger({ className, ...props }: BaseAutocomplete.Trigger.Props) {
  return (
    <BaseAutocomplete.Trigger
      className={cn(
        'outline-none pointer-coarse:after:absolute pointer-coarse:after:min-h-10 pointer-coarse:after:min-w-10',
        className,
      )}
      data-slot="autocomplete-trigger"
      {...props}
    />
  )
}

function AutocompleteList({ className, ...props }: BaseAutocomplete.List.Props) {
  return (
    <BaseAutocomplete.List
      className={cn(
        'outline-none py-1 data-empty:p-0',
        'min-h-0 overflow-y-auto scroll-py-2',
        className,
      )}
      data-slot="autocomplete-list"
      {...props}
    />
  )
}

function AutocompletePortal({ className, ...props }: BaseAutocomplete.Portal.Props) {
  return (
    <BaseAutocomplete.Portal className={className} data-slot="autocomplete-portal" {...props} />
  )
}

function AutocompleteBackdrop({ className, ...props }: BaseAutocomplete.Backdrop.Props) {
  return (
    <BaseAutocomplete.Backdrop className={className} data-slot="autocomplete-backdrop" {...props} />
  )
}

function AutocompletePositioner({ className, ...props }: BaseAutocomplete.Positioner.Props) {
  return (
    <BaseAutocomplete.Positioner
      className={cn('outline-none', className)}
      data-slot="autocomplete-positioner"
      {...props}
    />
  )
}

function AutocompletePopup({ className, ...props }: BaseAutocomplete.Popup.Props) {
  return <BaseAutocomplete.Popup className={className} data-slot="autocomplete-popup" {...props} />
}

function AutocompleteArrow({ className, ...props }: BaseAutocomplete.Arrow.Props) {
  return (
    <BaseAutocomplete.Arrow
      className={cn(
        'data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180',
        className,
      )}
      data-slot="autocomplete-arrow"
      {...props}
    >
      <ArrowSvg />
    </BaseAutocomplete.Arrow>
  )
}

function AutocompleteStatus({ className, ...props }: BaseAutocomplete.Status.Props) {
  return (
    <BaseAutocomplete.Status
      className={cn(
        'p-3 text-sm text-center text-on-surface-variant flex gap-2 items-center empty:m-0 empty:p-0',
        className,
      )}
      data-slot="autocomplete-status"
      {...props}
    />
  )
}

function AutocompleteEmpty({ className, ...props }: BaseAutocomplete.Empty.Props) {
  return (
    <BaseAutocomplete.Empty
      className={cn(
        'p-3 text-sm text-center text-on-surface-variant empty:m-0 empty:p-0',
        className,
      )}
      data-slot="autocomplete-empty"
      {...props}
    />
  )
}

function AutocompleteCollection(props: BaseAutocomplete.Collection.Props) {
  return <BaseAutocomplete.Collection data-slot="autocomplete-collection" {...props} />
}

function AutocompleteRow({ className, ...props }: BaseAutocomplete.Row.Props) {
  return <BaseAutocomplete.Row className={className} data-slot="autocomplete-row" {...props} />
}

function AutocompleteItem({ className, ...props }: BaseAutocomplete.Item.Props) {
  return (
    <BaseAutocomplete.Item
      className={cn(
        'flex items-center gap-2 py-1.5 text-sm pl-3.5 pr-8',
        'select-none cursor-default outline-none',
        'highlight-on-active',
        "[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-on-surface-variant",
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      data-slot="autocomplete-item"
      {...props}
    />
  )
}

function AutocompleteGroup({ className, ...props }: BaseAutocomplete.Group.Props) {
  return <BaseAutocomplete.Group className={className} data-slot="autocomplete-group" {...props} />
}

function AutocompleteGroupLabel({ className, ...props }: BaseAutocomplete.GroupLabel.Props) {
  return (
    <BaseAutocomplete.GroupLabel
      className={cn(
        'px-3.5 py-1.5 text-xs text-on-surface-variant font-medium select-none',
        className,
      )}
      data-slot="autocomplete-group-label"
      {...props}
    />
  )
}

function AutocompleteSeparator({ className, ...props }: BaseAutocomplete.Separator.Props) {
  return (
    <BaseAutocomplete.Separator
      className={cn('bg-outline-variant pointer-events-none my-1 h-px', className)}
      data-slot="autocomplete-separator"
      {...props}
    />
  )
}

const autocompleteInputGroupContentStyles = tv({
  slots: {
    base: 'grid items-center',
    addonIconWrapper: [
      'flex justify-center items-center shrink-0 col-start-1 size-6',
      "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-on-surface-variant",
    ],
    input: 'min-w-0 p-0 h-auto',
    actions: 'flex items-center gap-px justify-end',
    clear: [
      '[&_svg]:text-on-surface-variant hover:[&_svg]:text-on-surface [&_svg]:pointer-events-none [&_svg]:size-4',
    ],
    trigger: [
      '[&_svg]:text-on-surface-variant [&_svg]:pointer-events-none data-popup-open:[&_svg]:text-on-surface hover:[&_svg]:text-on-surface data-popup-open:bg-surface-hover [&_svg]:size-4',
    ],
  },
  variants: {
    hasAddonIcon: {
      true: { base: 'gap-0.5 px-1' },
      false: {},
    },
    hasActions: {
      true: {},
      false: {},
    },
    overlay: {
      true: {
        actions: [
          'grid gap-0 [&>*]:col-start-1 [&>*]:row-start-1 min-w-6',
          '[&:has([data-slot=clear]:not([hidden]))>[data-slot=trigger]]:hidden',
        ],
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      hasAddonIcon: false,
      hasActions: false,
      class: { base: 'grid-cols-[minmax(0,1fr)]', input: 'col-start-1' },
    },
    {
      hasAddonIcon: false,
      hasActions: true,
      class: {
        base: 'grid-cols-[minmax(0,1fr)_auto]',
        input: 'col-start-1',
        actions: 'col-start-2',
      },
    },
    {
      hasAddonIcon: true,
      hasActions: false,
      class: { base: 'grid-cols-[auto_minmax(0,1fr)]', input: 'col-start-2' },
    },
    {
      hasAddonIcon: true,
      hasActions: true,
      class: {
        base: 'grid-cols-[auto_minmax(0,1fr)_auto]',
        input: 'col-start-2',
        actions: 'col-start-3',
      },
    },
  ],
  defaultVariants: {
    hasAddonIcon: false,
    hasActions: false,
    overlay: false,
  },
})

function AutocompleteInputGroupContent({
  className,
  actionsMode,
  variant = 'default',
  inputSize = 'default',
  embedded = false,
  addonIcon,
  ...props
}: Omit<BaseAutocomplete.Input.Props, 'className'> & {
  className?: string
  actionsMode?: 'clear' | 'trigger' | 'both' | 'overlay'
  addonIcon?: React.ReactNode
  embedded?: boolean
} & InputContainerStylesProps) {
  const { base, addonIconWrapper, input, actions, clear, trigger } =
    autocompleteInputGroupContentStyles({
      hasAddonIcon: !!addonIcon,
      hasActions: !!actionsMode,
      overlay: actionsMode === 'overlay',
    })

  return (
    <BaseAutocomplete.InputGroup
      className={cn(
        inputContainerStyles({
          variant: embedded ? 'ghost' : variant,
          inputSize,
          className: base(),
        }),
        embedded && 'border-b border-outline-variant',
        className,
      )}
    >
      {addonIcon && (
        <BaseAutocomplete.Icon className={addonIconWrapper()}>{addonIcon}</BaseAutocomplete.Icon>
      )}
      <BaseAutocomplete.Input
        className={inputStyles({
          variant: 'ghost',
          inputSize,
          className: input(),
        })}
        {...props}
      />
      {!!actionsMode && (
        <div className={actions()}>
          {actionsMode !== 'trigger' && (
            <BaseAutocomplete.Clear
              aria-label="Clear selection"
              data-slot="clear"
              render={<Button className={clear()} size="icon-xs" variant="ghost" />}
            >
              <XIcon />
            </BaseAutocomplete.Clear>
          )}
          {actionsMode !== 'clear' && (
            <BaseAutocomplete.Trigger
              data-slot="trigger"
              render={<Button className={trigger()} size="icon-xs" variant="ghost" />}
            >
              <BaseAutocomplete.Icon>
                <CaretDownIcon />
              </BaseAutocomplete.Icon>
            </BaseAutocomplete.Trigger>
          )}
        </div>
      )}
    </BaseAutocomplete.InputGroup>
  )
}

function AutocompleteContent({
  className,
  children,
  sideOffset = 6,
  align = 'start',
  side = 'bottom',
  alignOffset = 0,
  matchAnchorWidth = true,
  positionerAnchor,
  showArrow = false,
  ...props
}: BaseAutocomplete.Popup.Props &
  Pick<BaseAutocomplete.Positioner.Props, 'side' | 'sideOffset' | 'align' | 'alignOffset'> & {
    matchAnchorWidth?: boolean
    positionerAnchor?: React.RefObject<HTMLDivElement | null>
    showArrow?: boolean
  }) {
  return (
    <BaseAutocomplete.Portal data-slot="autocomplete-portal">
      <BaseAutocomplete.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={positionerAnchor}
        data-slot="autocomplete-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <BaseAutocomplete.Popup
          className={cn(
            'bg-surface-container text-on-surface-container rounded-md',
            'flex flex-col overflow-hidden',
            'max-w-(--available-width) max-h-[min(23rem,var(--available-height))]',
            'overlay-outline',
            matchAnchorWidth && 'w-(--anchor-width)',
            className,
          )}
          data-slot="autocomplete-content"
          {...props}
        >
          {showArrow && <AutocompleteArrow />}
          {children}
        </BaseAutocomplete.Popup>
      </BaseAutocomplete.Positioner>
    </BaseAutocomplete.Portal>
  )
}

const useAutocompleteFilter = BaseAutocomplete.useFilter
const useAutocompleteFilterItems = BaseAutocomplete.useFilteredItems

export {
  Autocomplete,
  AutocompleteArrow,
  AutocompleteBackdrop,
  AutocompleteClear,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteIcon,
  AutocompleteInput,
  AutocompleteInputGroup,
  // Composite components
  AutocompleteInputGroupContent,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompleteRow,
  AutocompleteSeparator,
  AutocompleteStatus,
  AutocompleteTrigger,
  AutocompleteValue,
  useAutocompleteFilter,
  useAutocompleteFilterItems,
}
