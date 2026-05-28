import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn, tv, type VariantProps } from 'tailwind-variants'

const sectionHeadingStyles = tv({
  variants: {
    variant: {
      title: 'font-semibold tracking-tight',
      eyebrow: 'font-semibold uppercase tracking-wider',
      label: 'font-medium',
    },
    size: {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
  },
  defaultVariants: {
    variant: 'label',
    size: 'base',
  },
})

type SectionHeadingStylesProps = VariantProps<typeof sectionHeadingStyles>

interface SectionHeadingProps extends useRender.ComponentProps<'p'>, SectionHeadingStylesProps {}

// why: owns the group-label markup the md theme pages would otherwise hand-roll,
// as composable variant (weight/tracking/case) + size axes so they can't drift
// apart; the default label/base covers the common case with no props. useRender
// keeps the tag independent of styling (h2 for the page section title, p for
// inline group labels) without forcing a wrapper element.
export function SectionHeading({
  render,
  variant,
  size,
  className,
  ...props
}: SectionHeadingProps) {
  return useRender({
    defaultTagName: 'p',
    render,
    props: mergeProps<'p'>(
      { className: cn(sectionHeadingStyles({ variant, size }), className) },
      props,
    ),
  })
}

export { type SectionHeadingStylesProps, sectionHeadingStyles }
