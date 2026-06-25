import type React from 'react'

// why: viewport-locked shell (issue #237). The document never scrolls — the root
// is `h-dvh overflow-hidden` and a single `<main data-scroll-container>` owns
// scroll. That is what kills the picker focus-jump: portaled popovers
// (Base UI Portal → <body>) focus-scroll their nearest scrollable ancestor, and
// Base UI only sets `preventScroll` on the popup container, never its inner
// input — so with a non-scrollable body that ancestor is the locked viewport and
// opening a picker can't move the page.
//
// Layout (sm+): the rail is a FULL-HEIGHT left column — the primary operation
// area — with its own inner scroll, and the chrome (NavTabs) sits above the MAIN
// column only, not full width, so the tab bar tracks the preview it controls.
// Below sm the rail collapses to a drawer and the chrome stacks full width
// (TopNav logo + NavTabs) over the scrollable main, with MobileActionBar fixed.
// The rail being static (not `sticky`) is what stops the fast-scroll flicker;
// MobileActionBar keeps its per-instance Sheet handle (the e25e78b cross-route
// freeze fix, independent of scroll model). `overscroll-contain` on main stops
// iOS scroll-chaining / rubber-band from leaking to the locked viewport.
export function AppShell({
  rail,
  topNav,
  navTabs,
  mobileActionBar,
  children,
}: {
  rail: React.ReactNode
  topNav: React.ReactNode
  navTabs: React.ReactNode
  mobileActionBar: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row h-dvh overflow-hidden bg-surface">
      {rail}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {topNav}
        <div className="shrink-0 z-20 bg-surface">{navTabs}</div>
        <main
          data-scroll-container
          className="flex-1 min-h-0 min-w-0 overflow-y-auto overscroll-contain px-2 sm:px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+5rem)] sm:pb-6"
        >
          {children}
        </main>
      </div>
      {mobileActionBar}
    </div>
  )
}
