import { GithubLogoIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function GitHubLink() {
  return (
    <Button
      nativeButton={false}
      render={<Link rel="noreferrer" target="_blank" href="https://github.com/patrick-xin/tonex" />}
      variant="ghost"
      size="icon-sm"
    >
      <GithubLogoIcon className="text-on-surface-variant size-5" weight="fill" />
    </Button>
  )
}
