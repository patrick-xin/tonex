import { BarChart3, Command, Eye, Palette, Save, Settings2, Sparkles, Unlock } from 'lucide-react'
import type { ComponentType, CSSProperties, SVGProps } from 'react'
import { TailwindCSSIcon } from '@/components/icons/tailwind'
import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { SectionHeader } from '../section-header'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

type FeatureId =
  | 'accessibility'
  | 'tune'
  | 'colors'
  | 'keyboard'
  | 'presets'
  | 'autosave'
  | 'charts'
  | 'tailwind'
  | 'tokens'

const FEATURES: { id: FeatureId; title: string; body: string; accent: string }[] = [
  {
    id: 'accessibility',
    title: 'Readable by default',
    body: 'Every text-and-background pair is checked against WCAG as you work. Adjust contrast when you need to meet a stricter bar.',
    accent: 'var(--color-chart-1)',
  },
  {
    id: 'tune',
    title: 'Tune any color, and it stays coherent',
    body: 'Warm your neutrals, re-point a role, lock an exact brand color — adjust by feel and the rest of the palette re-balances to stay coherent around every change.',
    accent: 'var(--color-tertiary)',
  },
  {
    id: 'colors',
    title: 'Bring your own colors',
    body: 'Add a brand-new color — a highlight, a category, a seasonal accent — and tonex tunes it to sit naturally beside the rest, in both light and dark.',
    accent: 'var(--color-chart-4)',
  },
  {
    id: 'keyboard',
    title: 'Optimize for DX',
    body: 'Command menu, keyboard shortcuts, light/dark mode toggle, and copy-paste exports keep you in flow — every action a keystroke away, nothing that breaks your rhythm.',
    accent: 'var(--color-chart-2)',
  },
  {
    id: 'presets',
    title: 'Skip the blank page',
    body: 'Open a hand-crafted preset and make it yours, or ship it as-is — start from something considered instead of an empty canvas.',
    accent: 'var(--color-chart-3)',
  },
  {
    id: 'autosave',
    title: 'Pick up where you left off',
    body: "Your palette saves to your browser automatically. Close the tab, come back, and it's exactly where you left it — no account, nothing to lose.",
    accent: 'var(--color-chart-5)',
  },
  {
    id: 'charts',
    title: 'Color your charts automatically',
    body: 'Get chart-ready scales automatically — single-hue, multi-hue, or polychrome — pick the spread that fits your data instead of hand-picking series colors.',
    accent: 'var(--color-error)',
  },
  {
    id: 'tailwind',
    title: 'Pick any Tailwind color',
    body: 'Pick from the full Tailwind palette right inside the color picker — every shade mapped and ready to drop into a Tailwind project.',
    accent: 'var(--color-primary-container)',
  },
  {
    id: 'tokens',
    title: 'Unlock extended tokens',
    body: 'Turn on an extended token set when you need finer control — more named color roles for complex systems.',
    accent: 'var(--color-secondary)',
  },
]

const icons: Record<FeatureId, IconComponent> = {
  accessibility: Eye,
  tune: Settings2,
  colors: Palette,
  keyboard: Command,
  presets: Sparkles,
  autosave: Save,
  charts: BarChart3,
  tailwind: TailwindCSSIcon,
  tokens: Unlock,
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
      className="flex w-64 shrink-0 snap-start flex-col gap-3 rounded-md border border-transparent bg-surface-container-low p-6 transition-colors duration-200 group sm:w-auto sm:shrink relative"
    >
      <ShimmerBorder className="via-[color-mix(in_oklab,var(--accent),transparent)]" />
      <ShimmerBorder
        side="bottom"
        className="via-[color-mix(in_oklab,var(--accent),transparent)]"
      />
      <span className="inline-flex size-8 items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-on-surface-variant group-hover:bg-[color-mix(in_oklab,var(--accent)_30%,transparent)] transition-colors duration-300">
        <Icon className="size-4" />
      </span>
      <div className="text-lg font-medium text-on-surface">{title}</div>
      <p className="text-sm text-on-surface-variant">{body}</p>
    </div>
  )
}

export function Features() {
  return (
    <section className="relative mx-auto py-12 sm:py-24 isolate">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          align="start"
          heading="Everything else you'd reach for"
          description="The smaller decisions, already made, the polish is there before you ask for it."
        />
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
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
