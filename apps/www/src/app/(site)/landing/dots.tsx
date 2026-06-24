import { cn } from 'tailwind-variants'

interface DottedBackgroundProps {
  className?: string
  dotColor?: string
  showFade?: boolean
}

export function DottedBackground({
  className = '',
  dotColor = 'var(--color-outline-variant)',
  showFade = true,
}: DottedBackgroundProps) {
  return (
    <div
      className={cn('absolute inset-0 -z-10 size-full', className)}
      style={{
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        WebkitMaskImage: showFade
          ? 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 60%, transparent 100%)'
          : undefined,
        maskImage: showFade
          ? 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 60%, transparent 100%)'
          : undefined,
      }}
    />
  )
}
