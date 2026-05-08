import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/80 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-on-surface-variant sm:flex-row">
        <p>&copy; {new Date().getFullYear()} tonex</p>
        <ul className="flex items-center gap-4">
          <li>
            <Link href="/about" className="hover:text-on-surface">
              About
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="hover:text-on-surface">
              Pricing
            </Link>
          </li>
          <li>
            <a
              href="https://github.com/patrick-xin/tonex"
              target="_blank"
              rel="noreferrer"
              className="hover:text-on-surface"
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
