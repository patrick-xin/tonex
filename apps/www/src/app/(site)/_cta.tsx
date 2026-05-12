import { GithubLogoIcon } from '@phosphor-icons/react/ssr'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Cta() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 text-center">
      <div className="rounded-2xl border border-outline-variant/80 bg-surface-container-high p-12">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">
          Free while in preview. Open source on launch day.
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            variant="primary"
            nativeButton={false}
            render={<Link href="/theme" />}
            className="rounded-xl px-8 h-12 text-base font-semibold"
          >
            Try tonex
            <ArrowRight className="ml-2 size-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={
              <Link href="https://github.com/patrick-xin/tonex" target="_blank" rel="noreferrer" />
            }
            className="rounded-xl px-8 h-12 text-base font-medium"
          >
            Star on GitHub
            <GithubLogoIcon className="ml-2 size-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
