'use client'

import * as React from 'react'
import { useLayer } from '@/lib/layer-context'
import { makeLiveAnchor, useGuide } from './guide-context'
import { OnboardingGuide, type ResolvedGuideStep } from './onboarding-guide'
import { getSteps, TOUR_WELCOME } from './tour-steps'

// why: the adapter between authored steps and the presentational guide. It
// reads the active layer, filters TOUR_STEPS to it, and resolves each step's
// anchorKey into a live ref via the guide registry. Mounted once per route
// group's layout (inside both LayerProvider and GuideProvider), so it sees the
// right layer and the open-state context.
export function OnboardingTour() {
  const layer = useLayer()
  const { open, setOpen, suspended, suspend, getAnchor } = useGuide()

  const steps = React.useMemo<ResolvedGuideStep[]>(
    () =>
      getSteps(layer).map((step) => ({
        title: step.title,
        description: step.description,
        side: step.side,
        learnMore: step.learnMore,
        anchor: makeLiveAnchor(getAnchor, step.anchorKey),
      })),
    [layer, getAnchor],
  )

  return (
    <OnboardingGuide
      open={open}
      onOpenChange={setOpen}
      suspended={suspended}
      onSuspend={suspend}
      steps={steps}
      welcomeTitle={TOUR_WELCOME.title}
      welcomeDescription={TOUR_WELCOME.description}
      welcomeLearnMore={TOUR_WELCOME.learnMore}
    />
  )
}
