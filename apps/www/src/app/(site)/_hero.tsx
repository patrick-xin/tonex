import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        tonex — Material Design and shadcn themes from one source color
      </h1>
      <p className="max-w-2xl text-balance text-on-surface-variant">
        Pick a color. Get a coherent theme for both layers.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="primary" nativeButton={false} render={<Link href="/theme" />}>
          Open the editor
        </Button>
        <Button variant="ghost" nativeButton={false} render={<Link href="/about" />}>
          Learn more
        </Button>
      </div>
    </section>
  )
}
