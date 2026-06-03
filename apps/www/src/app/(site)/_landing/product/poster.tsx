import { ArrowUpRight, Asterisk, Droplet, FlaskConical, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from 'tailwind-variants'

// Static poster bento, lifted from _landing/bella-poster.tsx (the `poster`
// layout only). The original owns a 3-way layout knob and motion `layout`
// morphing; here we only ever show the poster, so the knob, the editorial/stack
// placements, and the FLIP animation are dropped — same eight brand cards, fixed
// grid placement. MediaSlots stand in for real art to drop in later.

// Single source of brand copy so every card pulls from one place.
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
function IconChip({ children, className }: { children: ReactNode; className?: string }) {
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
// One definition per card. `tone` picks the role pair; `inner` is flex tuning
// for the card's own contents; `place` is its grid placement (md+ only — the
// poster collapses to a single full-width stack on mobile).

type CardDef = {
  id: string
  tone: 'dark' | 'bright'
  inner?: string
  place: string
  render: () => ReactNode
}

const CARDS: CardDef[] = [
  {
    id: 'wordmark',
    tone: 'dark',
    inner: 'justify-between gap-4',
    place: 'md:col-start-1 md:col-span-4 md:row-start-1 md:row-span-2',
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
    place: 'md:col-start-5 md:col-span-2 md:row-start-1 md:row-span-2',
    render: () => <MediaSlot className="size-full min-h-24" label="portrait" />,
  },
  {
    id: 'pct',
    tone: 'dark',
    inner: 'justify-between gap-4',
    place: 'md:col-start-1 md:col-span-3 md:row-start-3 md:row-span-2',
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
    place: 'md:col-start-4 md:col-span-3 md:row-start-3 md:row-span-3',
    render: () => <MediaSlot className="size-full min-h-28" label="product" />,
  },
  {
    id: 'variants',
    tone: 'bright',
    inner: 'justify-between gap-3',
    place: 'md:col-start-1 md:col-span-2 md:row-start-5',
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
    place: 'md:col-start-3 md:col-span-1 md:row-start-5',
    render: () => <Asterisk className="size-10 sm:size-12" strokeWidth={1.5} />,
  },
  {
    id: 'ingredients',
    tone: 'bright',
    inner: 'flex-row items-center gap-3',
    place: 'md:col-start-1 md:col-span-3 md:row-start-6',
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
    place: 'md:col-start-4 md:col-span-3 md:row-start-6',
    render: () => (
      <>
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium">{BRAND.socialLabel}</span>
          <IconChip className="bg-primary text-on-primary">
            <ArrowUpRight className="size-3.5" />
          </IconChip>
        </div>
        <span className="text-3xl font-medium tracking-tight sm:text-4xl">{BRAND.social}</span>
      </>
    ),
  },
]

export function ProductPoster() {
  return (
    <div className="grid w-full max-w-3xl grid-cols-2 gap-2.5 md:grid-cols-6 md:grid-rows-[repeat(6,minmax(3.25rem,1fr))]">
      {CARDS.map((card) => (
        <div
          key={card.id}
          style={{ borderRadius: 16 }}
          className={cx(
            'relative col-span-2 flex flex-col overflow-hidden p-3 sm:p-4',
            card.tone === 'dark'
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-secondary text-on-secondary',
            card.inner,
            card.place,
          )}
        >
          {card.render()}
        </div>
      ))}
    </div>
  )
}
