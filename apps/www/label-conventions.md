# Tonex — Label & Copy Conventions

Single source of truth for in-app label, button, helper, tooltip, and short copy strings.

Applies to **Tonex's own product surfaces only.** shadcn sample components and demo blocks used as previews are explicitly out of scope — their sample content stays as-is.

---

## 1. Scope

### In scope (apply rules)

- **Rails:** MD3 rail + shadcn rail. Specifically: Source Color, Scheme Variant, Contrast Level, Surface Adjustment, Fine Tune Palette, Custom Colors, Color Roles List, Shadcn Role Override, Shadcn Bindings, Soft Borders, rail-mode switcher.
- **Dialogs / popovers:** Export, Contrast Checker, NewCustomColor, EditCustomColor, Settings, HelpDialog.
- **Chrome:** SiteCommandMenu, NavTabs, Reset button, the `"Copied"` toast emitted on swatch click.
- **Landing surfaces:** `/`, `/about`, `/pricing`, site header, site footer.
- **Tab page titles + tab-page-specific controls** (Palettes tab Horizontal/Vertical, Tone sort).

### Out of scope (do not modify)

- shadcn sample components inside preview surfaces: `button-group`, `dialog`, `hover-card`, `menubar`, `context-menu`, `calendar`, `popover`, `item`, `tables`, `pagination`, `sonner`, `select`, `sheet`, `inputs`, etc.
- Sample blocks: `contribution-history`, `payout-threshold`, `receiving-method`, `release-catalog`, `form-integration`, `kitchen-island`, `cover-art`, `savings-progress`, `social-links`, `notification-settings`, `preferences`, `recent-transactions`, `dividend-income`, `faq`, `index-investing`, `login-form`, `signup-form`, dashboard `_components`.
- All fake brand/sample data inside the above (`Pedro Duarte`, `Synthetic Horizons Music LLC`, financial figures, transaction listings, etc.).
- `/sink` (dev testbed).
- `<head>` SEO strings.

**If a surface isn't explicitly in scope, treat it as out of scope.**

---

## 2. Glossary — canonical terms

| Term | Form | Notes |
|---|---|---|
| `tonex` | lowercase | Brand mark. Logo, header, footer, page titles, sentence-medial mentions in product UI. |
| `Tonex` | capitalized | Only as sentence-initial proper noun in long-form prose (HelpDialog, landing body). |
| `MD3` | ALL CAPS | Chrome, labels, short copy. Never `md3`, `Md3`, or `md theme`. |
| `Material Design 3` | full form | Long-form prose only (HelpDialog, landing). |
| `shadcn` | lowercase | Always. Never `Shadcn` (even sentence-initial — restructure). |
| `shadcn/ui` | lowercase, slash | When referencing the project by full name. |
| `CMF` | ALL CAPS | Standalone abbreviation. Expand on first use in long-form prose: "CMF (Color Material Framework)." |
| `HCT` | ALL CAPS | Color model. Expand on first use: "HCT (Hue, Chroma, Tone)." |
| `Harmonize` | Title Case | The custom-color blend feature. Verb form, capitalized as a feature name. |
| `Variant` | per casing rule | The 10 scheme strategies. Display: Title Case ("Tonal Spot"). Code identifiers (`tonalSpot`): leave alone. |
| `Scheme` vs `Variant` | distinct | "Scheme" = the full output token set. "Variant" = the algorithm choice that produces it. Don't conflate. |
| `Override` | per casing rule | A hex pin layered on top of MCU's emission for a specific token/role. |
| `Binding` | per casing rule | Which MD token feeds a shadcn role. Mutates wiring, not value. |
| `Source color` | sentence case | The seed input. Always "source color," never "seed color" in user-facing copy. |
| `WCAG` | ALL CAPS | Always. |

---

## 3. Pattern rules

### 3.1 Casing

**Section headings — sentence case.**

✓ `Source color` · `Scheme variant` · `Surface adjustment` · `Fine-tune palette` · `Custom colors` · `Role overrides` · `Role bindings` · `Contrast audit` · `Export theme`

