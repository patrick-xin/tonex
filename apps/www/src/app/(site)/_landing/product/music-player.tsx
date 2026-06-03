'use client'

import { HeartIcon } from '@phosphor-icons/react'
import {
  ArrowDownToLine,
  AudioLines,
  BatteryMedium,
  ChevronDown,
  ChevronLeft,
  Flame,
  Home,
  Library as LibraryIcon,
  ListMusic,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Repeat,
  Search,
  Shuffle,
  Signal,
  SkipBack,
  SkipForward,
  Wifi,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { cn, cx } from 'tailwind-variants'
import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Toggle } from '@/components/ui/toggle'

type MusicView = 'player' | 'library'

const NOW = { title: 'Unsayable', artist: 'Brambles', elapsed: '1:04', duration: '2:52' } as const
const ALBUM = {
  title: 'Charcoal',
  artist: 'Brambles',
  meta: 'Album · 8 songs · 2026',
} as const

type Track = { n: string; title: string; artist: string; len: string; playing?: boolean }

const TRACKS: Track[] = [
  { n: '01', title: 'To Speak Of Solitude', artist: 'Brambles', len: '4:21' },
  { n: '02', title: 'Unsayable', artist: 'Brambles', len: '2:52', playing: true },
  { n: '03', title: 'In The Androgynous Dark', artist: 'Brambles', len: '4:43' },
  { n: '04', title: 'Salt Photographs', artist: 'Brambles', len: '6:54' },
  { n: '05', title: 'Pink And Golden Billows', artist: 'Brambles', len: '2:58' },
]

// Deterministic bar heights (Math.sin, not Math.random) so SSR and client agree
// — no hydration mismatch. The first PROGRESS fraction reads as "played". Each
// bar carries a stable id so the render isn't keyed by array index.
const BAR_COUNT = 44
const PROGRESS = 0.38
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => ({
  id: i,
  height: 26 + Math.round((Math.abs(Math.sin(i * 0.9) + Math.sin(i * 0.35)) / 2) * 74),
  played: i / BAR_COUNT < PROGRESS,
}))

const ALBUM_ACTIONS = [
  { label: 'Add', icon: Plus },
  { label: 'Download', icon: ArrowDownToLine },
] as const

const VIEW_TRANSITION = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const

// ── primitives ───────────────────────────────────────────────────────────────

// Dark cover-art placeholder, built from the container tone so it reads as the
// "photo" slot and recolors with the family.
function AlbumArt({ className, label = 'cover' }: { className?: string; label?: string }) {
  return (
    <div
      aria-hidden
      className={cx(
        'flex items-center justify-center overflow-hidden rounded-2xl bg-secondary-container text-on-secondary-container',
        className,
      )}
    >
      <span className="text-xs uppercase">{label}</span>
    </div>
  )
}

// Faux phone status bar — sells the "this is an app screen" framing.
function StatusBar() {
  return (
    <div className="flex shrink-0 items-center justify-between px-6 pt-4 pb-1 text-xs font-medium text-on-surface">
      <span className="tabular-nums">8:00</span>
      <div className="flex items-center gap-1.5 text-on-surface">
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryMedium className="size-4" />
      </div>
    </div>
  )
}

function TopBar({
  left,
  title,
  right,
}: {
  left: React.ReactNode
  title?: string
  right: React.ReactNode
}) {
  return (
    <header className="flex shrink-0 items-center justify-between px-5 pt-1 pb-3">
      <div className="flex w-8 justify-start">{left}</div>
      {title ? (
        <span className="text-sm font-medium text-on-surface">{title}</span>
      ) : (
        <span aria-hidden />
      )}
      <div className="flex w-8 justify-end">{right}</div>
    </header>
  )
}

// Round icon button built on the production Button (ghost) — gets the shared
// hover/active/focus-ring treatment for free. Neutral on-surface-variant tint
// by default; pass a text-* class to override per call.
function IconButton({
  children,
  label,
  onClick,
  className,
  size = 'icon',
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  className?: string
  size?: 'icon' | 'icon-sm' | 'icon-lg'
}) {
  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={label}
      onClick={onClick}
      className={cx('rounded-full text-on-surface-variant', className)}
    >
      {children}
    </Button>
  )
}

