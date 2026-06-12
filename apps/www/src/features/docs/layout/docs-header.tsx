import { SiteLogo } from '@/components/shared/chrome/site-logo'
import { DrawerMobileNavigation } from '@/components/shared/mobile-nav-drawer'
import { RainbowButton } from '@/components/shared/rainbow-button'
import { ThemeModeToggle } from '@/components/shared/theme-mode-toggle'

export const DocsHeader = () => {
  return (
    <header className="h-full flex items-center justify-between px-4 sm:px-8 bg-surface-container-low">
      <SiteLogo />
      <div className="flex items-center gap-4 h-full">
        <div className="hidden md:block">
          <ThemeModeToggle showShortcut />
        </div>
        <RainbowButton />
        <div className="md:hidden">
          <DrawerMobileNavigation />
        </div>
      </div>
    </header>
  )
}
