import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Cta() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 text-center">
      <div className="rounded-2xl border border-outline-variant/80 bg-surface-container-high p-12">
        <h2 className="text-3xl font-semibold tracking-tight">Try the editor</h2>
        <p className="mt-3 text-on-surface-variant">
          Open the live editor and shape a theme in seconds.
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="primary" nativeButton={false} render={<Link href="/theme" />}>
            Open the editor
          </Button>
        </div>
      </div>
    </section>
  )
}
