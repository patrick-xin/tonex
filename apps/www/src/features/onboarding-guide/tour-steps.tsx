import type { ReactNode } from 'react'
import {
  BindingPreset,
  CustomColors,
  Export,
  LightMode,
  PaletteOverride,
  RoleBindings,
  RoleOverride,
  SchemeVariants,
  SourceColor,
  SurfaceAdjustment,
} from '@/components/icons'
import { Kbd } from '@/components/ui/kbd'
import type { HelpSection } from '@/features/help-dialog/help-sections'
import type { Layer } from '@/lib/layer-context'

// why: a tour step is *authored* against a stable anchor key, not a live ref —
// the host resolves anchorKey → element at render via the guide registry
// (makeLiveAnchor). layers gates which layer sees the step (you tour your own
// workspace).
export type GuideStep = {
  key: string
  layers: Layer[]
  title: string
  // why: the spotlight popover (a small label pinned to the highlighted element)
  // is a *separate* surface from the dialog title, so it gets its own field — a
  // short tag can differ from the dialog's headline. Optional: falls back to
  // `title` so the two read the same until a step overrides it.
  popoverTitle?: string
  // why: ReactNode (not string) so a step can author rich copy — a <kbd>, an
  // inline emphasis, a short list — not just a flat sentence. Stays plain text
  // by default; the host renders it inside the dialog description.
  description: ReactNode
  anchorKey: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  learnMore?: HelpSection
  onEnter?: () => void
  illustration?: ReactNode
}

// why: the welcome screen is authored data (not hard-coded in the presentational
// component). It's a general, anchor-free intro with no learnMore deep-link, so
// the first thing a user sees doesn't commit to a single concept. Copy is a
// placeholder pending final wording.
export const TOUR_WELCOME = {
  title: 'Welcome to Tonex',
  description:
    "Start with one color and the system builds a complete, accessible theme around it. From there it's yours to shape: change any color and the rest stays coherent. This tour walks you through it in minutes.",
} satisfies { title: string; description: ReactNode }

export const TOUR_STEPS: GuideStep[] = [
  {
    key: 'dark-mode',
    layers: ['md', 'shadcn'],
    title: 'Light/dark mode',
    description: (
      <>
        Switch between modes with <Kbd>D</Kbd>. The system builds both at once, so you edit one at a
        time. Some settings apply to both modes — like your seed color and variant; others, like
        contrast and overrides, only to the mode you're editing.
      </>
    ),
    anchorKey: 'dark-mode',
    side: 'top',
    learnMore: 'light-dark-modes',
    popoverTitle: 'Toggle light/dark mode',
    illustration: <LightMode />,
  },
  {
    key: 'seed-color',
    layers: ['md', 'shadcn'],
    title: 'Source color',
    description:
      'This is the one color the whole theme is built from. Set it however suits you — hex, OKLCH, or HCT value, or drop in an image and the app pulls its main color.',
    anchorKey: 'seed-color',
    side: 'right',
    learnMore: 'source-color',
    popoverTitle: 'Start with a color',
    illustration: <SourceColor />,
  },
  {
    key: 'scheme-variant',
    layers: ['md', 'shadcn'],
    title: 'Scheme variant',
    description:
      "The variant sets the palette's character — from quiet and restrained to bold and expressive. Your seed color stays the same; only the feel changes. Whichever you pick, the system stays coherent, so try a few.",
    anchorKey: 'scheme-variant',
    side: 'right',
    popoverTitle: 'Pick a character',
    illustration: <SchemeVariants />,
  },
  {
    key: 'palette-override',
    layers: ['md'],
    title: 'Palette override',
    description:
      'Take one color family and set it to whatever you want — its shades all update to match, while the other families stay exactly as they were. Say your error red needs to be a specific shade: override the error family and only your error colors change.',
    anchorKey: 'palette-override',
    side: 'right',
    popoverTitle: 'Reshape one family',
    illustration: <PaletteOverride />,
  },
  {
    key: 'binding-preset',
    layers: ['shadcn'],
    title: 'Binding preset',
    description:
      'Every shadcn component takes its color from a role — card, popover, background, border, and so on. A preset sets all of them at once for a particular look.',
    anchorKey: 'binding-preset',
    side: 'right',
    popoverTitle: 'Style every role at once',
    illustration: <BindingPreset />,
  },
  {
    key: 'surface-adjustment',
    layers: ['md', 'shadcn'],
    title: 'Surface adjustment',
    description:
      'Surfaces are the neutral backgrounds behind your content — not your brand colors. Tune how colored or grey they feel: Tint rebuilds them from a neutral you pick; Desaturate pulls the color toward grey.',
    anchorKey: 'surface-adjustment',
    side: 'right',
    learnMore: 'surface-adjustment',
    popoverTitle: 'Restyle your neutrals',
    illustration: <SurfaceAdjustment />,
  },
  {
    key: 'custom-colors',
    layers: ['md', 'shadcn'],
    title: 'Custom colors',
    description:
      "Add your own named colors — a brand accent, a status color, anything beyond the core palette. Each one gets the full light-and-dark treatment and ships in your export, just like your theme's other colors.",
    anchorKey: 'custom-colors',
    side: 'right',
    popoverTitle: 'Add your own colors',
    illustration: <CustomColors />,
  },
  {
    key: 'role-bindings',
    layers: ['shadcn'],
    title: 'Role bindings',
    description: (
      <>
        Point a role at a different generated color — make{' '}
        <code className="font-mono bg-surface-container-highest text-sm">--accent</code> follow{' '}
        <code className="font-mono bg-surface-container-highest text-sm">--color-secondary</code>.
        Presets set the defaults; rebind any role from there.
      </>
    ),
    anchorKey: 'role-bindings',
    side: 'right',
    learnMore: 'bindings-overrides',
    popoverTitle: 'Re-point any role',
    illustration: <RoleBindings />,
  },
  {
    key: 'token-overrides',
    layers: ['shadcn'],
    title: 'Role overrides',
    description:
      'Pin a role to an exact color — a hex, a picker, a Tailwind swatch, or a snapshot of a generated color. The role stops updating: change the seed and it stays put. An override beats its binding, and clears with a per-row reset.',
    anchorKey: 'token-overrides',
    side: 'bottom',
    learnMore: 'bindings-overrides',
    popoverTitle: 'Pin an exact color',
    illustration: <RoleOverride />,
  },
  {
    key: 'export',
    layers: ['md', 'shadcn'],
    title: 'Export',
    description: (
      <>
        What you see is what you get — core tokens always export, and switches add the tonal
        palette, charts, or contrast variants. Keyboard shortcut: <Kbd>D</Kbd>
      </>
    ),

    anchorKey: 'export',
    side: 'bottom',
    popoverTitle: 'Copy or export your theme',
    illustration: <Export />,
  },
]

// why: pure so the layer rule is unit-testable without the live registry.
export function filterSteps(steps: GuideStep[], layer: Layer): GuideStep[] {
  return steps.filter((step) => step.layers.includes(layer))
}

export function getSteps(layer: Layer): GuideStep[] {
  return filterSteps(TOUR_STEPS, layer)
}
