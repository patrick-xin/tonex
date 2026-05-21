'use client'

import * as React from 'react'
import { useIsRailVisible } from '@/lib/hooks/use-rail-visible'

const COOKIE_KEY = 'guide_seen'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

// why: steps are authored against stable anchor keys, but the spotlight needs a
// live element. This returns a RefObject whose `current` resolves the key →
// element on every read, so a step can reference a control that mounts/unmounts
// (tab switches, later slices) without the step holding a stale ref.
export function makeLiveAnchor(
  getAnchor: (key: string) => HTMLElement | null,
  key: string,
): React.RefObject<HTMLElement | null> {
  const obj = {} as React.RefObject<HTMLElement | null>
  Object.defineProperty(obj, 'current', {
    get: () => getAnchor(key),
    enumerable: true,
  })
  return obj
}

type GuideContextType = {
  open: boolean
  setOpen: (open: boolean) => void
  // Pause the tour for a "Learn more" detour into the Help dialog. suspend keeps
  // the current step but releases the tour's modal so it doesn't fight Help's
  // focus trap / scroll lock; resume reopens it on the same step.
  suspended: boolean
  suspend: () => void
  resume: () => void
  registerAnchor: (key: string, el: HTMLElement | null) => void
  getAnchor: (key: string) => HTMLElement | null
}

const GuideContext = React.createContext<GuideContextType | null>(null)

export function GuideProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = React.useState(false)
  const [suspended, setSuspended] = React.useState(false)
  // Read in resume's callback without a stale closure, so resume can reliably
  // tell a tour-initiated pause apart from any other Help close.
  const suspendedRef = React.useRef(false)
  const anchors = React.useRef<Map<string, HTMLElement>>(new Map())
  // why: the spotlight tour is desktop-only — it has no viable target once the
  // rail collapses into a drawer below 640px. Gates first-run and closes a live
  // tour on collapse. `undefined` means "not yet resolved" (SSR / pre-mount).
  const railVisible = useIsRailVisible()

  // First-run auto-open, desktop only. Fires once, when the breakpoint resolves.
  const autoOpened = React.useRef(false)
  React.useEffect(() => {
    if (railVisible === undefined || autoOpened.current) return
    autoOpened.current = true
    const seen = document.cookie.split(';').some((c) => c.trim().startsWith(`${COOKIE_KEY}=`))
    if (!seen && railVisible) setOpenState(true)
  }, [railVisible])

  // The spotlight can't survive the rail collapsing mid-tour — close cleanly.
  // setOpenState (not setOpen) so a resize doesn't burn the first-run cookie.
  React.useEffect(() => {
    if (open && railVisible === false) setOpenState(false)
  }, [open, railVisible])

  const setOpen = React.useCallback((next: boolean) => {
    if (!next) {
      // A single fire-and-forget first-run flag. The Cookie Store API is async
      // and unsupported in Safari; this mirrors the shadcn sidebar's cookie write.
      // biome-ignore lint/suspicious/noDocumentCookie: see above — deliberate sync cookie write
      document.cookie = `${COOKIE_KEY}=1; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`
    }
    setOpenState(next)
  }, [])

  // Pause for a "Learn more" detour: close the tour modal but keep its step (the
  // OnboardingGuide guards its step-reset on `suspended`). setOpenState, not
  // setOpen, so a pause doesn't burn the first-run cookie.
  const suspend = React.useCallback(() => {
    suspendedRef.current = true
    setSuspended(true)
    setOpenState(false)
  }, [])

  // Only a tour-initiated pause reopens — a plain Help close (H hotkey, command
  // menu) must not pop the tour open.
  const resume = React.useCallback(() => {
    if (!suspendedRef.current) return
    suspendedRef.current = false
    setSuspended(false)
    setOpenState(true)
  }, [])

  // why: the registry is a flat string→element Map (last-writer-wins). The rail
  // and its mobile drawer render the SAME content, so a key would register twice
  // — but the tour is desktop-only and the closed drawer is unmounted, leaving a
  // single live instance per key. A future mobile tour must make resolution
  // visibility-aware before it can rely on rail anchors.
  const registerAnchor = React.useCallback((key: string, el: HTMLElement | null) => {
    if (el) {
      anchors.current.set(key, el)
    } else {
      anchors.current.delete(key)
    }
  }, [])

  const getAnchor = React.useCallback((key: string) => {
    return anchors.current.get(key) ?? null
  }, [])

  return (
    <GuideContext.Provider
      value={{ open, setOpen, suspended, suspend, resume, registerAnchor, getAnchor }}
    >
      {children}
    </GuideContext.Provider>
  )
}

export function useGuide() {
  const ctx = React.useContext(GuideContext)
  if (!ctx) throw new Error('useGuide must be used within a GuideProvider')
  return ctx
}

export function useGuideOptional() {
  return React.useContext(GuideContext)
}
