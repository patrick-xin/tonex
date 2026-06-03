'use client'

import {
  ArrowLeft,
  BatteryMedium,
  CalendarDays,
  Droplets,
  Leaf,
  Lightbulb,
  type LucideIcon,
  Recycle,
  Signal,
  Sparkles,
  Sprout,
  Sun,
  User,
  Wifi,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { cn, cx } from 'tailwind-variants'
import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type PlantView = 'today' | 'detail'

const TIP = 'During the winter your plants slow down and need less water.'

type Task = { id: string; action: 'Water' | 'Feed'; plant: string }
type Room = { id: string; name: string; art: LucideIcon; tasks: Task[] }

const ROOMS: Room[] = [
  {
    id: 'living',
    name: 'Living Room',
    art: Leaf,
    tasks: [
      { id: 'lr-1', action: 'Water', plant: 'hoya australis' },
      { id: 'lr-2', action: 'Feed', plant: 'monstera siltepecana' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    art: Sprout,
    tasks: [
      { id: 'k-1', action: 'Water', plant: 'pilea peperomioides' },
      { id: 'k-2', action: 'Water', plant: 'hoya australis' },
    ],
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    art: Leaf,
    tasks: [
      { id: 'b-1', action: 'Feed', plant: 'monstera siltepecana' },
      { id: 'b-2', action: 'Water', plant: 'philodendron brandi' },
    ],
  },
]

// The plant page is curated (one specimen) — tapping any task opens it.
const PLANT = { name: 'Monstera Unique' } as const

const FACTS = [
  {
    id: 'popular',
    icon: Sparkles,
    title: 'Most Popular',
    body: 'This is a popular plant in our store',
  },
  { id: 'easy', icon: Leaf, title: 'Easy Care', body: 'This is a popular plant in our store' },
  {
    id: 'faux',
    icon: Recycle,
    title: 'Faux Available',
    body: 'Get the same look without the upkeep',
  },
] as const

const CARE = [
  { id: 'water', icon: Droplets, label: 'Water every Tuesday' },
  { id: 'feed', icon: CalendarDays, label: 'Feed once monthly' },
] as const

const ABOUT = [{ id: 'light', icon: Sun, label: 'Moderate light' }] as const

const VIEW_TRANSITION = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const

// ── primitives ───────────────────────────────────────────────────────────────

// Plant-art placeholder, built from the container tone so it reads as the
// "photo" slot and recolors with the family. A faint leaf glyph stands in for
// the real foliage shot.
function PlantArt({
  className,
  icon: Icon = Leaf,
  label = 'plant',
}: {
  className?: string
  icon?: LucideIcon
  label?: string
}) {
  return (
    <div
      aria-hidden
      className={cx(
        'relative flex items-center justify-center overflow-hidden rounded-2xl bg-primary-container text-on-primary-container',
        className,
      )}
    >
      <Icon className="size-1/3 opacity-40" strokeWidth={1.25} />
      <span className="absolute bottom-2 right-2 text-[0.55rem] uppercase tracking-[0.2em] text-current/40">
        {label}
      </span>
    </div>
  )
}

// Faux phone status bar — sells the "this is an app screen" framing.
function StatusBar() {
  return (
    <div className="flex shrink-0 items-center justify-between px-6 pt-4 pb-1 text-xs font-medium text-on-surface">
      <span className="tabular-nums">5:53</span>
      <div className="flex items-center gap-1.5 text-on-surface">
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryMedium className="size-4" />
      </div>
    </div>
  )
}

// Round icon button built on the production Button (ghost) — gets the shared
// hover/active/focus-ring treatment for free.
function IconButton({
  children,
  label,
  onClick,
  className,
  variant = 'ghost',
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  className?: string
  variant?: 'ghost' | 'secondary'
}) {
  return (
    <Button
      variant={variant}
      size="icon"
      aria-label={label}
      onClick={onClick}
      className={cx('rounded-full text-on-surface-variant', className)}
    >
      {children}
    </Button>
  )
}

// The "⋮" overflow action on the detail page, as a real dropdown menu.
function MoreMenu({ label = 'More options' }: { label?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        render={<Button variant="ghost" size="icon" className="group rounded-full" />}
      >
        <span className="flex flex-col items-center gap-[3px] text-on-surface-variant group-hover:text-on-surface">
          <span className="size-[3px] rounded-full bg-current" />
          <span className="size-[3px] rounded-full bg-current" />
          <span className="size-[3px] rounded-full bg-current" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" matchAnchorWidth={false} className="min-w-44 bg-surface">
        <DropdownMenuItem>Add to my plants</DropdownMenuItem>
        <DropdownMenuItem>Set a reminder</DropdownMenuItem>
        <DropdownMenuItem>Share</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Remove plant</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── today view (daily checklist) ──────────────────────────────────────────────

function TaskRow({ task, onOpen }: { task: Task; onOpen: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox defaultChecked aria-label={`${task.action} ${task.plant}`} />
      {/* Separate button so the checkbox isn't nested inside an interactive row. */}
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold text-on-surface">{task.action}</p>
        <p className="truncate text-xs lowercase font-semibold text-on-surface-variant">
          {task.plant}
        </p>
      </button>
    </div>
  )
}

function RoomCard({ room, onOpen }: { room: Room; onOpen: () => void }) {
  const Art = room.art
  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface-container p-5">
      <h2 className="text-lg font-medium text-primary">{room.name}</h2>
      <div className="mt-3 flex flex-col gap-3.5">
        {room.tasks.map((task) => (
          <TaskRow key={task.id} task={task} onOpen={onOpen} />
        ))}
      </div>
      <Art
        aria-hidden
        strokeWidth={1.25}
        className="pointer-events-none absolute -bottom-3 -right-3 size-28 rotate-12 text-primary/20"
      />
    </div>
  )
}

function TodayView({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-medium tracking-tight text-on-surface">Today</h1>
        <IconButton label="Profile" variant="secondary" className="text-on-secondary-container">
          <User className="size-5" />
        </IconButton>
      </div>

      <div className="flex items-center gap-3 rounded-full bg-secondary-container px-4 py-3 text-on-secondary-container">
        <Lightbulb className="size-5 shrink-0" />
        <p className="text-xs leading-snug">{TIP}</p>
      </div>

      {ROOMS.map((room) => (
        <RoomCard key={room.id} room={room} onOpen={onOpen} />
      ))}
    </div>
  )
}

// ── detail view (single plant) ────────────────────────────────────────────────

function FactCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex w-32 h-32 shrink-0 flex-col gap-2 rounded-2xl bg-tertiary-container text-on-tertiary-container p-3">
      <Icon className="size-4 text-on-tertiary-container shrink-0" />
      <p className="text-xs">{title}</p>
      <p className="text-xs font-semibold">{body}</p>
    </div>
  )
}

function InfoRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className="size-5 shrink-0" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

function DetailView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between px-3 pt-1 pb-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </IconButton>
        <MoreMenu label={`Options for ${PLANT.name}`} />
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-6">
        <h1 className="text-balance text-center text-4xl font-medium leading-tight tracking-tight text-primary">
          {PLANT.name}
        </h1>

        <PlantArt className="aspect-square w-full h-full" label="monstera" />

        {/* Fact chips overflow horizontally, mirroring the reference's peek. */}
        <div className="-mx-5 flex gap-3 overflow-x-auto items-center no-scrollbar px-5 pb-1 h-full">
          {FACTS.map((fact) => (
            <FactCard key={fact.id} icon={fact.icon} title={fact.title} body={fact.body} />
          ))}
        </div>

        <section>
          <h2 className="mb-1 text-xl font-medium text-on-surface">Care</h2>
          {CARE.map((row) => (
            <InfoRow key={row.id} icon={row.icon} label={row.label} />
          ))}
        </section>

        <section>
          <h2 className="mb-1 text-xl font-medium text-on-surface">About</h2>
          {ABOUT.map((row) => (
            <InfoRow key={row.id} icon={row.icon} label={row.label} />
          ))}
        </section>
      </div>
    </div>
  )
}

// The phone frame on its own — standalone (PlantCareSection) or as a fan card.
// Width is the 22rem design size, clamped to the viewport on tiny screens.
export function PlantCareCard({ className }: { className?: string }) {
  const [view, setView] = useState<PlantView>('today')
  const reduce = useReducedMotion() === true

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
        'relative flex h-[44rem] max-h-[88vh] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2.5rem] bg-surface text-on-surface shadow-2xl border border-outline-variant/40 border-t-0',
        className,
      )}
    >
      <ShimmerBorder />
      <StatusBar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} {...motionProps} className="flex min-h-0 flex-1 flex-col">
          {view === 'today' ? (
            <TodayView onOpen={() => setView('detail')} />
          ) : (
            <DetailView onBack={() => setView('today')} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function PlantCareSection() {
  return (
    <section className="flex min-h-dvh w-full items-center justify-center px-4 py-12 sm:px-6">
      <PlantCareCard />
    </section>
  )
}
