import type { HelpSection } from '@/features/help-dialog/help-sections'
import type { Layer } from '@/lib/layer-context'

// why: a tour step is *authored* against a stable anchor key, not a live ref —
// the host resolves anchorKey → element at render via the guide registry
// (makeLiveAnchor). layers gates which layer sees the step (you tour your own
// workspace). learnMore + onEnter are carried but inert this slice: learnMore
// is the help deep-link (slice 2), onEnter opens a hidden host before the
// spotlight (later slices). Each teaser is one tight sentence — canonical depth
// lives in the linked Help section, not here.
export type GuideStep = {
  key: string
  layers: Layer[]
  title: string
  description: string
  anchorKey: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  learnMore?: HelpSection
  onEnter?: () => void
}

// why: the welcome screen is authored data (not hard-coded in the presentational
// component) so its learnMore deep-link is covered by the same drift guard as the
// steps. Finding 8 orientation: tonex themes light + dark at once, shared
// foundation first then per-mode polish.
export const TOUR_WELCOME = {
  title: "You're theming light and dark at once",
  description:
    'Set your color, recipe, and contrast once for both modes, then tune each mode’s surface and pinned colors separately.',
  learnMore: 'light-dark-modes',
} satisfies { title: string; description: string; learnMore: HelpSection }

export const TOUR_STEPS: GuideStep[] = [
  {
    key: 'seed-color',
    layers: ['md', 'shadcn'],
    title: 'Start with a color',
    description: 'Everything in your theme is generated from this one seed color.',
    anchorKey: 'seed-color',
    side: 'right',
    learnMore: 'hct',
  },
  {
    key: 'surface-adjustment',
    layers: ['md', 'shadcn'],
    title: 'Restyle your neutrals',
    description:
      'Tune the greys, borders, and (optionally) text behind your content — without touching your brand colors.',
    anchorKey: 'surface-adjustment',
    side: 'right',
    learnMore: 'surface-adjustment',
  },
  {
    key: 'export',
    layers: ['md', 'shadcn'],
    title: 'Copy or export your theme',
    description:
      'What you see is what you paste — core tokens always export, and switches add the tonal palette, charts, or contrast variants.',
    anchorKey: 'export',
    side: 'bottom',
    learnMore: 'export-dialog',
  },
]

// why: pure so the layer rule is unit-testable without the live registry.
export function filterSteps(steps: GuideStep[], layer: Layer): GuideStep[] {
  return steps.filter((step) => step.layers.includes(layer))
}

export function getSteps(layer: Layer): GuideStep[] {
  return filterSteps(TOUR_STEPS, layer)
}
