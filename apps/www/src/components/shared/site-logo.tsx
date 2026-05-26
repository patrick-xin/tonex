import Image from 'next/image'
import Link from 'next/link'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import type { Layer } from '@/lib/layer-context'

export function SiteLogo({ className, layer }: { className?: string; layer: Layer }) {
  return (
    <div className={cn('flex items-center justify-center size-8', className)}>
      <Link
        className={cn('outline-transparent', focusVisiblePrimaryRing)}
        href={layer === 'md' ? '/' : '/shadcn'}
      >
        <Image
          loading="eager"
          src="/logo.png"
          alt="Logo"
          width={200}
          height={200}
          className="size-full object-contain"
        />
      </Link>
    </div>
  )
}