**Control labels — split rule:**

- **Multi-word descriptive label** → sentence case
  ✓ `Soft borders` · `Show extended tokens` · `Chart palette` · `Contrast variants` · `Tint level` · `Desaturate level` · `Default currency`

- **Single-word proper-name-like label** → Title Case
  ✓ `Hue` · `Chroma` · `Tone` · `Hex` · `Name` · `Description` · `Harmonize`

**Option labels — split rule:**

- **Display labels** (proper names, descriptive options) → Title Case
  ✓ `Tonal Spot` · `Fruit Salad` · `Vibrant` · `Monochrome` · `Horizontal` · `Vertical` · `Standard` · `Maximum`

- **Algorithm/format identifiers** the user reads as code → lowercase
  ✓ `tint` · `desaturate` · `mono` · `multi` · `hex` · `oklch`

CSS may render lowercase options uppercase visually; the source string stays lowercase.

**Group headings (variant family headers):** Title Case — `CMF`, `Standard`, `Expressive`, `Subdued`.

### 3.2 Helper text

- **No period** if single fragment: `Shift hue toward source color for visual cohesion`
- **Period** if full sentence or multi-sentence: `Pick a color and name it. The system generates 4 accessible roles automatically.`
- Lead with the verb if action-shaped, lead with the subject if descriptive
- No marketing adverbs (`powerful`, `intuitive`, `seamlessly`, `robust`, `comprehensive`, `elegant`)

### 3.3 Em dash

- **Always spaced** (` — `) in product copy, helper text, prose. Never unspaced (`—`).
- Existing inconsistency to fix: `accessibility—keep an eye` → `accessibility — keep an eye`

### 3.4 Brand styling

| Position | Form |
|---|---|
| Logo / header / footer / page title | `tonex` (lowercase) |
| Sentence-initial in long-form prose | `Tonex` (capitalized) |
| Sentence-medial in any prose | `tonex` (lowercase) |
| Q&A / Help titles | `Tonex` capitalized acceptable (matches existing convention) |

### 3.5 System naming

| Surface type | Form |
|---|---|
| Chrome, labels, short copy | `MD3` |
| Long-form prose (HelpDialog, landing) | `Material Design 3` |
| Code identifiers | varies — leave alone |

Never in user-facing copy: `md3`, `Md3`, `md theme`, `Material3`. `M3` is acceptable inside parentheticals like `(M3 spec)` where already present.

### 3.6 Reset verbiage

- **`Reset`** (bare) — default button label when target is obvious from context
- **`Reset {thing}`** — when scope needs clarity. Forms: `Reset palette` · `Reset binding` · `Reset role` · `Reset override` · `Reset contrast`
- **Never `Reset to default`** — redundant, there's nothing else it could mean
- **Never `Reset to MCU`** — exposes implementation; user doesn't think in MCU
- **Aria-label form:** action-shaped, no period
- **Confirmation:** `Reset every source field to defaults?` stays as-is (scope is clear, full form acceptable for global reset)

### 3.7 Hotkey format

Two surfaces, two rules. **The display rule does not apply to hotkey-library specs.**

**Display strings** (Kbd badges, tooltips, `meta.description` text, `shortcut:` props rendered to UI, command-menu shortcut hints):

- **Modifier + key:** `⌘+X` (with plus). Applies to `⌘+C`, `⌘+L`, `⌘+K`, `⇧+⌘+Z` etc.
- **Bare single-letter shortcuts** (`E`, `S`, `H`, `D`): no plus, no symbol — these are sequential keys in the command menu, not modifier combos.
- **Tab number hotkeys:** bare digits (`1`, `2`, `3`) as rendered in the badge.

**Hotkey-library specs** — the string argument to `useHotkey()` from `@tanstack/react-hotkeys`, e.g. `useHotkey('Mod+L', …)`:

- **Keep `Mod+X` as-is.** `Mod+` is the library's cross-platform resolver (⌘ on Mac, Ctrl on Win/Linux). Rewriting the spec to `⌘+X` makes the binding fire **only on Mac** and silently breaks on other platforms.
- Treat these strings as code, not user-facing copy. They are out of scope for label conventions.

