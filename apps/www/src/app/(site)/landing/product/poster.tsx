import { ArrowUpRight, Bookmark, Check, ChevronsUp, Heart, Mail, MessageCircle } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cx } from 'tailwind-variants'
import {
  createTooltipHandle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const FORMATS = ['Billboard', 'Instagram', 'Story', 'Email', 'Banner'] as const
const COUNTDOWN = ['02', '14', '36'] as const

type PosterTooltipHandle = ReturnType<typeof createTooltipHandle<string>>

function PosterCard({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cx('relative overflow-hidden rounded-3xl p-4 sm:p-5', className)} {...props}>
      {children}
    </div>
  )
}

function RolePill({ children, className, ...props }: ComponentProps<'span'>) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cx(
              className,
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-tertiary-container text-on-tertiary-container shadow-md',
            )}
            {...props}
          >
            {children}
          </span>
        }
      />
      <TooltipContent variant="inverse">
        <span className="font-mono">bg-tertiary-container text-on-tertiary-container</span>
      </TooltipContent>
    </Tooltip>
  )
}

function IconChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx('flex size-9 items-center justify-center rounded-full', className)}>
      {children}
    </span>
  )
}

function Billboard({ handle }: { handle: PosterTooltipHandle }) {
  return (
    <PosterCard className="bg-primary-container text-on-primary-container md:col-span-8 relative">
      <TooltipTrigger
        handle={handle}
        payload="bg-primary-container"
        render={<div className="absolute top-4 right-4 size-32" />}
      />
      <div className="flex min-h-80 flex-col justify-between gap-10 ">
        <div className="flex items-start justify-between gap-6">
          <RolePill>Billboard</RolePill>
        </div>
        <div>
          <TooltipTrigger
            handle={handle}
            payload="text-on-primary-container"
            render={
              <p className="text-xs font-medium uppercase tracking-[0.25em] w-fit">
                Summer citrus drop
              </p>
            }
          />
          <TooltipTrigger
            handle={handle}
            payload="text-on-primary-container"
            render={
              <p className="mt-3 font-display max-w-md text-pretty text-5xl md:text-7xl font-semibold leading-[0.95] tracking-tight sm:text-6xl w-fit">
                Drink in the daylight.
              </p>
            }
          />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <RolePill>Yuzu × Sea Salt</RolePill>
            <RolePill>Sparkling</RolePill>
            <RolePill>12-pack · $32</RolePill>
          </div>
        </div>
      </div>
    </PosterCard>
  )
}

function InstagramPost({ handle }: { handle: PosterTooltipHandle }) {
  return (
    <PosterCard className="bg-surface-container-high text-on-surface md:col-span-4 relative">
      <TooltipTrigger
        handle={handle}
        payload="bg-surface-container-high"
        render={<div className="absolute bottom-0 right-0 h-10 w-20" />}
      />
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipTrigger
              handle={handle}
              payload="from-primary via-secondary to-tertiary"
              render={
                <span className="size-8 rounded-full bg-linear-to-br from-primary via-secondary to-tertiary" />
              }
            />
            <div className="leading-tight">
              <TooltipTrigger
                handle={handle}
                payload="text-on-surface"
                render={<p className="w-fit text-xs font-semibold">sola.drinks</p>}
              />
              <TooltipTrigger
                handle={handle}
                payload="text-on-surface-variant"
                render={<p className="w-fit text-xs text-on-surface-variant">Sponsored</p>}
              />
            </div>
          </div>
          <RolePill>Instagram</RolePill>
        </div>
        <div className="relative flex aspect-square items-end overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-tertiary to-secondary/90 p-3 text-on-primary">
          <TooltipTrigger
            handle={handle}
            payload="from-primary via-tertiary to-secondary text-on-primary"
            render={<div className="absolute left-6 top-6 size-24" />}
          />
          <TooltipTrigger
            handle={handle}
            payload="bg-tertiary-container text-on-tertiary-container"
            render={
              <RolePill className="bg-tertiary-container text-on-tertiary-container">
                Yuzu × Sea Salt
              </RolePill>
            }
          />
          <TooltipTrigger
            handle={handle}
            payload="bg-primary-container text-on-primary-container"
            render={
              <span className="absolute right-3 top-3 rounded-full text-on-primary-container px-2 py-0.5 text-xs font-semibold uppercase tracking-wide bg-primary-container">
                New
              </span>
            }
          />
        </div>
        <div className="flex items-center gap-4 text-on-surface">
          <TooltipTrigger
            handle={handle}
            payload="fill-primary text-primary"
            render={<Heart className="size-5 fill-primary text-primary" />}
          />
          <TooltipTrigger
            handle={handle}
            payload="text-on-surface-variant"
            render={<MessageCircle className="size-5 text-on-surface-variant" />}
          />
          <TooltipTrigger
            handle={handle}
            payload="text-on-surface-variant"
            render={<Bookmark className="ml-auto size-5 text-on-surface-variant" />}
          />
        </div>
        <div>
          <TooltipTrigger
            handle={handle}
            payload="text-on-surface"
            render={<p className="w-fit text-xs font-medium">1,284 likes</p>}
          />
          <p className="text-xs text-on-surface-variant">
            <TooltipTrigger
              handle={handle}
              payload="text-on-surface"
              render={<span className="font-medium text-on-surface">sola.drinks</span>}
            />{' '}
            <TooltipTrigger
              handle={handle}
              payload="text-on-surface-variant"
              render={
                <span className="font-medium text-on-surface-variant">your sign to hydrate ☀️</span>
              }
            />
          </p>
        </div>
      </div>
    </PosterCard>
  )
}

