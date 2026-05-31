# Interface guidelines — tokens, focus, motion, a11y

Governs the *rendered surface* of every www component: which token, which focus ring, which motion utility, which a11y idiom. The *form* of the file (naming, React mechanics) is [components.md](components.md); this is its *output*.

## Tokens
- **Never hardcode a hex or `rgb()` — use the semantic MD3 utility** (`bg-primary`, `text-on-primary-container`, `bg-surface-container-high`). `on-<role>` is the foreground for that role; `-container` / `-container-{lowest,low,high,highest}` are the surface tiers. _(ADR-0013)_
- **Every `--color-*` is registered once in `styles/globals.css` (`@theme inline`); the value resolves from the `.md` / `.shadcn` scope at the use site** — the same `bg-primary` is correct in both layers, so don't fork a layer-specific color utility. _(ADR-0013)_
- **The default token values (`globals.css:186–370`, between the `tonex:tokens` markers) are generated** — regenerate with `pnpm bake` (`scripts/bake-tokens.ts`); never hand-edit between the markers.

## Focus & states
- **Don't hand-roll `focus-visible:` per component — import the ring from `components/ui/styles.ts`.** Colored buttons use the outline rings (`focusVisiblePrimaryRing` / `Secondary` / `Tertiary` / `DangerRing` — `outline-2 outline-offset-2`); inputs and transparent controls use the shadow rings (`focusVisibleRing`, `focusWithinRing`).
- **Disabled and error states come from the same module:** `disabledState` (`opacity-38`, `pointer-events-none`) and `errorState` / `errorStateWithoutRing` (keyed off `aria-invalid` / `data-invalid`). The disabled treatment is the visual half of the disable-don't-warn rule in [interactions.md](interactions.md).

## Motion
- **Don't write a one-off transition for an overlay — apply the shared utility from `styles/tonex.css`.** Popups/toasts: `animate-popup` (`--ease-spring`, 150ms). Dialogs/drawers: `animate-fade-up` / `-down`, `animate-slide-left` / `-right` (`--ease-smooth`, 450ms). Plain fades: `animate-fade` / `animate-fade-zoom` (240ms).
- **Reach for a `surface-*` composite before assembling chrome by hand** — `surface-popup`, `surface-dialog` (and `-blur` variants) bundle background, radius, shadow, outline, and the right animation.
- **Elevation is the `elevation-0`–`elevation-5` utilities (MD3); add `transition-shadow` to animate it.** Two easings only — `--ease-spring` (quick/popup), `--ease-smooth` (large/drawer); don't introduce a third curve.
- For `motion/react`, use `import { m } from 'motion/react'` for performance. Always include `reduceMotion` for accessibility.

## Accessibility
- **Don't reinvent keyboard navigation — Base UI primitives own it.** Compose them rather than wiring `onKeyDown` / roving-tabindex by hand.
- **Label icon-only controls with `aria-label`; screen-reader-only text uses the `sr-only` class; add a container `role` only where the primitive doesn't supply one.**
- **No nested interactive elements** — the rule body lives with the React conventions in [components.md](components.md); it is an a11y constraint, so it applies to work routed here too.
  
## Typography
- **Respect default tailwind conventions** No arbitrary values like `leanding-[0.25rem]`, `text-[10px]`, use `leading-1`,`text-xs` instead.
- **Don't use opacity on text** - `text-on-surface/60` will break accessibility, thus is anti-pattern.
- `…` not `...`
- Curly quotes `"` `"` not straight `"`
- Non-breaking spaces: `10&nbsp;MB`, `⌘&nbsp;K`, brand names
- Loading states end with `…`: `"Loading…"`, `"Saving…"`
- `font-variant-numeric: tabular-nums` for number columns/comparisons
- Use `text-wrap: balance` or `text-pretty` on headings (prevents widows)
