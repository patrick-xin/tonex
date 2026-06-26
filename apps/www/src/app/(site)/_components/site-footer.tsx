import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from 'tailwind-variants'
import { GitHubLink } from '@/components/shared/chrome/github-link'
import { SiteLogo } from '@/components/shared/chrome/site-logo'
import { XLink } from '@/components/shared/chrome/x-link'
import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { ROUTES, SITE_CONFIG } from '@/lib/site-config'
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
          <SiteLogo className="size-6 sm:size-10" />
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between md:justify-end md:gap-16">
            <nav aria-label="Site">
              <div className="mb-3 text-sm font-medium uppercase tracking-wider text-on-surface-variant/70">
                {SITE_CONFIG.brand}
              </div>
              <ul className="flex flex-wrap sm:flex-col gap-x-6 gap-y-3">
                <li>
                  <FooterLink href={ROUTES.materialTheme.href}>Web app</FooterLink>
                </li>
                <li>
                  <FooterLink href={ROUTES.about.href}>{ROUTES.about.label}</FooterLink>
                </li>
              </ul>
            </nav>
            <nav aria-label="Site">
              <div className="mb-3 text-sm font-medium uppercase tracking-wider text-on-surface-variant/70">
                Resources
              </div>
              <ul className="flex flex-wrap sm:flex-col gap-x-6 gap-y-3">
                <li>
                  <FooterLink href={ROUTES.docs.href}>{ROUTES.docs.label}</FooterLink>
                </li>
                <li>
                  <FooterLink href={ROUTES.changelog.href}>{ROUTES.changelog.label}</FooterLink>
                </li>
                <li>
                  <FooterLink href={ROUTES.roadmap.href}>{ROUTES.roadmap.label}</FooterLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="mt-12 py-4 flex items-center gap-4">
          <p className="text-xs text-on-surface-variant">© 2026 {SITE_CONFIG.brand}</p>
          <ul className="flex items-center gap-1">
            <li>
              <XLink />
            </li>
            <li>
              <GitHubLink />
            </li>
          </ul>
        </div>
      </div>
      <div aria-hidden className="mb-[-10%]">
        <BrandHover text="TONEX" />
      </div>
    </footer>
  )
}
