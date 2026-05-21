import * as React from 'react'

// why: the spotlight tour is only viable when the rail is on-screen — it anchors
// to a rail control. The rail is `hidden sm:flex`, so Tailwind's `sm` (640px) is
// the real gate. Deliberately NOT useIsMobile() (768px): at 640–767px the rail
// is visible and the spotlight works, yet a 768 gate would wrongly route to the
// Help fallback. This hook is the single source of truth for "tour viable".
//
// Returns `undefined` until mounted so callers can distinguish "not yet known"
// (skip gating decisions) from a resolved true/false — matters for the
// mid-tour resize-close in GuideProvider, which must not fire on the SSR pass.
export const RAIL_BREAKPOINT = 640

export function useIsRailVisible(): boolean | undefined {
  const [visible, setVisible] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${RAIL_BREAKPOINT}px)`)
    const onChange = () => setVisible(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return visible
}
