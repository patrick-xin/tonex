import Link from 'next/link'
import { SiteLogo } from '@/components/shared/site-logo'
import { Button } from '@/components/ui/button'
import type { Layer } from '@/lib/layer-context'

export function SiteHeader({ layer }: { layer: Layer }) {
  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-6">
        <SiteLogo layer={layer} />
        <Button size="sm" variant="fab" nativeButton={false} render={<Link href="/theme" />}>
          Open App
        </Button>
      </div>
    </header>
  )
}
