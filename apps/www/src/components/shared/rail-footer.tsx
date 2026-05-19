import { GithubLogoIcon, XLogoIcon } from '@phosphor-icons/react/ssr'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import type { Layer } from '@/lib/layer-context'
import { SiteLogo } from './site-logo'

export function RailFooter({ className, layer }: { className?: string; layer: Layer }) {
  return (
    <div className={cn('p-2 flex justify-between bg-surface-container', className)}>
      <SiteLogo className="size-7" layer={layer} />
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
