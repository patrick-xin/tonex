import { SiteLogo } from '@/components/shared/chrome/site-logo'
import { RainbowButton } from '@/components/shared/rainbow-button'
import { ThemeModeToggle } from '@/components/shared/theme-mode-toggle'
import { DocBreadcrumb } from '../docs-breadcrumb'
import { DocsSectionTabs } from './docs-section-tabs'

export const DocsHeader = () => {
  return (
    <>
      <header className="h-full flex items-center justify-between px-4 sm:px-6 bg-surface-container-low">
        <SiteLogo />
        <DocsSectionTabs />
        <div className="flex items-center gap-4 h-full">
          <div className="hidden md:block">
            <ThemeModeToggle showShortcut />
          </div>
          <RainbowButton />
        </div>
      </header>
      <DocBreadcrumb />
    </>
  )
}
