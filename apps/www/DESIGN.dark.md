---
name: Tonex
colors:
  brand: "#b8b0a1"
  brand-foreground: "#231f15"
  primary: "#cec6b6"
  on-primary: "#454034"
  primary-container: "#b8b0a1"
  on-primary-container: "#353025"
  secondary: "#a29d96"
  on-secondary: "#22201b"
  secondary-container: "#33302b"
  on-secondary-container: "#b5b0a8"
  tertiary: "#c5beb2"
  on-tertiary: "#3e3a32"
  tertiary-container: "#b7b0a5"
  on-tertiary-container: "#343028"
  error: "#fe8b70"
  on-error: "#5a1001"
  error-container: "#5c1202"
  on-error-container: "#ff8f74"
  surface: "#0f0e0c"
  on-surface: "#eae4df"
  on-surface-variant: "#afaaa5"
  surface-dim: "#0f0e0c"
  surface-bright: "#2e2c28"
  surface-container-lowest: "#000000"
  surface-container-low: "#141311"
  surface-container: "#1b1917"
  surface-container-high: "#211f1d"
  surface-container-highest: "#272522"
  outline: "#787570"
  outline-variant: "#4a4744"
typography:
  display:
    fontFamily: Vidaloka
    fontSize: 72px
    fontWeight: "400"
    lineHeight: 72px
    letterSpacing: -0.02em
  headline:
    fontFamily: Vidaloka
    fontSize: 48px
    fontWeight: "400"
    lineHeight: 48px
    letterSpacing: -0.01em
  title:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 24px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: "400"
    lineHeight: 30px
  body:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
  mono:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 20px
rounded:
  sm: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  2xl: 1rem
  3xl: 1.5rem
  full: 9999px
spacing:
  control: 0.5rem
  gutter: 1rem
  panel: 1.5rem
  section: 6rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.control}"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.on-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.control}"
  button-ghost-hover:
    backgroundColor: "{colors.surface-container}"
  input-field:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.control}"
  card:
    backgroundColor: "{colors.surface-container-low}"
    rounded: "{rounded.md}"
    padding: "{spacing.panel}"
  rail:
    backgroundColor: "{colors.surface-container-lowest}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.control}"
  surface-popup:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.control}"
  badge:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.mono}"
    rounded: "{rounded.full}"
---

## Brand & Style

Tonex is precise but warm — a science-grade product wearing a calm, editorial
surface. Two personalities share the same bones: the marketing pages are **loud
and expressive**, headlines set in a single dramatic serif over live, glowing
backdrops; the app is **calm and dense**, a professional instrument that recedes so
the work stays in focus. Light and airy throughout, with soft corners, hairline
borders, and restrained shadow — nothing shouts except, now and then, one primary
action.

## Colors

The dark facet of the same system. Every color is re-toned from the one seed — the
brand greige `#b8b0a1` — so the relationship flips: light taupe accents now sit over
a near-black, faintly warmed ground. Each role keeps its hue and shifts only
lightness, every fill clears its text at AA, and the palette stays calm — only the
primary action carries weight.

- **Primary** — main actions, active states, and focus. The one accent allowed to
  carry weight; secondary and tertiary are quieter siblings for supporting accents.
- **Surface family** — the neutral spine. Hierarchy comes from stepping up the tonal
  layers (`surface` → `surface-container` → `…-high` → `…-highest`); shadow pulls
  back in dark, so outlines carry the separation instead.
- **On-surface / on-surface-variant** — primary text and lower-emphasis text. Step
  down to a real role to de-emphasize; never fade text with opacity, which breaks
  the gated contrast.
- **Brand** — the literal seed `#b8b0a1`, kept outside the generated roles for a
  genuine brand moment (the logo mark, the OG card); it holds across modes.
  `brand-foreground` (`#231f15`) is its AA-safe text. Reach for them only there;
  everywhere else, a semantic role.

## Typography

Three families, each with a job:

- **Vidaloka** — the serif voice. Big, editorial, one weight, used only for landing
  and section headlines. Tightly tracked and balance-wrapped, so a headline lands
  as a single confident statement.
