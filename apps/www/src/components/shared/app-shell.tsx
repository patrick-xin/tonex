import type React from 'react'

// why: document-scroll shell. Rails are sticky on sm+, chrome (TopNav + NavTabs)
// is sticky at the top of the main column, and the mobile action bar is fixed
// to the bottom. The body is the only scroll container — no `h-dvh + min-h-0`
// chain, no inner scroll owners, so mobile scroll-chaining and dvh re-resolve
// bugs cannot occur. Cross-layer navigation tears down each layout cleanly,
// which is why MobileActionBar can hold its Sheet handle per-instance.
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
    <div className="sm:flex">
      {rail}
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-20 bg-surface">
          {topNav}
          {navTabs}
        </div>
        <main className="px-2 sm:px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+5rem)] sm:pb-6">
          {children}
        </main>
        {mobileActionBar}
      </div>
    </div>
  )
}
