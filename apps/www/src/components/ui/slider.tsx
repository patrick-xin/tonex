'use client'

import { Slider as BaseSlider } from '@base-ui/react/slider'
import * as React from 'react'

import { cn, tv, type VariantProps } from 'tailwind-variants'

function SliderRoot({ className, ...props }: BaseSlider.Root.Props) {
  return (
    <BaseSlider.Root
      className={cn('touch-none select-none', className)}
      data-slot="slider"
      {...props}
    />
  )
}

function SliderLabel({ children, className, ...props }: BaseSlider.Label.Props) {
  return (
    <BaseSlider.Label
      className={cn(
        'text-sm leading-none font-medium text-on-surface cursor-default aria-disabled:text-on-surface-variant',
        className,
      )}
      data-slot="slider-label"
      {...props}
    >
      {children}
    </BaseSlider.Label>
  )
}

function SliderControl({ className, ...props }: BaseSlider.Control.Props) {
  return (
    <BaseSlider.Control
      className={cn('touch-none select-none', className)}
      data-slot="slider-control"
      {...props}
    />
  )
}

function SliderTrack({ className, ...props }: BaseSlider.Track.Props) {
  return (
    <BaseSlider.Track
      className={cn('rounded-full select-none', className)}
      data-slot="slider-track"
      {...props}
    />
  )
}

function SliderValue({ className, children, ...props }: BaseSlider.Value.Props) {
  return (
    <BaseSlider.Value
      className={cn('text-sm font-medium text-on-surface-variant', className)}
      data-slot="slider-value"
      {...props}
    >
      {children}
    </BaseSlider.Value>
  )
}

function SliderIndicator({ className, ...props }: BaseSlider.Indicator.Props) {
  return (
    <BaseSlider.Indicator
      className={cn('select-none', className)}
      data-slot="slider-indicator"
      {...props}
    />
  )
}

function SliderThumb({ className, ...props }: BaseSlider.Thumb.Props) {
  return (
    <BaseSlider.Thumb
      className={cn('select-none', className)}
      data-slot="slider-thumb"
      {...props}
    />
  )
}

const sliderStyles = tv({
  slots: {
    root: [
      'data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full space-y-4',
      'data-disabled:cursor-default',
    ],
    label: ['text-sm leading-none font-medium text-on-surface cursor-default'],
    track: [
      'relative w-full grow rounded-full select-none',
      'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto',
      'bg-surface-container-highest',
      'data-disabled:bg-disabled-container',
    ],
    control: [
      'flex w-full items-center',
      'touch-none select-none',
      'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:px-2 data-[orientation=vertical]:py-0',
    ],
    indicator: [
      'absolute h-full rounded-full select-none',
      'data-[orientation=vertical]:w-full',
      'bg-primary',
      'data-disabled:bg-disabled-content',
    ],
    thumb: [
      'shrink-0 rounded-full block select-none bg-primary ring-0 transition-shadow',
      'transition-shadow duration-200 ease-out',
      'hover:ring-4 hover:ring-primary/16',
      'has-focus-visible:ring-4 has-focus-visible:ring-primary/20',
      'data-dragging:has-focus:ring-4 data-dragging:has-focus:ring-primary/30',
      'elevation-1',
      'data-disabled:bg-disabled-content data-disabled:elevation-0 data-disabled:pointer-events-none data-disabled:before:bg-transparent data-disabled:ring-0',
      'data-invalid:bg-error data-invalid:hover:ring-error/8',
    ],
  },
  variants: {
    size: {
      sm: {
        track: 'h-1 data-[orientation=vertical]:w-1',
        thumb: 'size-3',
      },
      default: {
        track: 'h-1 data-[orientation=vertical]:w-1',
        thumb: 'size-4',
      },
      lg: {
        track: 'h-1.5 data-[orientation=vertical]:w-1.5',
        thumb: 'size-5',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

type SliderVariants = VariantProps<typeof sliderStyles>

// Composite component
function Slider({
  className,
  defaultValue,
  value,
  children,
  inputRef,
  label,
  size = 'default',
  thumbLabels,
  ...props
}: BaseSlider.Root.Props &
  SliderVariants & {
    inputRef?: React.Ref<HTMLInputElement>
    label?: string
    thumbLabels?: string[]
  }) {
  const thumbCount = React.useMemo(() => {
    const valueToInspect = value ?? defaultValue
    if (Array.isArray(valueToInspect)) return valueToInspect.length
    return 1
  }, [value, defaultValue])

  const { root, label: labelStyle, track, indicator, thumb, control } = sliderStyles({ size })

  return (
    <BaseSlider.Root
      className={cn(root(), className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      {...props}
    >
      {(label || children) && (
        <div className="flex items-center justify-between">
          {label && (
            <BaseSlider.Label className={labelStyle()} data-slot="slider-label">
              {label}
            </BaseSlider.Label>
          )}
          {children}
        </div>
      )}

      <BaseSlider.Control className={control()} data-slot="slider-control">
        <BaseSlider.Track className={track()} data-slot="slider-track">
          <BaseSlider.Indicator className={indicator()} data-slot="slider-indicator" />

          {Array.from({ length: thumbCount }, (_, i) => (
            <BaseSlider.Thumb
              aria-label={thumbLabels?.[i]}
              className={thumb()}
              data-slot="slider-thumb"
              index={i}
              inputRef={i === 0 ? inputRef : undefined}
              key={String(i)}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
}

export {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderLabel,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderValue,
  sliderStyles,
}
