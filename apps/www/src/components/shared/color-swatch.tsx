import { cx } from 'tailwind-variants'

interface ColorSwatchProps extends React.HTMLAttributes<HTMLDivElement> {
  isSelected: boolean
  color: string
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export function ColorSwatch({
  color,
  name,
  className,
  isSelected,
  size = 'sm',
  ...props
}: ColorSwatchProps) {
  const sizeClasses = { sm: 'size-5', md: 'size-6', lg: 'size-8' }
  const isTransparent = color === 'transparent'

  return (
    <div
      className={cx(
        'group relative rounded-md ring-1 ring-inset ring-foreground/15',
        isTransparent
          ? 'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-size-[8px_8px] bg-position-[0_0,0_4px,4px_-4px,-4px_0px]'
          : 'bg-(--color)',
        sizeClasses[size],
        className,
      )}
      style={!isTransparent ? ({ '--color': color } as React.CSSProperties) : undefined}
      {...props}
    />
  )
}
