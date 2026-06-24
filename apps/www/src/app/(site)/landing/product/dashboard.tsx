'use client'

import {
  ArrowLeft,
  BatteryMedium,
  Bell,
  CalendarDays,
  ChartColumn,
  ChevronRight,
  Footprints,
  Headphones,
  Home,
  type LucideIcon,
  Package,
  Settings,
  Signal,
  SlidersHorizontal,
  User,
  Wifi,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { cn, cx } from 'tailwind-variants'
import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { Button } from '@/components/ui/button'

type DashboardView = 'dashboard' | 'analytics'

const USER = { name: 'Millie Tran' } as const

const STATS = [
  { id: 'orders', label: 'Total orders', value: '1015', delta: '+3%', tone: 'primary' },
  { id: 'revenue', label: 'Total revenue', value: '$14,012', delta: '+6%', tone: 'inverse' },
] as const

const CATEGORIES = [
  { id: 'electronic', label: 'Electronic', pct: 45, color: 'bg-chart-1' },
  { id: 'fashion', label: 'Fashion', pct: 33, color: 'bg-chart-5' },
  { id: 'beauty', label: 'Beauty', pct: 22, color: 'bg-chart-3' },
] as const

const ACTIVITY = [
  { id: 'antony', name: 'Antony Cardenas', product: 'New Balance 740' },
  { id: 'helena', name: 'Helena Mcneil', product: 'Converse Chuck Taylor' },
  { id: 'josh', name: 'Josh Wiggins', product: 'Salomon Shoes XA' },
] as const

const SERIES = [
  { day: 'Mon', sold: 30, ret: 14 },
  { day: 'Tue', sold: 54, ret: 18 },
  { day: 'Wed', sold: 62, ret: 20 },
  { day: 'Thu', sold: 57, ret: 15 },
  { day: 'Fri', sold: 47, ret: 17 },
  { day: 'Sat', sold: 37, ret: 12 },
  { day: 'Sun', sold: 78, ret: 22 },
] as const

const Y_TICKS = [100, 75, 50, 25, 0] as const

const SALES = [
  {
    id: 'airpods',
    name: 'Airpods 3',
    price: '$150',
    earned: '$6,450',
    units: 43,
    icon: Headphones,
  },
  {
    id: 'nb740',
    name: 'New Balance 740',
    price: '$90',
    earned: '$5,040',
    units: 56,
    icon: Footprints,
  },
  {
    id: 'salomon',
    name: 'Salomon Shoes XA',
    price: '$100',
    earned: '$3,900',
    units: 39,
    icon: Footprints,
  },
] as const

const NAV = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'analytics', label: 'Analytics', icon: ChartColumn },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

type NavId = (typeof NAV)[number]['id']

const VIEW_TRANSITION = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const

function Avatar({ className, label = 'avatar' }: { className?: string; label?: string }) {
  return (
    <span
      aria-hidden
      title={label}
      className={cx(
        'flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant',
        className,
      )}
    >
      <User className="size-1/2" strokeWidth={1.75} />
    </span>
  )
}
function StatusBar() {
  return (
    <div className="flex shrink-0 items-center justify-between px-6 pt-4 pb-1 text-xs font-medium text-on-surface">
      <span className="tabular-nums">9:41</span>
      <div className="flex items-center gap-1.5 text-on-surface">
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryMedium className="size-4" />
      </div>
    </div>
  )
}

function IconButton({
  children,
  label,
  onClick,
  className,
  variant = 'ghost',
  size = 'icon',
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  className?: string
  variant?: 'ghost' | 'secondary'
  size?: 'icon' | 'icon-sm'
}) {
  return (
    <Button
      variant={variant}
      size={size}
      aria-label={label}
      onClick={onClick}
      className={cx('rounded-full text-on-surface-variant', className)}
    >
      {children}
    </Button>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
      <span className={cx('size-2 rounded-full', color)} />
      {label}
    </span>
  )
}

