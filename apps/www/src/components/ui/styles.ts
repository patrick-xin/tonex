import { cn, cx } from 'tailwind-variants'

const errorState = cx([
  'aria-invalid:border aria-invalid:border-error aria-invalid:ring-4 aria-invalid:ring-error/12',
  'data-invalid:border data-invalid:border-error data-invalid:ring-4 data-invalid:ring-error/12',
])

const errorStateWithoutRing = cx([
  'aria-invalid:border aria-invalid:border-error/87',
  'data-invalid:border data-invalid:border-error/87',
])

const disabledState = cx([
  'data-disabled:pointer-events-none data-disabled:cursor-default data-disabled:opacity-38 data-disabled:shadow-none',
  'aria-disabled:pointer-events-none aria-disabled:cursor-default aria-disabled:opacity-38 aria-disabled:shadow-none',
])

// Inputs and transparent buttons
const focusVisibleRing = cx([
  'focus-visible:outline-none focus-visible:border-primary/87 focus-visible:ring-primary/12 focus-visible:ring-3',
])

const focusVisibleWithoutRing = cx(['focus-visible:outline-none focus-visible:border-primary/87'])

const focusWithinRing = cx([
  'focus-visible:outline-none focus-within:ring-3 focus-within:border-primary/87 focus-within:ring-primary/12',
  errorState,
])

// Button related components with colors, use outline-offset-1
const focusVisiblePrimaryRing = cx([
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60',
])

// const focusVisiblePrimaryRing = cx([
//   "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-on-primary",
// ]);

const focusVisibleSecondaryRing = cx([
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-container',
])
// const focusVisibleSecondaryRing = cx([
//   "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-on-secondary",
// ]);

const focusVisibleTertiaryRing = cx([
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-container',
])

// const focusVisibleTertiaryRing = cn([
//   "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-on-tertiary",
// ]);

const focusVisibleDangerRing = cn([
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error/60 dark:focus-visible:outline-error-container/60',
])

export {
  disabledState,
  errorState,
  errorStateWithoutRing,
  focusVisibleDangerRing,
  focusVisiblePrimaryRing,
  focusVisibleRing,
  focusVisibleSecondaryRing,
  focusVisibleTertiaryRing,
  focusVisibleWithoutRing,
  focusWithinRing,
}
