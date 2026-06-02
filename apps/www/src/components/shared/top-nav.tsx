import { SiteLogo } from './chrome/site-logo'
import { DrawerMobileNavigation } from './mobile-nav-drawer'

// why: ADR-0022 surface feature — mobile title bar. Desktop uses the rail for
// chrome; on mobile this `sm:hidden` header holds the logo above the nav tabs,
// while the editing/output chrome lives in the bottom action bar
// (features/mobile-action-bar). `layer` routes the logo to the matching
// marketing page (issue #142).
export function TopNav() {
  return (
    <header className="flex h-12 items-center justify-between gap-2 px-2 sm:hidden flex-none border-b border-b-outline-variant/80">
      <SiteLogo />
      <DrawerMobileNavigation />
    </header>
  )
}
