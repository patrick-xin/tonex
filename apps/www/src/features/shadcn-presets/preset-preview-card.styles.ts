import { tv } from 'tailwind-variants'

// Animation logic lifted from the Base UI detached-triggers demo; surface
// colors swapped for theme tokens. The morph (resize/reposition) and the
// directional slide live entirely in these class strings — extracted here as
// tv slots so the card component reads as structure, and the (long, fiddly)
// animation lives in one debuggable place.
export const previewCardStyles = tv({
  slots: {
    // Tracks the active trigger's box; the transition is what makes the card
    // glide between chips instead of teleporting.
    positioner:
      'h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom,transform] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)]',
    // The visible surface; resizes between presets and fades/scales on open/close.
    popup:
      'relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] origin-[var(--transform-origin)] rounded-md outline outline-outline-variant bg-surface-container-high text-on-surface shadow-md transition-[width,height,opacity,transform] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0',
    // Clips the cross-fade between the previous and current preset bodies, with
    // the incoming/outgoing slide direction keyed off activation-direction.
    viewport:
      "relative h-full w-full overflow-clip rounded-md [&_[data-current]]:w-[var(--popup-width)] [&_[data-current]]:translate-x-0 [&_[data-current]]:opacity-100 [&_[data-current]]:transition-[translate,opacity] [&_[data-current]]:duration-[350ms,175ms] [&_[data-current]]:ease-[cubic-bezier(0.22,1,0.36,1)] [&_[data-previous]]:w-[var(--popup-width)] [&_[data-previous]]:translate-x-0 [&_[data-previous]]:opacity-100 [&_[data-previous]]:transition-[translate,opacity] [&_[data-previous]]:duration-[350ms,175ms] [&_[data-previous]]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-[30%] data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0 data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-[30%] data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0 data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-[30%] data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0 data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-[30%] data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0",
  },
})
