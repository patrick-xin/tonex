'use client'

import * as React from 'react'
import { HELP_SECTIONS, type HelpAccordion, type HelpSection, openItemsFor } from './help-sections'

// why: drives a Help accordion as controlled (not defaultValue) so a re-open with
// a different deep-link section reacts even if the dialog stays mounted. When the
// payload names a section this accordion owns, it expands it (additively, so the
// user's other open items survive) and scrolls it into view after a frame — the
// rAF lets the panel finish expanding first, and block:'nearest' cooperates with
// the dialog's own ScrollArea. Keyed on `section`, so it fires on a deep-link,
// not on every keystroke-driven re-render.
export function useHelpSectionOpen(
  section: HelpSection | null,
  ownAccordion: HelpAccordion,
  defaultOpen: string[],
) {
  const [value, setValue] = React.useState<string[]>(defaultOpen)

  React.useEffect(() => {
    if (section === null || HELP_SECTIONS[section] !== ownAccordion) return
    setValue((prev) => openItemsFor(section, ownAccordion, prev))
    const frame = requestAnimationFrame(() => {
      document.getElementById(section)?.scrollIntoView({ block: 'nearest' })
    })
    return () => cancelAnimationFrame(frame)
  }, [section, ownAccordion])

  return { value, setValue }
}
