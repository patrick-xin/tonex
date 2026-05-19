import Image from 'next/image'
import Link from 'next/link'
import { cn } from 'tailwind-variants'
import type { Layer } from '@/lib/layer-context'

export function SiteLogo({ className, layer }: { className?: string; layer: Layer }) {
  return (
    <div className="flex items-center justify-center size-8">
      <Link href={layer === 'md' ? '/' : '/shadcn'}>
        <Image
          loading="eager"
          src="/logo.png"
          alt="Logo"
          width={200}
          height={200}
          className={cn('size-full object-contain', className)}
        />
      </Link>
    </div>
  )
}
