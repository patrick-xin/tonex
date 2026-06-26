'use client'

import { motion, type Transition } from 'motion/react'
import * as React from 'react'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverArrow,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
} from '@/components/ui/popover'
import type { HelpSection } from '@/features/help-dialog/help-sections'
import { helpDialogHandle } from '@/lib/handles'
import { focusVisiblePrimaryRing } from '../../components/ui/styles'

export function OnboardingGuide({
  open,
  onOpenChange,
  suspended = false,
  onSuspend,
  steps,
  welcomeTitle = 'Welcome',
  welcomeDescription = 'Let us show you around in a few quick steps.',
  welcomeLearnMore,
}: OnboardingGuideProps) {
  const [step, setStep] = React.useState(0)
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()

  const touring = step >= 1
  const currentStep = steps[step - 1]
  const activeEl = currentStep?.anchor.current ?? null
  const isLastStep = step === steps.length
  const learnMore = currentStep?.learnMore ?? null

  // Pause the tour (keep the step) rather than closing it, so dismissing Help
  // drops the user back where they were — the welcome screen (step 0) when
  // opened from the welcome, or the same tour step when opened mid-tour. Suspending also releases the tour's
  // modal so it doesn't stack focus traps / scroll locks with Help. Falls back
  // to a plain close if no host wired suspend.
  const openLearnMore = (section: HelpSection) => {
    if (onSuspend) onSuspend()
    else onOpenChange(false)
    helpDialogHandle.openWithPayload(section)
  }

  const rect = useTargetTracker(activeEl)

  const dismiss = () => onOpenChange(false)

  const goTo = (next: number) => {
    const clamped = Math.max(1, Math.min(next, steps.length))
    steps[clamped - 1]?.anchor.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
    setStep(clamped)
  }

  // Keyboard navigation
  React.useEffect(() => {
    if (!touring) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(step + 1)
      if (e.key === 'ArrowLeft' && step > 1) goTo(step - 1)
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // biome-ignore lint/correctness/useExhaustiveDependencies: React Compiler memoizes goTo; it's stable across renders.
  }, [touring, step, goTo])

  // Carousel → step: a swipe (or the carousel's own arrow keys) selects a slide,
  // which advances the tour and moves the spotlight to that step's anchor.
  React.useEffect(() => {
    if (!carouselApi) return
    const onSelect = () => goTo(carouselApi.selectedScrollSnap() + 1)
    carouselApi.on('select', onSelect)
    return () => {
      carouselApi.off('select', onSelect)
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: React Compiler memoizes goTo; it's stable across renders.
  }, [carouselApi, goTo])

  // step → carousel: button / pill / keyboard nav changes the step, so scroll the
  // carousel to the matching slide. The guard avoids a redundant scroll (and the
  // select → goTo round-trip) when they're already aligned.
  React.useEffect(() => {
    if (!carouselApi || !touring) return
    if (carouselApi.selectedScrollSnap() !== step - 1) carouselApi.scrollTo(step - 1)
  }, [carouselApi, touring, step])

  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChangeComplete={(open) => {
        // Keep the step when the close is a "Learn more" pause; only a real
        // dismiss resets back to the welcome screen.
        if (!open && !suspended) setStep(0)
      }}
    >
      <DialogPortal>
        <SpotlightOverlay rect={rect} active={touring} />
        {touring && activeEl && (
          <Popover open>
            <PopoverPortal>
              <PopoverPositioner
                className="z-11"
                anchor={activeEl}
                side={currentStep.side ?? 'bottom'}
                sideOffset={10 + HOLE_PADDING}
              >
                <PopoverPopup className="surface-popup px-3 py-1.5 text-sm font-medium bg-surface">
                  <PopoverArrow />
                  {currentStep.popoverTitle ?? currentStep.title}
                </PopoverPopup>
              </PopoverPositioner>
            </PopoverPortal>
          </Popover>
        )}

        <DialogViewport className="z-12 grid place-items-end p-4 sm:place-items-center">
          <DialogPopup className="surface-dialog relative grid w-full max-w-xl gap-4 rounded-lg p-4 sm:p-6 shadow-lg animate-fade-zoom">
            {!touring && (
              <>
                <DialogHeader>
                  <DialogTitle>{welcomeTitle}</DialogTitle>
                  <DialogDescription>{welcomeDescription}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="justify-between">
                  {welcomeLearnMore ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openLearnMore(welcomeLearnMore)}
                    >
                      Learn more
                    </Button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="outline" onClick={dismiss}>
                      Skip
                    </Button>
                    <Button onClick={() => goTo(1)}>Start Tour</Button>
                  </div>
                </DialogFooter>
              </>
            )}

            {touring && currentStep && (
              <>
                <Carousel
                  className="w-full"
                  opts={{ loop: false, startIndex: step - 1 }}
                  setApi={setCarouselApi}
                >
                  <CarouselContent>
                    {steps.map((s) => (
                      <CarouselItem key={s.title}>
                        <div className="grid select-none aspect-video place-items-center overflow-hidden rounded-lg w-full [&>svg]:select-none">
                          {s.illustration}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                <div className="flex items-center justify-center gap-2">
                  {steps.map((s, i) => {
                    const active = i === step - 1
                    return (
                      <button
                        key={s.title}
                        type="button"
                        aria-label={`Go to step ${i + 1}: ${s.title}`}
                        aria-current={active ? 'step' : undefined}
                        onClick={() => goTo(i + 1)}
                        className={cn(
                          'h-2 rounded-full transition-[width,background-color] duration-200',
                          active
                            ? 'w-6 bg-primary'
                            : 'w-2 bg-surface-container-highest hover:bg-on-surface-variant',
                          focusVisiblePrimaryRing,
                        )}
                      />
                    )
                  })}
                </div>

                <DialogHeader className="gap-3 text-left">
                  <DialogTitle>{currentStep.title}</DialogTitle>
                  <DialogDescription className="text-base min-h-24">
                    {currentStep.description}
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="justify-between">
                  <div className="flex items-center gap-2">
                    {step > 1 && (
                      <Button variant="outline" size="sm" onClick={() => goTo(step - 1)}>
                        Back
                      </Button>
                    )}
                    {learnMore !== null && (
                      <Button
                        variant="link"
                        size="sm"
                        className="pl-0"
                        onClick={() => openLearnMore(learnMore)}
                      >
                        Learn more
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    {!isLastStep && (
                      <Button variant="outline" size="sm" onClick={dismiss}>
                        Skip
                      </Button>
                    )}
                    {isLastStep ? (
                      <Button size="sm" onClick={dismiss}>
                        Create your first theme
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => goTo(step + 1)}>
                        Next
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  )
}

// why: the presentational guide takes *resolved* steps — a live anchor ref, not
// an anchorKey. The authored GuideStep (tour-steps.tsx) is mapped onto this by
// the host adapter (OnboardingTour), which is where layer filtering and
// makeLiveAnchor resolution happen.
export type ResolvedGuideStep = {
  title: string
  // Short label for the spotlight popover; falls back to `title` when absent.
  popoverTitle?: string
  description: React.ReactNode
  anchor: React.RefObject<HTMLElement | null>
  side?: 'top' | 'bottom' | 'left' | 'right'
  learnMore?: HelpSection
  illustration?: React.ReactNode
}

export type OnboardingGuideProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Set while the tour is paused for a "Learn more" detour. Lets the guide keep
  // its step across the close so resuming lands on the same step.
  suspended?: boolean
  // Pause (instead of close) the tour before opening Help. Falls back to a plain
  // close when absent.
  onSuspend?: () => void
  steps: ResolvedGuideStep[]
  welcomeTitle?: string
  welcomeDescription?: React.ReactNode
  // Deep-link target for a "Learn more" on the welcome screen (Finding 8
  // orientation). When set, the welcome footer renders the button.
  welcomeLearnMore?: HelpSection
}

function useTargetTracker(el: HTMLElement | null) {
  const [rect, setRect] = React.useState<DOMRect | null>(null)

  React.useLayoutEffect(() => {
    if (!el) {
      setRect(null)
      return
    }

    const update = () => setRect(el.getBoundingClientRect())
    update()

    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [el])

  return rect
}

const HOLE_PADDING = 6
const HOLE_RADIUS = 10
const HOLE_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

function SpotlightOverlay({ rect, active }: { rect: DOMRect | null; active: boolean }) {
  const maskId = React.useId()

  const hole =
    active && rect
      ? {
          x: rect.x - HOLE_PADDING,
          y: rect.y - HOLE_PADDING,
          w: rect.width + HOLE_PADDING * 2,
          h: rect.height + HOLE_PADDING * 2,
        }
      : null

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-auto fixed inset-0 z-10 h-full w-full animate-fade"
      width="100%"
      height="100%"
    >
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          {hole && (
            <motion.rect
              initial={false}
              animate={{ x: hole.x, y: hole.y, width: hole.w, height: hole.h }}
              transition={HOLE_TRANSITION}
              rx={HOLE_RADIUS}
              ry={HOLE_RADIUS}
              fill="black"
            />
          )}
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask={`url(#${maskId})`} />
    </svg>
  )
}
