import { BarChart3, Command, Eye, Palette, Save, Settings2, Sparkles, Unlock } from 'lucide-react'
import type { ComponentType, CSSProperties, SVGProps } from 'react'
import { TailwindCSSIcon } from '@/components/icons'
import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { SectionHeader } from '../section-header'
import { FEATURES, type FeatureId } from './data'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

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
      className="flex w-64 shrink-0 snap-start flex-col gap-3 rounded-xl border border-transparent bg-surface-container-low p-6 transition-colors duration-200 group sm:w-auto sm:shrink relative"
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
    <section className="relative py-12 sm:py-24 isolate px-4 md:px-12 lg:px-16 mx-auto max-w-7xl">
      <div className="">
        <SectionHeader
          align="start"
          heading="Everything else you'd reach for"
          description="The smaller decisions, already made, the polish is there before you ask for it."
          descriptionClassName="max-w-2xl"
        />
        <div className="flex snap-x snap-mandatory gap-4 sm:gap-6 overflow-x-auto no-scrollbar sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
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