function BottomNav({
  active,
  onNavigate,
}: {
  active: 'home' | 'analytics'
  onNavigate: (id: NavId) => void
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

function StatPanel({
  label,
  value,
  delta,
  className,
}: {
  label: string
  value: string
  delta: string
  className?: string
}) {
  return (
    <div className={cx('flex flex-col gap-4 p-4', className)}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        <span className="rounded-full bg-surface/90 px-1.5 py-0.5 text-[0.6rem] font-semibold text-on-surface">
          {delta}
        </span>
      </div>
    </div>
  )
}

function ActivityRow({ name, product }: { name: string; product: string }) {
  return (
    <button type="button" className="flex w-full items-center gap-3 py-2 text-left">
      <Avatar className="size-9 shrink-0" label={name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-on-surface">{name}</p>
        <p className="truncate text-xs text-on-surface-variant">
          Purchased <span className="text-primary">{product}</span>
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-on-surface-variant" />
    </button>
  )
}

function DashboardView({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-1 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-11" label={USER.name} />
            <div className="leading-tight">
              <p className="text-xs text-on-surface-variant">Welcome,</p>
              <p className="text-sm font-semibold text-on-surface">{USER.name}</p>
            </div>
          </div>
          <IconButton
            label="Notifications"
            variant="secondary"
            className="text-on-secondary-container"
          >
            <Bell className="size-5" />
          </IconButton>
        </div>

        <div className="flex items-end justify-between">
          <h1 className="text-3xl font-medium tracking-tight text-on-surface">Dashboard</h1>
          <button type="button" className="text-xs font-medium text-primary">
            View all
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-outline-variant/40">
          <div className="grid grid-cols-2">
            {STATS.map((stat) => (
              <StatPanel
                key={stat.id}
                label={stat.label}
                value={stat.value}
                delta={stat.delta}
                className={
                  stat.tone === 'primary'
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-secondary text-on-secondary'
                }
              />
            ))}
          </div>
          <div className="flex flex-col gap-3 p-4">
            <p className="text-sm font-medium text-on-surface">Top selling products</p>
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              {CATEGORIES.map((c) => (
                <span key={c.id} className={c.color} style={{ width: `${c.pct}%` }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {CATEGORIES.map((c) => (
                <Legend key={c.id} color={c.color} label={c.label} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-on-surface">Last activity</h2>
          <button type="button" className="text-xs font-medium text-primary">
            View all
          </button>
        </div>
        <div className="flex flex-col divide-y divide-outline-variant/30">
          {ACTIVITY.map((a) => (
            <ActivityRow key={a.id} name={a.name} product={a.product} />
          ))}
        </div>
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />
    </>
  )
}

function Chart() {
  return (
    <div className="flex gap-2">
      <div className="flex h-40 flex-col justify-between py-0.5 text-[0.6rem] tabular-nums text-on-surface-variant">
        {Y_TICKS.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex h-40 items-end justify-between gap-1.5">
          {SERIES.map((d) => (
            <div key={d.day} className="flex h-full flex-1 flex-col justify-end gap-0.5">
              <span className="rounded-t-sm bg-chart-1" style={{ height: `${d.sold}%` }} />
              <span className="rounded-b-sm bg-chart-2" style={{ height: `${d.ret}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[0.6rem] text-on-surface-variant">
          {SERIES.map((d) => (
            <span key={d.day} className="flex-1 text-center">
              {d.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function SaleRow({
  name,
  price,
  earned,
  units,
  icon: Icon,
}: {
  name: string
  price: string
  earned: string
  units: number
  icon: LucideIcon
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant"
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-on-surface">{name}</p>
        <p className="text-xs text-on-surface-variant">{price}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-on-surface">{earned} earned</p>
        <p className="text-xs text-on-surface-variant">{units} units sold</p>
      </div>
    </div>
  )
}

function AnalyticsView({
  onBack,
  onNavigate,
}: {
  onBack: () => void
  onNavigate: (id: NavId) => void
}) {
  return (
    <>
      <header className="flex shrink-0 items-center justify-between px-3 pt-1 pb-2">
        <IconButton label="Back" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </IconButton>
        <span className="text-sm font-medium text-on-surface">Analytics</span>
        <IconButton label="Pick date" variant="secondary" className="text-on-secondary-container">
          <CalendarDays className="size-5" />
        </IconButton>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-medium tracking-tight text-on-surface">Product selling</h1>
          <div className="flex gap-4">
            <Legend color="bg-chart-1" label="Sold" />
            <Legend color="bg-chart-2" label="Return" />
          </div>
        </div>

        <Chart />

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-on-surface">Recent sales</h2>
          <IconButton label="Filter sales" size="icon-sm">
            <SlidersHorizontal className="size-4" />
          </IconButton>
        </div>
        <div className="flex flex-col divide-y divide-outline-variant/30">
          {SALES.map((s) => (
            <SaleRow
              key={s.id}
              name={s.name}
              price={s.price}
              earned={s.earned}
              units={s.units}
              icon={s.icon}
            />
          ))}
        </div>
      </div>
      <BottomNav active="analytics" onNavigate={onNavigate} />
    </>
  )
}

export function DashboardCard({ className }: { className?: string }) {
  const [view, setView] = useState<DashboardView>('dashboard')
  const reduce = useReducedMotion() === true

  const onNavigate = (id: NavId) => {
    if (id === 'analytics') setView('analytics')
    else if (id === 'home') setView('dashboard')
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
        'relative flex h-180 max-h-[88vh] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2.5rem] shadow-2xl border border-outline-variant/40 border-t-0 bg-surface',
        className,
      )}
    >
      <ShimmerBorder />
      <StatusBar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} {...motionProps} className="flex min-h-0 flex-1 flex-col">
          {view === 'dashboard' ? (
            <DashboardView onNavigate={onNavigate} />
          ) : (
            <AnalyticsView onBack={() => setView('dashboard')} onNavigate={onNavigate} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
