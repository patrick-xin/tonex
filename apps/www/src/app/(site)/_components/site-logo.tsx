import Image from 'next/image'
import Link from 'next/link'
import { cn } from 'tailwind-variants'

export function SiteLogo({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center size-8">
      <Link href="/">
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
