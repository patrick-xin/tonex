import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from 'tailwind-variants'
import { GitHubLink } from '@/components/shared/chrome/github-link'
import { SiteLogo } from '@/components/shared/chrome/site-logo'
import { XLink } from '@/components/shared/chrome/x-link'
import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { BrandHover } from './brand-hover'

function FooterLink({
  href,
  external,
  children,
}: {
  href: string
  external?: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={cn(
        'rounded-sm text-sm text-on-surface-variant transition-colors hover:text-on-surface',
        focusVisiblePrimaryRing,
      )}
    >
      {children}
    </Link>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      <ShimmerBorder />
      <div className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <SiteLogo />
              <span className="text-lg font-semibold text-on-surface">Tonex</span>
            </div>
            <p className="max-w-xs text-sm text-on-surface-variant">
              Turn your color into a complete, accessible color system, grounded in real color
              science.
            </p>
            <ul className="-ml-2 flex items-center gap-1">
              <li>
                <XLink />
              </li>
              <li>
                <GitHubLink />
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between md:justify-end md:gap-16">
            <nav aria-label="Site">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-on-surface-variant/70">
                Resources
              </h2>
              <ul className="flex flex-wrap sm:flex-col gap-x-6 gap-y-3">
                <li>
                  <FooterLink href="/theme">MD theme</FooterLink>
                </li>
                <li>
                  <FooterLink href="/theme/shadcn">Shadcn mode</FooterLink>
                </li>
                <li>
                  <FooterLink href="/">Home</FooterLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="mt-12 py-4">
          <p className="text-xs text-on-surface-variant">© 2026 tonex</p>
        </div>
      </div>
      <div aria-hidden className="mb-[-10%]">
        <BrandHover text="TONEX" />
      </div>
    </footer>
  )
}
