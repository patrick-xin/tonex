import type { MdChartTokenName, ShadcnChartTokenName } from '../../chart/schema'
import { type CustomColorEntry, slugifyCustomColorName } from '../custom-color/entry'
import type { MdTokenName, ShadcnRoleName } from '../schema'

// why: ADR-0025 commitment 6 — contrast pair definitions encode M3 + shadcn
// spec semantics (`on-X` always pairs with `X`; `-foreground` always pairs
// with the unsuffixed root). Layer-tagged so `evaluateThemeContrast` knows
// which slice of the DerivedTheme to read; intent + threshold pre-baked per
// commitment 7 so slice contrast-3 can add non-text @ 3.0 without a schema
// migration. Closed const tuple — adding/removing a row is a code change.
//
// `--destructive` does NOT get a `--destructive-foreground / --destructive`
// pair: that direction (text on destructive fill) is covered by md
// `on-error / error`. It DOES get two other shapes of coverage the md side
// cannot stand in for:
// - Non-text pairs (issue #47 sweep): `--destructive` as button fill /
//   border / icon against neutral surfaces (`--background`, `--card`).
// - Role-as-text pairs (link-variant gotcha): `--destructive` as inline
//   error text via the `text-destructive` utility, against the same neutral
//   surfaces at the 4.5 text threshold.
// The same role-as-text shape applies to `--primary` via shadcn's Button
// `link` variant (`text-primary underline-offset-4 hover:underline`).
export interface ContrastPair {
  fg: string
  bg: string
  layer: 'md' | 'md-chart' | 'shadcn' | 'shadcn-chart' | 'md-custom' | 'shadcn-custom'
  intent: 'text' | 'non-text'
  threshold: number
}

// why: the static CONTRAST_PAIRS tuple stays checked against the real token-
// name unions — a typo there is a type error, not just a test failure. The
// public `ContrastPair` is wider (fg/bg: string, plus the *-custom layers)
// because custom-color pairs are keyed on runtime slugs no finite union can
// enumerate; `customColorContrastPairs` builds those at call time.
interface StaticContrastPair extends ContrastPair {
  fg: MdTokenName | MdChartTokenName | ShadcnRoleName | ShadcnChartTokenName
  bg: MdTokenName | MdChartTokenName | ShadcnRoleName | ShadcnChartTokenName
  layer: 'md' | 'md-chart' | 'shadcn' | 'shadcn-chart'
}

const TEXT_THRESHOLD = 4.5
// why: WCAG 1.4.11 Non-text Contrast — 3:1 against adjacent colors for UI
// component boundaries (borders, focus rings, outlines). Lower than text
// 4.5:1 because the legibility burden is lower for shape recognition than
// glyph reading.
const NON_TEXT_THRESHOLD = 3

