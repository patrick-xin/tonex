'use client'

import { ArrowUpRight, Asterisk, Droplet, FlaskConical, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { cx } from 'tailwind-variants'
import { SectionHeader } from '../section-header'

// `BellaSection` owns a 3-way knob; the chosen `BellaLayout` flows down to
// `BellaPosterSection`. The SAME eight content cards are rendered in every
// layout — only each card's grid placement changes per layout. Because the
// React elements persist across the switch, motion's `layout` prop FLIP-
// animates each card from its old box to its new one: the bento morphs in
// place rather than cross-fading. That's the pitch's second half — one palette
// holding together not just across products, but across *layouts*. Photos stay
// labelled `MediaSlot`s for real art to drop in later.
//
// Add a layout: extend `BellaLayout`, add a `CONTAINER[layout]` grid template,
// and add a `place[layout]` entry on each card.

export type BellaLayout = 'poster' | 'editorial' | 'stack'

// Single source of brand copy so every layout pulls from one place.
const BRAND = {
  version: 'Version 1.0 —',
  kind: 'Wordmark',
  wordmark: 'bella',
  pct: '0.8%',
  pctCaption: 'Alcohol on the product used. Rest 99.2 is natural.',
  variantsLabel: 'Total Products Variants',
  variants: '42',
  ingredients: 'Natural Ingredients',
  flavours: '28 Flavours',
  socialLabel: 'User Found Helpful',
  social: '2.4M+',
} as const

// Motion: a smooth tween (not a spring) for the morphing cards — no overshoot,
// so text inside the resizing boxes stays steady. The knob pill gets a gentle
// spring because a small sliding element reads as crisp, not wobbly.
const CARD_TRANSITION = { type: 'tween', duration: 0.5, ease: [0.22, 1, 0.36, 1] } as const
const PILL_TRANSITION = { type: 'spring', stiffness: 380, damping: 32 } as const

// ── primitives ───────────────────────────────────────────────────────────────

// A faint, currentColor-tinted box standing in for a photo. Keying off
// `currentColor` lets it read correctly on both bright and dark cards without
// props, and it recolors with the palette like everything else.
function MediaSlot({ className, label = 'image' }: { className?: string; label?: string }) {
  return (
    <div
      aria-hidden
      className={cx(
        'flex items-center justify-center rounded-xl bg-current/10 ring-1 ring-current/10',
        className,
      )}
    >
      <span className="text-xs uppercase">{label}</span>
    </div>
  )
}

// A small circular icon chip tinted from the current on-color.
function IconChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'flex size-7 items-center justify-center rounded-full bg-current/15',
        className,
      )}
    >
      {children}
    </span>
  )
}

// h2 → Vidaloka serif (voice-headlines scope); italic for the brand feel.
function Wordmark({ className }: { className?: string }) {
  return <h2 className={cx('italic leading-none tracking-tight', className)}>{BRAND.wordmark}</h2>
}

// ── cards ─────────────────────────────────────────────────────────────────────
// One definition per card, shared across all layouts. `tone` picks the role
// pair; `inner` is layout-agnostic flex tuning for the card's own contents;
// `place` is the per-layout grid placement (md+ only — every layout collapses
// to a single full-width stack on mobile). `render` is the (fixed) content, so
// only the box moves between layouts and the text never reflows mid-morph.

type CardDef = {
  id: string
  tone: 'dark' | 'bright'
  inner?: string
  place: Record<BellaLayout, string>
  render: () => React.ReactNode
}

