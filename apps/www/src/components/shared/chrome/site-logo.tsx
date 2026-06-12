import Link from 'next/link'
import { cn } from 'tailwind-variants'
import { TonexLogoDuo } from '@/components/icons/logo'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'

export function SiteLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center size-6', className)}>
      <Link className={cn('outline-transparent', focusVisiblePrimaryRing)} href="/">
        <TonexLogoDuo />
      </Link>
    </div>
  )
}