---

## 4. Per-control-type templates

### Toggle (boolean switch)
- **Label** (required): sentence case for descriptive, Title Case for proper-name-like single word
- **Helper** (optional): no period if fragment, period if full sentence
- **Tooltip** (optional): describe consequence — especially for accessibility-affecting toggles

### Toggle group (option picker)
- **Group label** (when ambiguous): sentence case (`Format`, `Chart palette`)
- **Options**: per casing rules
- **Group headers** (when grouping options): Title Case (`Standard`, `Expressive`)

### Slider
- **Label** (required): per Control labels rule
- **Value display**: numeric + unit (`75%`, `0.30`, `Tone: {n}`)
- **End-cap labels** (optional, low/high): single word, Title Case (`Standard` / `Maximum`)
- **Contextual label switching** is allowed (e.g., `Tint level` ↔ `Desaturate level` based on active algorithm)

### Dropdown / Combobox
- **Label** (required): per casing rule
- **Placeholder**: `Search {things}...` (with ellipsis) for search inputs; `Select {thing}` for non-search
- **Empty state**: `No {things} found.` (period). Standardize: existing `No match.` and `No frameworks found.` and `No location found` → `No {x} found.` with period

### Input
- **Label** (required): per casing rule
- **Placeholder**: a representative example, never instructive text (label `Hex`, placeholder `#000000` — never `Enter hex value`)
- **Helper** (optional): explain format or constraint

### Button
- **Action labels**: verb-led, Title Case for two+ words, single word for single-word actions
  ✓ `Save` · `Cancel` · `Add` · `Delete` · `Save changes` · `Open the editor`
- **Destructive actions**: same form, no extra warnings on button itself
- **Never** `OK` or `Submit` in product surfaces

### Dialog
- **Title**: sentence case describing purpose — `Export theme`, `Add custom color`, `Edit custom color`, `Contrast audit`
- **Description** (optional, sub-title): one short sentence with period
- **Footer**: `Cancel` (left) + primary action (right). Primary action verb varies (`Add`, `Save`, `Continue`)

### Tooltip / Aria-label
- Verb-led when describing an action: `Unlock color`, `Lock current color`, `Reset palette`
- Descriptive noun phrase when labelling state/context: `CMF second source color`, `Settings`
- No period unless multi-sentence
- Aria-labels should match tooltip text where both exist for the same control

### Empty state
- `No {things} found.` — sentence, period, sentence case
- Or short imperative when actionable: `Pick an image to extract a color.`

### Toast
- Short past-tense action: `Copied` (no period), `Saved`, `Reset`
- Single line, no period unless multi-sentence

### Confirmation
- Question form: `Reset every source field to defaults?`
- Concrete about consequence. Never `Are you sure?`

---

## 5. Voice direction

**Anchors — match this voice (already on the page, propagate):**

> *"real HCT math, not an approximation"*
> *"Both layers stay in sync"*
> *"Generates shadcn role bindings alongside the MD3 theme — no second pass."*
> *"Shift hue toward source color for visual cohesion"*
> *"The full engine with no shortcuts"*
> *"Optional — drives the tertiary palette and nudges the error hue via CMF's formula."*

**Voice characteristics:**
- Confident without being marketing-y
- Specific over general (`WCAG AA compliant`, not `highly accessible`)
- Mechanistic where it earns trust (`Shift hue toward source color`, not `Smart blending for harmony`)
- Em-dashed structural rationale: `{statement} — {why}`
- Terse: three to seven words preferred for labels, one short sentence for helpers

**Do not write:**
- `Powerful` · `intuitive` · `seamlessly` · `robust` · `comprehensive` · `elegant` · `beautifully crafted`
- `Easy to use` · `designed for you` · `made with love`
- Anything implying the user is uninformed (`Even beginners can...`)

**Do write:**
- The mechanism in one phrase
- The consequence in one phrase
- Em dash between them when both fit on one line

---

## 6. Specific renames — actionable diff