function StoryCard({ handle }: { handle: PosterTooltipHandle }) {
  return (
    <PosterCard className="bg-surface-container-low md:col-span-4 ring ring-outline-variant">
      <TooltipTrigger
        handle={handle}
        payload="bg-surface-container-low"
        render={<div className="absolute bottom-0 right-0 h-10 w-20" />}
      />
      <div className="flex min-h-72 flex-col gap-4">
        <div className="flex gap-1">
          {[0, 1, 2].map((segment) => (
            <TooltipTrigger
              key={segment}
              handle={handle}
              payload={segment === 0 ? 'bg-secondary' : 'bg-secondary-container'}
              render={
                <span
                  className={cx(
                    'h-1 flex-1 rounded-full',
                    segment === 0 ? 'bg-secondary' : 'bg-secondary-container',
                  )}
                />
              }
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipTrigger
              handle={handle}
              payload="bg-primary-fixed"
              render={<span className="size-7 rounded-full bg-primary-fixed" />}
            />
            <TooltipTrigger
              handle={handle}
              payload="text-on-surface"
              render={<span className="w-fit text-xs font-semibold">sola.drinks</span>}
            />
          </div>
          <RolePill>Story</RolePill>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <TooltipTrigger
            handle={handle}
            payload="text-on-surface"
            render={
              <p className="w-fit text-xs font-medium uppercase tracking-[0.25em]">
                Drop goes live in
              </p>
            }
          />
          <div className="flex items-center gap-2 font-mono text-2xl font-semibold">
            {COUNTDOWN.map((unit, index) => (
              <span key={unit} className="flex items-center gap-2">
                <TooltipTrigger
                  handle={handle}
                  payload="text-on-surface"
                  render={<span className="rounded-xl px-2.5 py-1.5">{unit}</span>}
                />
                {index < COUNTDOWN.length - 1 ? <span className="opacity-60">:</span> : null}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <TooltipTrigger
            handle={handle}
            payload="text-on-surface-variant"
            render={<ChevronsUp className="size-5 text-on-surface-variant" />}
          />
          <TooltipTrigger
            handle={handle}
            payload="bg-primary-fixed text-on-primary-fixed"
            render={
              <span className="rounded-full bg-primary-fixed px-4 py-2 text-sm font-medium text-on-primary-fixed">
                Swipe up to shop
              </span>
            }
          />
        </div>
      </div>
    </PosterCard>
  )
}

function EmailCard({ handle }: { handle: PosterTooltipHandle }) {
  return (
    <PosterCard className="md:col-span-5 ring ring-outline-variant">
      <TooltipTrigger
        handle={handle}
        payload="bg-surface text-on-surface"
        render={<div className="absolute bottom-0 right-0 h-10 w-24" />}
      />
      <div className="flex min-h-72 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipTrigger
              handle={handle}
              payload="bg-primary text-on-primary"
              render={
                <IconChip className="bg-primary text-on-primary">
                  <Mail className="size-4" />
                </IconChip>
              }
            />
            <div className="leading-tight">
              <TooltipTrigger
                handle={handle}
                payload="text-on-surface"
                render={<p className="w-fit text-xs font-medium">SOLA</p>}
              />
              <TooltipTrigger
                handle={handle}
                payload="text-on-surface-variant"
                render={<p className="w-fit text-xs text-on-surface-variant">hello@sola.drinks</p>}
              />
            </div>
          </div>
          <RolePill>Email</RolePill>
        </div>
        <div>
          <TooltipTrigger
            handle={handle}
            payload="text-primary"
            render={
              <p className="w-fit text-base font-semibold text-primary">
                Your summer staple is back ☀️
              </p>
            }
          />
          <TooltipTrigger
            handle={handle}
            payload="text-on-surface"
            render={
              <p className="mt-1 w-fit text-sm">
                Yuzu × Sea Salt sparkling is shipping again — and your first case ships free.
              </p>
            }
          />
        </div>
        <div className="relative flex items-center justify-between rounded-2xl bg-secondary px-3 py-2">
          <TooltipTrigger
            handle={handle}
            payload="bg-secondary text-on-secondary"
            render={<div className="absolute inset-y-1 left-1 w-24" />}
          />

          <TooltipTrigger
            handle={handle}
            payload="text-on-secondary"
            render={
              <div>
                <p className="w-fit text-xs uppercase tracking-wide text-on-secondary">
                  Promo code
                </p>
                <p className="w-fit font-mono text-sm font-semibold text-on-secondary">SUNUP15</p>
              </div>
            }
          />

          <TooltipTrigger
            handle={handle}
            payload="bg-primary-container text-on-primary-container"
            render={
              <RolePill className="bg-primary-container! text-on-primary-container!">
                15% off
              </RolePill>
            }
          />
        </div>
        <TooltipTrigger
          handle={handle}
          payload="bg-primary-container text-on-primary-container"
          render={
            <button
              type="button"
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-4 py-3 text-sm font-medium text-on-primary-container"
            >
              Shop the drop
              <ArrowUpRight className="size-4" />
            </button>
          }
        />
      </div>
    </PosterCard>
  )
}

function BannerAd({ handle }: { handle: PosterTooltipHandle }) {
  return (
    <PosterCard className="bg-primary-fixed text-on-primary-fixed md:col-span-3">
      <TooltipTrigger
        handle={handle}
        payload="bg-primary-fixed"
        render={<div className="absolute right-4 top-6 bottom-6 w-20 h-full" />}
      />
      <div className="flex min-h-72 flex-col justify-between gap-4">
        <div className="flex items-center justify-between">
          <RolePill>Banner</RolePill>
          <TooltipTrigger
            handle={handle}
            payload="text-on-primary-fixed"
            render={<span className="w-fit text-xs font-medium uppercase tracking-wide">Ad</span>}
          />
        </div>
        <div>
          <TooltipTrigger
            handle={handle}
            payload="text-on-primary-fixed"
            render={<p className="w-fit text-3xl font-semibold tracking-tight">12-pack</p>}
          />
          <TooltipTrigger
            handle={handle}
            payload="text-on-primary-fixed"
            render={<p className="mt-1 w-fit text-sm">$32 · free shipping</p>}
          />
        </div>
        <TooltipTrigger
          handle={handle}
          payload="bg-primary text-on-primary"
          render={
            <div className="flex items-center justify-between rounded-full bg-on-surface px-4 py-2.5 text-surface shadow-md">
              <span className="text-sm font-medium">Shop now</span>
              <ArrowUpRight className="size-4" />
            </div>
          }
        />
      </div>
    </PosterCard>
  )
}

function ProofStrip({ handle }: { handle: PosterTooltipHandle }) {
  return (
    <PosterCard className="bg-surface-container md:col-span-12">
      <TooltipTrigger
        handle={handle}
        payload="bg-surface-container"
        render={<div className="absolute bottom-0 right-0 h-8 w-32" />}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <TooltipTrigger
            handle={handle}
            payload="bg-primary text-on-primary"
            render={
              <IconChip className="bg-primary text-on-primary shrink-0">
                <Check className="size-4" />
              </IconChip>
            }
          />
          <div>
            <TooltipTrigger
              handle={handle}
              payload="text-on-surface"
              render={<p className="w-fit text-sm font-medium">One seed. Every channel.</p>}
            />
            <TooltipTrigger
              handle={handle}
              payload="text-on-surface-variant"
              render={
                <p className="w-fit text-xs text-on-surface-variant">
                  The same color contract drives all five formats — every pairing passes AA.
                </p>
              }
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((format) => (
            <RolePill key={format}>{format}</RolePill>
          ))}
        </div>
      </div>
    </PosterCard>
  )
}

const tooltipHandle = createTooltipHandle<string>()
export function ProductPoster() {
  return (
    <TooltipProvider delay={0}>
      <div className="grid w-full max-w-5xl gap-3 md:grid-cols-12 select-none">
        <ProofStrip handle={tooltipHandle} />
        <Billboard handle={tooltipHandle} />
        <InstagramPost handle={tooltipHandle} />
        <StoryCard handle={tooltipHandle} />
        <EmailCard handle={tooltipHandle} />
        <BannerAd handle={tooltipHandle} />
      </div>
      <Tooltip handle={tooltipHandle}>
        {({ payload }) => (
          <TooltipContent variant="inverse">
            <span className="font-mono">{payload}</span>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
