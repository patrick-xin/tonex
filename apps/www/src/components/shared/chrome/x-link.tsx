import { XLogoIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function XLink() {
  return (
    <Button
      nativeButton={false}
      render={<Link rel="noreferrer" target="_blank" href="https://x.com/alpesdream" />}
      variant="ghost"
      size="icon-sm"
    >
      <XLogoIcon className="text-on-surface-variant size-5" weight="fill" />
    </Button>
  )
}
