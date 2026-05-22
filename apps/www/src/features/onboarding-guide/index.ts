// why: the onboarding tour is a layer-aware first-run orientation surface. It
// pairs with the H-hotkey help dialog (reference) and inline microcopy (state),
// each with a distinct job — the tour defers depth rather than duplicating it.
// Public surface: the provider + mounted host for layouts, the anchor wrapper
// for controls a step targets, the command-menu re-entry hook, and the authored
// step model for siblings that add steps.
export { GuideAnchor } from './guide-anchor'
export {
  GuideProvider,
  makeLiveAnchor,
  useGuide,
  useGuideOptional,
} from './guide-context'
export { OnboardingGuide, type ResolvedGuideStep } from './onboarding-guide'
export { OnboardingTour } from './onboarding-tour'
export { filterSteps, type GuideStep, getSteps, TOUR_STEPS, TOUR_WELCOME } from './tour-steps'