CC: apply these renames across in-scope surfaces. Group changes by file in commits.

### 6.1 Section heading casing fixes

| File:line | Current | New |
|---|---|---|
| `apps/www/src/features/md-rail/index.tsx:19` | `Scheme Variant` | `Scheme variant` |
| `apps/www/src/features/surface-adjustment/surface-adjustment.tsx:19` | `Surface Adjustment` | `Surface adjustment` |
| `apps/www/src/features/md-rail/index.tsx:22` | `Fine Tune Palette` | `Fine-tune palette` |
| `apps/www/src/features/custom-colors/custom-color-list.tsx:58` | `Custom Colors` | `Custom colors` |
| `apps/www/src/features/custom-colors/custom-color-list.tsx:68` | `Custom Colors` | `Custom colors` |
| `apps/www/src/features/custom-colors/new-custom-color.tsx:145` | `Add Custom Color` | `Add custom color` |
| `apps/www/src/features/custom-colors/custom-color-list.tsx:229` | `Edit Custom Color` | `Edit custom color` |
| `apps/www/src/features/settings/settings.tsx` (aria-label) | — | `Settings` |
| `apps/www/src/features/settings/settings.tsx` (tooltip) | — | `Settings` |
| `apps/www/src/features/settings/settings.tsx` (popover heading) | — | `Settings` |

Note: the display-prefs feature was renamed to `features/settings/` after this rules pass. The old rows pointed at file:line locations that no longer exist; canonical strings updated to match the new feature's labels.

### 6.2 Control label casing fixes

| File:line | Current | New |
|---|---|---|
| `apps/www/src/features/surface-adjustment/surface-level-slider.tsx:46` | `Tint Level` | `Tint level` |
| `apps/www/src/features/surface-adjustment/surface-level-slider.tsx:46` | `Desaturate Level` | `Desaturate level` |

### 6.3 Reset verbiage consolidation

| File:line | Current | New |
|---|---|---|
| `apps/www/src/features/palette-override/animated-button-color-picker.tsx:208` | `Reset to MCU` | `Reset palette` |
| `apps/www/src/features/scheme-variant/cmf-second-source-picker.tsx:95` | `Reset to MCU default` | `Reset` |
| `apps/www/src/features/shadcn-rail/bindings-content.tsx:116` | `Reset to default` | `Reset binding` |
| `apps/www/src/features/contrast-level/index.tsx:40` | `Reset contrast to standard` | `Reset contrast` |
| `apps/www/src/features/color-roles-list/role-editor.tsx:66` | `Reset to MCU` | `Reset role` |
| `apps/www/src/features/testbed/reset-button.tsx:9` | `reset to defaults` | `Reset to defaults` (capitalize R) |

Leave alone (already correct):
- `apps/www/src/features/shadcn-rail/override-content.tsx:94` — `Reset override` (already specific)
- `apps/www/src/features/testbed/reset-button.tsx:11` — `Reset every source field to defaults?` (confirmation)

### 6.4 Aria-label / casing bug

| File:line | Current | New |
|---|---|---|
| `apps/www/src/features/shadcn-rail/soft-borders-toggle.tsx:31` | `enable soft border` | `Toggle soft borders` |

### 6.5 Helper text — grammar fixes

| File:line | Current | New |
|---|---|---|
| `apps/www/src/features/shadcn-rail/soft-borders-toggle.tsx:35` | `Replicates subtle border aesthetic of shadcn/ui.` | `Replicates the subtle border aesthetic of shadcn/ui.` |
| `apps/www/src/features/source-color/image-picker.tsx:65` | `Current color is locked, unlock to pick an image` | `Current color is locked. Unlock to pick an image.` |
| `apps/www/src/features/source-color/image-picker.tsx:66` | `Pick an image, prefer transparent background if you want to use logo` | `Pick an image. Prefer a transparent background if you're using a logo.` |

### 6.6 Em dash spacing fix

