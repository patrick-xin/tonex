import { cn } from 'tailwind-variants'
import { GitHubLink } from './chrome/github-link'
import { SiteLogo } from './chrome/site-logo'
import { XLink } from './chrome/x-link'
import { ThemeModeToggle } from './theme-mode-toggle'

export function RailFooter({ className }: { className?: string }) {
  return (
    <div className={cn('p-2 flex justify-between items-center bg-surface-container', className)}>
      <SiteLogo className="size-5" />
      <div className="flex items-center space-x-0.5">
        <ThemeModeToggle />
        <GitHubLink />
        <XLink />
      </div>
    </div>
  )
}
