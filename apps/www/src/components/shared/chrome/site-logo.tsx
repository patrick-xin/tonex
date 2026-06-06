import Link from 'next/link'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { TonexLogoDuo } from '../../icons/logo'

export function SiteLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center size-8', className)}>
      <Link className={cn('outline-transparent', focusVisiblePrimaryRing)} href="/">
        <TonexLogoDuo />
      </Link>
    </div>
  )
}
