import Image from 'next/image'
import Link from 'next/link'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'

export function SiteLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center size-8', className)}>
      <Link className={cn('outline-transparent', focusVisiblePrimaryRing)} href="/">
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
