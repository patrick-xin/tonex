import { SubscribeForm } from '@/features/subscribe'

export function SubscribeSection() {
  return (
    <section className="border-t border-outline-variant/80 bg-surface">
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Hear when tonex ships something new
        </h2>
        <p className="mt-3 text-balance text-on-surface-variant">
          No newsletter. One email when a meaningful feature lands — and a quick line welcoming you
          in.
        </p>
        <div className="mx-auto mt-8 max-w-md text-left">
          <SubscribeForm />
        </div>
      </div>
    </section>
  )
}