// The "…" overflow action, as a real dropdown menu (production component).
// Menu items are inert in the mock. Trigger styling is passed in so it can be a
// bare header affordance, a row button, or a filled chip.
function MoreMenu({
  label = 'More options',
  iconClassName,
}: {
  label?: string
  iconClassName?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        render={<Button variant="ghost" className="rounded-full group" size="icon-sm" />}
      >
        <MoreHorizontal
          className={cx(
            'size-4 text-on-surface-variant group-hover:text-on-surface',
            iconClassName,
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" matchAnchorWidth={false} className="min-w-44 bg-surface">
        <DropdownMenuItem>Add to playlist</DropdownMenuItem>
        <DropdownMenuItem>Go to album</DropdownMenuItem>
        <DropdownMenuItem>Share</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Hide from library</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const NAV = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Library', icon: LibraryIcon },
  { id: 'hotlist', label: 'Hotlist', icon: Flame },
] as const

function BottomNav({
  active,
  onNavigate,
}: {
  active: 'home' | 'library'
  onNavigate: (id: (typeof NAV)[number]['id']) => void
}) {
  return (
    <nav className="flex shrink-0 items-center justify-around border-t border-outline-variant/40 px-2 pt-3 pb-5">
      {NAV.map((item) => {
        const on = item.id === active
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={on ? 'page' : undefined}
            className={cx(
              'flex flex-col items-center gap-1 text-[0.6rem] font-medium transition-colors',
              on ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            <Icon className="size-5" strokeWidth={on ? 2.4 : 2} />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}

// ── player view (Now Playing) ─────────────────────────────────────────────────

function PlayerView({ onNavigate }: { onNavigate: (id: (typeof NAV)[number]['id']) => void }) {
  const [playing, setPlaying] = useState(true)
  return (
    <>
      <TopBar
        left={
          <IconButton label="Collapse player">
            <ChevronDown className="size-5" />
          </IconButton>
        }
        title="Now Playing"
        right={
          <IconButton label="Queue">
            <ListMusic className="size-5" />
          </IconButton>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-7 px-6 pb-4">
        <AlbumArt className="mx-auto aspect-square w-full max-w-[13rem]" label="cover art" />

        <div className="flex items-center gap-3">
          <Toggle
            size="xs"
            aria-label="Like"
            variant="ghost"
            className="data-pressed:hover:bg-surface-container-high hover:bg-surface-container-high"
          >
            <HeartIcon
              weight="fill"
              className="text-outline-variant group-data-pressed:text-red-500"
            />
          </Toggle>
          <div className="min-w-0 flex-1 text-center">
            <h3 className="truncate text-2xl font-semibold tracking-tight text-on-surface">
              {NOW.title}
            </h3>
            <p className="truncate text-sm text-on-surface-variant">{NOW.artist}</p>
          </div>
          <MoreMenu label="Now playing options" iconClassName="size-5" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex h-12 items-center gap-[2px]">
            {BARS.map((bar) => (
              <span
                key={bar.id}
                className={cx(
                  'w-[2px] shrink-0 rounded-full',
                  bar.played ? 'bg-primary' : 'bg-on-surface-variant',
                )}
                style={{ height: `${bar.height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[0.65rem] tabular-nums text-on-surface-variant">
            <span>{NOW.elapsed}</span>
            <span>{NOW.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <IconButton label="Shuffle">
            <Shuffle className="size-5" />
          </IconButton>
          <IconButton label="Previous" className="size-12">
            <SkipBack className="size-7 fill-current" />
          </IconButton>
          <Button
            variant="brand"
            size="icon-lg"
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={() => setPlaying((p) => !p)}
            className="size-16 rounded-full"
          >
            {playing ? (
              <Pause className="size-6 fill-current" />
            ) : (
              <Play className="ml-0.5 size-6 fill-current" />
            )}
          </Button>
          <IconButton label="Previous" className="size-12">
            <SkipForward className="size-7 fill-current" />
          </IconButton>
          <IconButton label="Repeat">
            <Repeat className="size-5" />
          </IconButton>
        </div>
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />
    </>
  )
}

// ── library view (album track list) ───────────────────────────────────────────

function TrackRow({ track }: { track: Track }) {
  return (
    <div className="flex w-full items-center gap-3 py-2 px-1 text-left hover:bg-primary/10">
      <span className="flex w-6 shrink-0 justify-center text-xs text-on-surface-variant">
        {track.playing ? <AudioLines className="size-4 text-primary" /> : track.n}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cx(
            'truncate text-sm font-medium',
            track.playing ? 'text-primary' : 'text-on-surface',
          )}
        >
          {track.title}
        </p>
        <p className="truncate text-xs text-on-surface-variant">
          {track.artist} · {track.len}
        </p>
      </div>
      <MoreMenu label={`Options for ${track.title}`} />
    </div>
  )
}

function MiniPlayer() {
  return (
    <div className="mx-3 mb-2 flex items-center gap-3 rounded-2xl bg-primary px-3 py-2 text-on-primary">
      <span aria-hidden className="size-9 shrink-0 rounded-lg bg-current/20" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{NOW.title}</p>
        <p className="truncate text-xs text-on-primary/70">{NOW.artist}</p>
      </div>
      <Toggle
        size="xs"
        aria-label="Like"
        variant="ghost"
        className="data-pressed:bg-primary hover:bg-on-primary-container/10 data-pressed:hover:bg-on-primary-container/10"
      >
        <HeartIcon
          weight="fill"
          className="text-on-primary-container group-data-pressed:text-error-container"
        />
      </Toggle>
      <button
        type="button"
        aria-label="Pause"
        className="flex size-9 items-center justify-center rounded-full bg-surface text-on-surface"
      >
        <Pause className="size-4 fill-current" />
      </button>
    </div>
  )
}

function LibraryView({
  onBack,
  onNavigate,
}: {
  onBack: () => void
  onNavigate: (id: (typeof NAV)[number]['id']) => void
}) {
  return (
    <>
      <TopBar
        left={
          <IconButton label="Back" onClick={onBack}>
            <ChevronLeft className="size-5" />
          </IconButton>
        }
        right={
          <IconButton label="Search">
            <Search className="size-5" />
          </IconButton>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-2">
        <div className="flex gap-4">
          <AlbumArt className="size-24 shrink-0" label="cover" />
          <div className="flex min-w-0 flex-col justify-center gap-0.5">
            <p className="text-xs text-on-surface-variant">{ALBUM.meta}</p>
            <h3 className="truncate text-2xl font-semibold tracking-tight text-on-surface">
              {ALBUM.title}
            </h3>
            <p className="text-sm text-primary">{ALBUM.artist}</p>
            <div className="mt-1.5 flex gap-2">
              {ALBUM_ACTIONS.map(({ label, icon: Icon }) => (
                <Button
                  key={label}
                  aria-hidden
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full group"
                >
                  <Icon className="size-4 text-on-surface-variant group-hover:text-on-surface" />
                </Button>
              ))}
              <MoreMenu label="Album options" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="brand" size="lg" className="flex-1 rounded-full">
            <Play className="size-4 fill-current" />
            Play
          </Button>
          <Button variant="outline" size="lg" className="flex-1 rounded-full">
            <Shuffle className="size-4" />
            Shuffle
          </Button>
        </div>

        <div className="flex flex-col divide-y divide-outline-variant/30">
          {TRACKS.map((track) => (
            <TrackRow key={track.n} track={track} />
          ))}
        </div>
      </div>

      <MiniPlayer />
      <BottomNav active="library" onNavigate={onNavigate} />
    </>
  )
}

// The phone frame on its own — standalone (MusicPlayerSection) or as a fan card.
// Width is the 22rem design size, clamped to the viewport on tiny screens.
export function MusicPlayerCard({ className }: { className?: string }) {
  const [view, setView] = useState<MusicView>('player')
  const reduce = useReducedMotion() === true

  // Home / library are real destinations; search + hotlist are inert in the mock.
  const onNavigate = (id: (typeof NAV)[number]['id']) => {
    if (id === 'library') setView('library')
    else if (id === 'home') setView('player')
  }

  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, x: 16 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -16 },
        transition: VIEW_TRANSITION,
      }

  return (
    <div
      className={cn(
        'relative flex h-[44rem] max-h-[88vh] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2.5rem] shadow-2xl border border-outline-variant/40 border-t-0 bg-surface',
        className,
      )}
    >
      <ShimmerBorder />
      <StatusBar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} {...motionProps} className="flex min-h-0 flex-1 flex-col">
          {view === 'player' ? (
            <PlayerView onNavigate={onNavigate} />
          ) : (
            <LibraryView onBack={() => setView('player')} onNavigate={onNavigate} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function MusicPlayerSection() {
  return (
    <section className="flex min-h-dvh w-full items-center justify-center px-4 py-12 sm:px-6">
      <MusicPlayerCard />
    </section>
  )
}
