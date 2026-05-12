const FEATURES = [
  {
    title: 'One source color',
    body: 'Drop in a hex value or pluck it from an image. Both layers stay in sync.',
  },
  {
    title: 'Material Design 3',
    body: 'Full role coverage with scheme variants, surface tuning, and per-token overrides.',
  },
  {
    title: 'shadcn-ready',
    body: 'Generates shadcn role bindings alongside the MD3 theme — no second pass.',
  },
] as const

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="rounded-lg border border-outline-variant/80 bg-surface-container p-6"
          >
            <h3 className="text-lg font-medium text-on-surface">{feature.title}</h3>
            <p className="mt-2 text-sm text-on-surface-variant">{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