| File:line | Current | New |
|---|---|---|
| `apps/www/src/features/shadcn-rail/soft-borders-toggle.tsx:22-23` | `accessibility—keep an eye on the contrast checker to ensure your UI remains usable.` | `accessibility — keep an eye on the contrast checker to ensure your UI stays usable.` |

### 6.7 Empty-state normalization

| File:line | Current | New |
|---|---|---|
| `apps/www/src/features/shadcn-role-override/md-snapshot-picker.tsx:137` | `No match.` | `No tokens found.` |
| `apps/www/src/features/shadcn-rail/bindings-content.tsx:153` | `No match.` | `No tokens found.` |

Leave alone (already match pattern):
- `apps/www/src/features/tw-color-picker/tw-color-picker.tsx:149` — `No color found.`
- `apps/www/src/features/site-command-menu/site-command-menu.tsx:147` — `No results found.`

### 6.8 System naming fix

| File:line | Current | New |
|---|---|---|
| `apps/www/src/app/(site)/_features-section.tsx` (third card body) | `Generates shadcn role bindings alongside the md theme — no second pass.` | `Generates shadcn role bindings alongside the MD3 theme — no second pass.` |

Plus: audit any other occurrence of `md theme` or lowercase `md3` in user-facing copy (excluding HelpDialog/landing prose where `Material Design 3` is preferred) and normalize to `MD3`.

### 6.9 Hotkey format fix

**No explicit diffs.** The previous row in this slot targeted `useHotkey('Mod+C', …)` in `contrast-checker.tsx` and was incorrect — that string is a hotkey-library spec, not display copy, and rewriting it to `⌘+C` breaks the binding on non-Mac platforms. See §3.7 for the spec-vs-display rule.

**Audit (display strings only)** — grep `shortcut:`, `Kbd>` children, `meta: { description: … }`, and any user-visible string for `Mod+X` or `⌘X` (missing plus) forms; normalize visible UI to `⌘+X`. Bare letters (`E`, `S`, `H`, `D`) and tab digits stay as-is.

**Do not modify** any string passed to `useHotkey(...)`. That argument is functional, not copy.

### 6.10 Brand styling audit

Check and fix any `Tonex` capitalized in mid-sentence positions where `tonex` (lowercase) is correct per rule 3.4. Spot check:
- HelpDialog Q&A: `Tonex Color:` (Q "Why choose Tonex...") — phrase used as feature/product noun, leave Title Case for now. Flag for review in punch list.

---

## 7. Application notes for Claude Code

1. **Work per-surface, not per-rule.** Group changes by file/component, so each file is touched in one diff.
2. **Cite the rule.** In commit messages, name which rule each change implements: e.g., `labels: sentence-case section headings per conventions §3.1`.
3. **Don't touch out-of-scope surfaces.** Re-read §1 if unsure. If a string lives inside a sample block, it's out of scope.
4. **Don't invent new strings.** If a control has no current label and the rules suggest one should exist, flag it — don't add silently.
5. **Surface ambiguities.** If a string is in scope but its category is unclear (proper name vs descriptive, etc.), list it for review rather than guessing.
6. **Verify visually after.** Spot-check rendered UI for any string that was rendered uppercase via CSS — make sure lowercase rule changes still look right.

---

## 8. Out of this pass (separate punch list)

The following need editorial judgment, not pattern application — will be handled in a separate document after this rules pass lands:

- HelpDialog Q&A copy review (the 9 entries — light edits for tightness, consistency)
- Verify HelpDialog Q&A count: Track 1 recon said 10, Track 2 inventory transcribed 9. Confirm canonical count.
- Tooltip strings that explain mechanism — verify they match the actual mechanism per current code
- Landing page hero / features / CTA copy review (after rules normalize the chrome)
- The `Coming` / `Available now` structure in Q&A "Can I preserve my brand color while tweaking?" — verify against current feature state
- The `Tonex Color:` phrase in Q&A "Why choose Tonex" — decide if it should be a defined product term or restructured
- Awkward dynamic strings: `Maximum saturation reached for brightness (max {value})` — consider `Max saturation reached at this brightness ({value})`
- The `Copy/Export` button label (slash form) — decide whether to split or keep as exception
