import Link from 'next/link'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/80 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" className="font-semibold tracking-tight">
          tonex
        </Link>
        <nav className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-1.5 text-sm text-on-surface-variant hover:text-on-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://github.com/patrick-xin/tonex"
                target="_blank"
                rel="noreferrer"
                className="rounded-md px-3 py-1.5 text-sm text-on-surface-variant hover:text-on-surface"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
        <Button size="sm" variant="primary" nativeButton={false} render={<Link href="/theme" />}>
          Open App
        </Button>
      </div>
    </header>
  )
}