- **IBM Plex Sans** — the working voice. Every label, button, and paragraph of UI.
  Clean and technical, ranging from regular body to semibold titles.
- **IBM Plex Mono** — the data voice. Every number, hex value, and token name,
  signalling exactness.

Headlines run large and fluid; body stays even and legible; labels sit small and
medium-weight. Hierarchy comes from family and scale, not from heavy weights.

## Layout & Spacing

Two rhythms for two surfaces. The **marketing** layout is generous and
viewport-filling — sections breathe with wide vertical spacing, content centered in
roomy containers, hero and final call-to-action sized to fill the screen. The
**app** layout is tight and efficient — a compact control grid (32–40px targets),
panels packed close, a fixed tool rail anchoring a quiet workspace. Generosity for
persuasion, density for work.

## Elevation & Depth

Depth is atmospheric, never heavy. Hierarchy comes first from **tonal surface
layers and hairline outlines** — surfaces stack by tint, borders do the separating.
**Shadows are saved for things that float** — popups, drawers, the rail — and pull
back in dark mode where borders carry the load. The marketing pages add real drama:
**live shaders** glow the brand color behind the hero and final CTA, with soft
backdrop-blur on floating chrome. The app stays grounded; its only shimmer is glass
on overlays.

## Shapes

Soft and rectilinear. A medium corner (`rounded-md`) is the workhorse across
buttons, inputs, cards, and popups; dialogs round a touch more. True pills
(`rounded-full`) are reserved for small, atomic things — swatches, dots, status
chips, avatars. The signature shape is the app's **floating tool rail**, generously
rounded (`rounded-2xl`) and pulled in from the screen edge — one soft slab in an
otherwise even system. Marketing cards and product frames round further still for a
friendly, device-like feel. No sharp edges anywhere.

## Motion

Calm and purposeful. Two signature easings carry everything: a gentle **spring**
for popups and toasts, a smooth **glide** for sheets and drawers. Entrances are a
single staggered fade-up — elements rise a few pixels into place, one after another
— never busy, always honoring reduced-motion. Quick for small things, slower for
large ones.

## Components

- **Buttons** — soft medium-cornered rectangles with a light shadow; only the
  primary action carries real weight. Ghost and outline variants stay flat and lean
  on a hover tint.
- **Inputs** — medium-cornered with a thin outline; fill level (transparent,
  filled, inset) is the variation, not the shape.
- **Cards** — flat medium-cornered columns on a tonal surface, footers split by a
  hairline rather than a shadow.
- **Rail** — the signature surface: a generously rounded, edge-detached tool panel
  with a soft lift.
- **Popups & dialogs** — translucent surfaces with backdrop-blur, a soft shadow,
  and a thin outline, springing into view.
- **Badges** — fully rounded chips in mono, for token names and status at small
  scale.

## Do's and Don'ts

- **Do** reach for a semantic color role for every fill and every piece of text —
  `primary`, `on-primary`, `surface-container-high`. 
- **Do** step down to a lower-emphasis role like `on-surface-variant`.
- **Do** disable a control that isn't available — dim it, stop pointer events.
- **Do** let depth come from tonal surface layers and hairline outlines first.
- **Do** keep motion to the two house easings — a quick spring for popups, a smooth
  glide for drawers. 
- **Do** stay on the type scale (`text-xs`, `leading-6`).
- **Do** label icon-only controls for screen readers.
- **Do** mind the small marks — real ellipses (`…`), curly quotes, non-breaking
  spaces in `⌘ K` and brand names, and tabular figures for number columns.
- **Don't** reach for a heavy shadow where a border will separate; save shadow for
  things that float.
- **Don't** hardcode a hex or `rgb()`; the palette is generated from the seed, and a literal can neither follow
  it nor guarantee contrast.
- **Don't** fade text with opacity (`on-surface/60`) to soften it — it breaks contrast. 
- **Don't** drop in arbitrary values like `text-[10px]`, and balance headings with `text-pretty` /
  `text-balance` so they don't leave widows.