export const CONTRAST_PAIRS = [
  // why: 18 md text pairs — every `on-X / X` pair, surface-on-variant against
  // surface (the actual rendered background per M3), inverse pair, fixed family.
  {
    fg: '--color-on-primary',
    bg: '--color-primary',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-primary-container',
    bg: '--color-primary-container',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-secondary',
    bg: '--color-secondary',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-secondary-container',
    bg: '--color-secondary-container',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-tertiary',
    bg: '--color-tertiary',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-tertiary-container',
    bg: '--color-tertiary-container',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-error',
    bg: '--color-error',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-error-container',
    bg: '--color-error-container',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-surface',
    bg: '--color-surface',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-surface-variant',
    bg: '--color-surface',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-primary-fixed',
    bg: '--color-primary-fixed',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-primary-fixed-variant',
    bg: '--color-primary-fixed',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-secondary-fixed',
    bg: '--color-secondary-fixed',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-secondary-fixed-variant',
    bg: '--color-secondary-fixed',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-tertiary-fixed',
    bg: '--color-tertiary-fixed',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-on-tertiary-fixed-variant',
    bg: '--color-tertiary-fixed',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-inverse-on-surface',
    bg: '--color-inverse-surface',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--color-inverse-primary',
    bg: '--color-inverse-surface',
    layer: 'md',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  // why: 10 shadcn `-foreground / root` text pairs — shadcn's canonical
  // text/fill convention. No `--destructive-foreground / --destructive` entry:
  // destructive text is covered by md `on-error / error`. The 4 role-as-text
  // pairs below are a separate cohort with different semantics.
  {
    fg: '--foreground',
    bg: '--background',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--card-foreground',
    bg: '--card',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--popover-foreground',
    bg: '--popover',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--primary-foreground',
    bg: '--primary',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--secondary-foreground',
    bg: '--secondary',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--accent-foreground',
    bg: '--accent',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--muted-foreground',
    bg: '--muted',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--sidebar-foreground',
    bg: '--sidebar',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--sidebar-primary-foreground',
    bg: '--sidebar-primary',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--sidebar-accent-foreground',
    bg: '--sidebar-accent',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  // why: 4 shadcn role-as-text pairs — shadcn's default templates invert two
  // fill roles into text usage:
  // - `--primary` as text via the Button `link` variant
  //   (`text-primary underline-offset-4 hover:underline`)
  // - `--destructive` as text via the `text-destructive` utility (standard
  //   for inline error text; the destructive Button variant also uses it
  //   for hover text-on-fill in some templates).
  //
  // Both render the role on a neutral surface; the foreground/root convention
  // above does not cover this direction (it checks text-on-fill, not fill-as-
  // text). Pinned against both --background (root) and --card (the two
  // universal neutral surfaces). 4.5:1 text threshold — these are read as
  // glyphs, not shape recognition. Scope strictly tracks documented shadcn
  // usage; adding every theoretical role-as-text re-use is out of scope.
  {
    fg: '--primary',
    bg: '--background',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--primary',
    bg: '--card',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--destructive',
    bg: '--background',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  {
    fg: '--destructive',
    bg: '--card',
    layer: 'shadcn',
    intent: 'text',
    threshold: TEXT_THRESHOLD,
  },
  // why: 21 non-text pairs at 3:1 (WCAG 1.4.11) — slice contrast-3 baseline
  // (7 pairs) + issue #47 sweep (14 pairs).
  //
  // md outline + outline-variant against the surface ladder. Outlines are
  // not only drawn on the base --color-surface — every container variant
  // (--color-surface-container{,-lowest,-low,-high,-highest}) is also a
  // legitimate render context for edges and dividers, and contrast must
  // hold against each (a dim outline on a high-tone container fails 3:1
  // even when it passes on the base surface). 12 md pairs = 2 fg tokens ×
  // 6 surface backgrounds.
  //
  // shadcn picks per-role bg by render context:
  // - --border on --background (universal root border).
  // - --input + --ring on BOTH --card AND --background. Form fields most
  //   often live in card-class containers (dialog, popover, card itself)
  //   — that's the original slice contrast-3 pair — but they also render
  //   directly on the root background in toolbar/header/standalone forms,
  //   and a low-contrast input on the root would slip past a card-only
  //   check.
  // - --destructive on --background and --card as a non-text fill / border
  //   / icon. md on-error/error covers destructive TEXT (text on the fill);
  //   it does NOT cover the fill itself against the neutral surface it sits
  //   on, which is the WCAG 1.4.11 concern for icon-only destructive
  //   buttons and outline-style destructive variants.
  // - --sidebar-border / --sidebar-ring scoped to --sidebar (sidebar is its
  //   own surface family — edges and rings rendered inside it are checked
  //   against it, not the root).
  {
    fg: '--color-outline',
    bg: '--color-surface',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline',
    bg: '--color-surface-container-lowest',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline',
    bg: '--color-surface-container-low',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline',
    bg: '--color-surface-container',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline',
    bg: '--color-surface-container-high',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline',
    bg: '--color-surface-container-highest',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline-variant',
    bg: '--color-surface',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline-variant',
    bg: '--color-surface-container-lowest',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline-variant',
    bg: '--color-surface-container-low',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline-variant',
    bg: '--color-surface-container',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline-variant',
    bg: '--color-surface-container-high',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-outline-variant',
    bg: '--color-surface-container-highest',
    layer: 'md',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--border',
    bg: '--background',
    layer: 'shadcn',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--input',
    bg: '--card',
    layer: 'shadcn',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--input',
    bg: '--background',
    layer: 'shadcn',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--ring',
    bg: '--card',
    layer: 'shadcn',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--ring',
    bg: '--background',
    layer: 'shadcn',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--destructive',
    bg: '--background',
    layer: 'shadcn',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--destructive',
    bg: '--card',
    layer: 'shadcn',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--sidebar-border',
    bg: '--sidebar',
    layer: 'shadcn',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--sidebar-ring',
    bg: '--sidebar',
    layer: 'shadcn',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  // why: 20 chart non-text pairs at 3:1 (WCAG 1.4.11) — slice contrast-4
  // (ADR-0027 c.5) treats chart palette as a first-class derivation surface
  // with the same contrast guarantees as borders/focus rings. MD3 and shadcn
  // layers carry parallel sets: 10 md-chart (--color-chart-N vs surface +
  // surface-container) + 10 shadcn-chart (--chart-N vs --background + --card).
  // The two layers share chart values (shadcn rebrands md), so passing one
  // implies passing the other under default bindings — both are kept explicit
  // so a future binding drift (shadcn --card → different md token) surfaces
  // immediately. Chart-vs-chart distinguishability is a different concern
  // (perceptual distance, not WCAG 1.4.11) and not in scope here.
  //
  // Layer tags: 'md-chart' reads theme.md.lightChart / darkChart for fg with
  // theme.md.light / lightExtended for partners. 'shadcn-chart' reads
  // theme.shadcn.lightChart / darkChart for fg with theme.shadcn.light / dark
  // for partners. Keeping the chart tokens out of the layer namespace's main
  // TokenMap matches DerivedTheme's emission-policy partition (ADR-0021 c.2).
  {
    fg: '--color-chart-1',
    bg: '--color-surface',
    layer: 'md-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-chart-2',
    bg: '--color-surface',
    layer: 'md-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-chart-3',
    bg: '--color-surface',
    layer: 'md-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-chart-4',
    bg: '--color-surface',
    layer: 'md-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-chart-5',
    bg: '--color-surface',
    layer: 'md-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-chart-1',
    bg: '--color-surface-container',
    layer: 'md-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-chart-2',
    bg: '--color-surface-container',
    layer: 'md-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-chart-3',
    bg: '--color-surface-container',
    layer: 'md-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-chart-4',
    bg: '--color-surface-container',
    layer: 'md-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--color-chart-5',
    bg: '--color-surface-container',
    layer: 'md-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--chart-1',
    bg: '--background',
    layer: 'shadcn-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--chart-2',
    bg: '--background',
    layer: 'shadcn-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--chart-3',
    bg: '--background',
    layer: 'shadcn-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--chart-4',
    bg: '--background',
    layer: 'shadcn-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--chart-5',
    bg: '--background',
    layer: 'shadcn-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--chart-1',
    bg: '--card',
    layer: 'shadcn-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--chart-2',
    bg: '--card',
    layer: 'shadcn-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--chart-3',
    bg: '--card',
    layer: 'shadcn-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--chart-4',
    bg: '--card',
    layer: 'shadcn-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
  {
    fg: '--chart-5',
    bg: '--card',
    layer: 'shadcn-chart',
    intent: 'non-text',
    threshold: NON_TEXT_THRESHOLD,
  },
] as const satisfies readonly StaticContrastPair[]

// why: the dynamic sibling of CONTRAST_PAIRS — custom-color slugs are runtime
// values, so their pairs cannot live in the closed tuple. Each entry emits the
// spec-shaped pairs deriveTheme's tokens already imply: two md text pairs
// (color + container, `on-X / X`) plus the one bound shadcn text pair
// (`-foreground / root`). Slug derivation matches derive.ts emission exactly,
// so the produced fg/bg names line up with the tokens in DerivedTheme.
// `evaluateThemeContrast` concatenates these onto the static list per call.
export function customColorContrastPairs(
  customColors: readonly CustomColorEntry[],
): ContrastPair[] {
  const pairs: ContrastPair[] = []
  for (const entry of customColors) {
    const slug = slugifyCustomColorName(entry.name)
    pairs.push(
      {
        fg: `--color-on-${slug}`,
        bg: `--color-${slug}`,
        layer: 'md-custom',
        intent: 'text',
        threshold: TEXT_THRESHOLD,
      },
      {
        fg: `--color-on-${slug}-container`,
        bg: `--color-${slug}-container`,
        layer: 'md-custom',
        intent: 'text',
        threshold: TEXT_THRESHOLD,
      },
      {
        fg: `--${slug}-foreground`,
        bg: `--${slug}`,
        layer: 'shadcn-custom',
        intent: 'text',
        threshold: TEXT_THRESHOLD,
      },
    )
  }
  return pairs
}
