// why: single source of truth mapping each help section id → the accordion that
// owns it. Makes a tour step's `learnMore` type-checkable (HelpSection) and lets
// a drift-guard test prove every tour link resolves to a real accordion item, so
// section ids can't silently diverge from the rendered Help dialog.
export const HELP_SECTIONS = {
  // Key Concepts accordion
  'light-dark-modes': 'concepts',
  hct: 'concepts',
  cmf: 'concepts',
  'scheme-variants': 'concepts',
  'surface-adjustment': 'concepts',
  'contrast-levels': 'concepts',
  'shadcn-mode': 'concepts',
  'bindings-overrides': 'concepts',
  'custom-colors': 'concepts',
  'export-dialog': 'concepts',
  // Q&A accordion
  'md3-shadcn-mapping': 'qa',
  'contrast-issues': 'qa',
  'hct-sliders': 'qa',
  'brand-color-not-matching': 'qa',
  'md3-vs-shadcn-borders': 'qa',
  'dialog-colors-mismatch': 'qa',
  'cmf-safety': 'qa',
  'cmf-colors-different': 'qa',
  'preserve-brand-color': 'qa',
  'vs-others': 'qa',
} as const satisfies Record<string, HelpAccordion>

export type HelpAccordion = 'concepts' | 'qa'
export type HelpSection = keyof typeof HELP_SECTIONS

// why: pure so the expand rule is unit-testable without a DOM. Additive — expand
// the deep-linked section while leaving the user's existing open items intact —
// and a no-op for a section another accordion owns or for a null payload (plain
// open via the H hotkey / command menu, which keeps each accordion's defaults).
export function openItemsFor(
  section: HelpSection | null,
  ownAccordion: HelpAccordion,
  currentOpen: string[],
): string[] {
  if (section === null) return currentOpen
  if (HELP_SECTIONS[section] !== ownAccordion) return currentOpen
  if (currentOpen.includes(section)) return currentOpen
  return [...currentOpen, section]
}
