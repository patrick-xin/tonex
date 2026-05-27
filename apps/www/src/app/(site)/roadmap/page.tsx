import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roadmap',
  description: "What's shipped and what's next for tonex.",
}

export default function RoadmapPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 text-center">
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Roadmap</h1>
      <p className="mt-4 text-balance text-on-surface-variant">More soon.</p>
    </section>
  )
}
