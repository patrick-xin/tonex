import { Blend, Command, ImagePlus, Palette, Save, Sparkles } from 'lucide-react'
import type { ComponentType, CSSProperties, SVGProps } from 'react'
import { SectionHeader } from '../section-header'

// lucide icons are plain svg components — widen to their common shape so the map
// can hold any of them (mirrors export-tabs' IconComponent).
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

type FeatureId = 'ecosystems' | 'logo' | 'colors' | 'keyboard' | 'presets' | 'autosave'

const FEATURES: { id: FeatureId; title: string; body: string; accent: string }[] = [
  {
    id: 'ecosystems',
    title: 'Two ecosystems, one source',
    body: 'Generate a shadcn theme and a Material Design 3 theme from the same color — both ready to export, no work done twice.',
    accent: 'var(--color-chart-1)',
  },
  {
    id: 'logo',
    title: 'Start from a logo',
    body: 'Drop in a logo or photo and Tonex pulls your color straight out of it — no eyedropper, no guesswork.',
    accent: 'var(--color-chart-3)',
  },
  {
    id: 'colors',
    title: 'Bring your own colors',
    body: 'Add a highlight or a category color and it auto-tunes to sit naturally beside the rest — in both light and dark.',
    accent: 'var(--color-chart-5)',
  },
  {
    id: 'keyboard',
    title: 'Keyboard-fast',
    body: 'A command menu and shortcuts put every action — switch modes, export, check contrast — one keystroke away.',
    accent: 'var(--color-chart-2)',
  },
  {
    id: 'presets',
    title: 'Ready-made presets',
    body: 'Not sure where to start? Begin from a hand-crafted preset and tune from there.',
    accent: 'var(--color-outline)',
  },
  {
    id: 'autosave',
    title: 'Saves as you go',
    body: 'Your work persists automatically in your browser — no sign-up, nothing to lose on refresh.',
    accent: 'var(--color-secondary)',
  },
]

// Keyed by feature id. Exhaustive Record, so adding a FeatureId forces a matching
// icon here (no silent fallback) — same contract as export-tabs' icon map.
const icons: Record<FeatureId, IconComponent> = {
  ecosystems: Blend,
  logo: ImagePlus,
  colors: Palette,
  keyboard: Command,
  presets: Sparkles,
  autosave: Save,
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  accent,
}: {
  icon: IconComponent
  title: string
  body: string
  accent: string
}) {
  return (
    <div
      style={{ '--accent': accent } as CSSProperties}
      className="flex flex-col gap-3 rounded-md border border-outline-variant/60 bg-surface-container-low p-6 transition-colors duration-200 hover:border-[color-mix(in_oklab,var(--accent)_60%,var(--color-outline-variant))]"
    >
      <span className="inline-flex size-8 items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-(--accent)">
        <Icon className="size-4" />
      </span>
      <h3 className="text-lg font-medium text-on-surface">{title}</h3>
      <p className="text-sm text-on-surface-variant">{body}</p>
    </div>
  )
}

export function Features() {
  return (
    <section className="mx-auto py-12 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          align="start"
          heading="Everything else you'd reach for"
          description="The details that add up."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={icons[feature.id]}
              title={feature.title}
              body={feature.body}
              accent={feature.accent}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
