import { cn } from 'tailwind-variants'

export function ShimmerBorder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute top-0 inset-x-0 h-px w-full pointer-events-none bg-linear-to-r from-transparent via-[color-mix(in_oklab,var(--color-primary),transparent)] via-50% to-transparent',
        className,
      )}
    />
  )
}
