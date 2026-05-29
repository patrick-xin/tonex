> **State:** Living. Edit when rail UI conventions change.

# Rail UI standard

Auto-loaded when you touch `md-rail/`. **These conventions govern both rails** — `md-rail/` and `shadcn-rail/` (both ship). The rail is the editor's primary chrome and the template the next feature reads first, so foundations matter here. _(ADR-0019 c.4)_

## Typography ladder
| Role | Class |
|---|---|
| Section header (sentence-case, default) | `text-sm font-medium text-on-surface` |
| Sub-group eyebrow (within a section) | `text-xs uppercase font-semibold text-on-surface/60 tracking-wide` |
| Body / control label | `text-sm text-on-surface-variant` |
| Helper / description | `text-xs text-on-surface-variant` |
| Numeric readout | `text-sm tabular-nums` |
| Disabled overlay | append `opacity-38` (don't change color tokens) |

Sentence-case is the default for section titles. Eyebrows are reserved for **sub-groups within a section** (e.g. CMF / Standard / Expressive under Scheme Variants) — one section, one eyebrow rhythm. No arbitrary sizes (`text-[11px]`); the table is exhaustive.

## Spacing
| Context | Token |
|---|---|
| Rail section wrapper | `p-2` (sections own their inset) |
| Inter-section rhythm | sections abut directly in `index.tsx` — no `space-y-*` between |
| Header-to-body within a section | `space-y-3` |
| Intra-row | `gap-2` |
| Tight cluster (pip grids, sub-row stack) | `gap-0.5` only |
| Form-row label-to-control | `space-y-1.5` |

Each section's `p-2` gives 8px top+bottom; abutting sections yield a 16px effective gap — the rail's rhythm. `index.tsx` adds no wrapper padding. One-off margins (`mx-1`) are forbidden — if a section needs to bleed outside its parent, the parent is wrong.

## Sizing
| Token | Use |
|---|---|
| `size-3.5` | swatch / pip in dense rows |
| `size-8` | popover-embedded `NativeColorInput` |
| `size-12` | top-level seed `NativeColorInput` (one site — `source-color-section.tsx`) |
| `icon-xs` | compact action inside dense rows / popovers |
| `icon-sm` | default ghost icon button |

Dialogs reuse `NativeColorInput`. Don't inline raw `<input type="color">`.

## Radius (depth-keyed, outer → control)
| Layer | Token |
|---|---|
| Rail aside | `rounded-2xl` |
| Drop zones / large interactive surfaces | `rounded-xl` |
| Cards (custom-color row, popover popup) | `rounded-lg` |
| Controls (button, input, swatch, popover content) | `rounded-md` |

## Section header anatomy
```tsx
<div className="flex items-center justify-between">
  <div className="text-sm font-medium text-on-surface">{title}</div>
  {action /* optional */}
</div>
```
Keep the wrapper even with no action so sections share vertical rhythm. Faceless titleless button stacks are not allowed.

## Conventions
- `Tooltip delay={100}` for inline rail tooltips.
- `data-popup-open:bg-primary/8` on ghost triggers when their popup is open.
- Disabled = `opacity-38`. Don't invent disabled colors.
- `ring-1 ring-scrim/10` for swatch outlines.
- Hex-input fields use `useHexFieldState(value, onChange)` (one buffered-input policy across the rail).

## Locating
- Rail-only hook → flat at `<rail>/<name>.ts` (hooks inside a feature are organisational, not sub-features).
- Cross-feature hook (≥2 features) → promote to `lib/`.
