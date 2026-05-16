import { GithubLogoIcon, XLogoIcon } from '@phosphor-icons/react/ssr'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import { SiteLogo } from './site-logo'

export function RailFooter({ className }: { className?: string }) {
  return (
    <div className={cn('p-2 flex justify-between bg-surface-container', className)}>
      <SiteLogo className="size-7" />
      <div className="space-x-0.5">
        <Button variant="ghost" size="icon-sm">
          <GithubLogoIcon className="text-on-surface-variant size-5" weight="fill" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <XLogoIcon className="text-on-surface-variant size-5" weight="fill" />
        </Button>
      </div>
    </div>
  )
}