const CARDS: CardDef[] = [
  {
    id: 'wordmark',
    tone: 'dark',
    inner: 'justify-between gap-4',
    place: {
      poster: 'md:col-start-1 md:col-span-4 md:row-start-1 md:row-span-2',
      editorial: 'md:col-span-6 md:row-span-2',
      stack: 'md:col-span-1',
    },
    render: () => (
      <>
        <div className="flex items-start justify-between text-sm uppercase">
          <span>{BRAND.version}</span>
          <span>{BRAND.kind}</span>
        </div>
        <Wordmark className="text-5xl sm:text-6xl" />
      </>
    ),
  },
  {
    id: 'portrait',
    tone: 'dark',
    place: {
      poster: 'md:col-start-5 md:col-span-2 md:row-start-1 md:row-span-2',
      editorial: 'md:col-span-3 md:row-span-2',
      stack: 'md:col-span-1',
    },
    render: () => <MediaSlot className="size-full min-h-24" label="portrait" />,
  },
  {
    id: 'pct',
    tone: 'dark',
    inner: 'justify-between gap-4',
    place: {
      poster: 'md:col-start-1 md:col-span-3 md:row-start-3 md:row-span-2',
      editorial: 'md:col-span-3 md:row-span-1',
      stack: 'md:col-span-1',
    },
    render: () => (
      <>
        <div className="flex items-start justify-between">
          <span className="text-3xl font-medium leading-none tracking-tight text-current/60 sm:text-4xl">
            {BRAND.pct}
          </span>
          <div className="flex gap-1.5">
            <IconChip>
              <Sparkles className="size-3.5" />
            </IconChip>
            <IconChip>
              <Droplet className="size-3.5" />
            </IconChip>
          </div>
        </div>
        <p className="max-w-xs text-pretty text-xs">{BRAND.pctCaption}</p>
      </>
    ),
  },
  {
    id: 'product',
    tone: 'bright',
    place: {
      poster: 'md:col-start-4 md:col-span-3 md:row-start-3 md:row-span-3',
      editorial: 'md:col-span-3 md:row-span-3',
      stack: 'md:col-span-1',
    },
    render: () => <MediaSlot className="size-full min-h-28" label="product" />,
  },
  {
    id: 'variants',
    tone: 'bright',
    inner: 'justify-between gap-3',
    place: {
      poster: 'md:col-start-1 md:col-span-2 md:row-start-5',
      editorial: 'md:col-span-2 md:row-span-1',
      stack: 'md:col-span-1',
    },
    render: () => (
      <>
        <p className="text-xs font-medium leading-tight">{BRAND.variantsLabel}</p>
        <span className="text-3xl font-medium tracking-tight sm:text-4xl">{BRAND.variants}</span>
      </>
    ),
  },
  {
    id: 'asterisk',
    tone: 'bright',
    inner: 'items-center justify-center',
    place: {
      poster: 'md:col-start-3 md:col-span-1 md:row-start-5',
      editorial: 'md:col-span-1 md:row-span-1',
      stack: 'md:col-span-1',
    },
    render: () => <Asterisk className="size-10 sm:size-12" strokeWidth={1.5} />,
  },
  {
    id: 'ingredients',
    tone: 'bright',
    inner: 'flex-row items-center gap-3',
    place: {
      poster: 'md:col-start-1 md:col-span-3 md:row-start-6',
      editorial: 'md:col-span-3 md:row-span-1',
      stack: 'md:col-span-1',
    },
    render: () => (
      <>
        <IconChip className="size-9 shrink-0">
          <FlaskConical className="size-4" />
        </IconChip>
        <div>
          <p className="text-sm font-medium leading-tight">{BRAND.ingredients}</p>
          <p className="text-xs text-on-secondary">{BRAND.flavours}</p>
        </div>
      </>
    ),
  },
  {
    id: 'social',
    tone: 'dark',
    inner: 'justify-between gap-4',
    place: {
      poster: 'md:col-start-4 md:col-span-3 md:row-start-6',
      editorial: 'md:col-span-3 md:row-span-1',
      stack: 'md:col-span-1',
    },
    render: () => (
      <>
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium">{BRAND.socialLabel}</span>
          <IconChip className="bg-primary text-on-primary">
            <ArrowUpRight className="size-3.5" />
          </IconChip>
        </div>
        <span className="text-3xl font-medium tracking-tight0.8 sm:text-4xl">{BRAND.social}</span>
      </>
    ),
  },
]

const CONTAINER: Record<BellaLayout, string> = {
  poster: 'max-w-3xl grid-cols-2 md:grid-cols-6 md:grid-rows-[repeat(6,minmax(3.25rem,1fr))]',
  editorial:
    'max-w-3xl grid-cols-2 md:grid-flow-dense md:grid-cols-6 md:auto-rows-[minmax(3.25rem,auto)]',
  stack: 'max-w-md grid-cols-2 md:grid-cols-1 md:auto-rows-[minmax(3.5rem,auto)]',
}

function BellaPosterSection({ layout = 'poster' }: { layout?: BellaLayout }) {
  const reduce = useReducedMotion() === true
  const transition = reduce ? { duration: 0 } : CARD_TRANSITION

  return (
    <motion.div
      layout={!reduce}
      transition={transition}
      className={cx('grid w-full gap-2.5', CONTAINER[layout])}
    >
      {CARDS.map((card) => (
        <motion.div
          key={card.id}
          layout={!reduce}
          transition={transition}
          style={{ borderRadius: 16 }}
          className={cx(
            'relative col-span-2 flex flex-col overflow-hidden p-3 sm:p-4',
            card.tone === 'dark'
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-secondary text-on-secondary',
            card.inner,
            card.place[layout],
          )}
        >
          {card.render()}
        </motion.div>
      ))}
    </motion.div>
  )
}

const LAYOUT_OPTIONS: { value: BellaLayout; label: string }[] = [
  { value: 'poster', label: 'Poster' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'stack', label: 'Stack' },
]

function BellaKnob({
  value,
  onChange,
}: {
  value: BellaLayout
  onChange: (next: BellaLayout) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-surface-container p-1 ring-1 ring-outline-variant/60">
      {LAYOUT_OPTIONS.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cx(
              'relative rounded-full px-4 py-1.5 text-xs uppercase transition-colors',
              active ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {active && (
              <motion.span
                layoutId="bella-knob-pill"
                aria-hidden
                transition={PILL_TRANSITION}
                className="absolute inset-0 rounded-full bg-primary"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function BellaSection() {
  const [layout, setLayout] = useState<BellaLayout>('poster')
  return (
    <section className="flex min-h-dvh w-full flex-col items-center bg-surface px-6 py-12">
      <SectionHeader
        heading="Keep your brand color consistent on every surface."
        description="Send the same theme to your marketing site, dashboard, mobile app, and docs. It all derives from one seed, so the identity stays consistent everywhere."
      />
      <BellaKnob value={layout} onChange={setLayout} />
      <div className="flex w-full flex-1 items-center justify-center">
        <BellaPosterSection layout={layout} />
      </div>
    </section>
  )
}
