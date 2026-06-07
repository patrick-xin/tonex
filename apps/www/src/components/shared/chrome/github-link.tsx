import { GithubLogoIcon } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/lib/site-config'

export function GitHubLink() {
  return (
    <Button
      nativeButton={false}
      aria-label="GitHub"
      render={<Link rel="noreferrer" target="_blank" href={SITE_CONFIG.social.github} />}
      variant="ghost"
      size="icon-sm"
    >
      <GithubLogoIcon className="text-on-surface-variant size-5" weight="fill" />
    </Button>
  )
}
