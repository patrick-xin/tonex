import { XLogoIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/lib/site-config'

export function XLink() {
  return (
    <Button
      nativeButton={false}
      aria-label="X"
      render={<Link rel="noreferrer" target="_blank" href={SITE_CONFIG.social.x} />}
      variant="ghost"
      size="icon-sm"
    >
      <XLogoIcon className="text-on-surface-variant size-5" weight="fill" />
    </Button>
  )
}
