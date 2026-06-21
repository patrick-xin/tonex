# Integrations — binding tonex into any target

This folder is the **integrations catalog**. The built-in targets each have a file beside this one — [shadcn.md](shadcn.md), [design-md.md](design-md.md), [json.md](json.md); this README is the **general method** they're shortcuts of. `--to shadcn|yaml|json` are not separate machinery; they are **pre-baked shortcuts of this method** for three popular consumers. For everything else — an email tool, a component library, a slide deck, a custom design system, another skill you're driving — you run the method by hand. That is the skill's job, not the CLI's.

## The rule

When you integrate with another tool or skill:

1. **Figure out how it consumes color** — find its color surface: a config object, a token file, a theme block, a set of CSS variables. List its slots and what each is *for*.
2. **`tonex generate … --to colors`** — get the role set (read [palette.md](../palette.md) for the roster and `--extended`).
3. **Map roles → slots by intent** (below).
4. **`tonex check --pairs`** — prove every pairing you asserted ([contrast.md](../contrast.md)).

The names don't bind you; the contrast guarantee follows the *pairing you check*, not the role name you keep.

## The method — treat the target as a slot manifest

Treat the target's color surface as a **slot manifest**: a list of `{ slot, intent, paired-against }`. For each slot:

1. **Pick the token by intent.** MD3 tokens *are* the intent layer — a "primary action fill" is `primary`, its text `on-primary`, a card surface `surface-container`. Read the value from `--to colors`. The name→intent match is the default; if you'd rather drive the UI from `secondary` or `tertiary`, do it — what you can't skip is step 3.
2. **The tone is already fixed.** You don't choose lightness — the token's value already carries the contrast tonex guaranteed against its paired surface. Don't re-pick it.
3. **Verify every pairing you assert.** A foreign target fuses what MD3 splits — one `--ink` slot may be text *and* border *and* icon over several backgrounds. That slot's value must satisfy the **union** of contrast constraints across *every* background it touches. After mapping, gate it:
   ```
   tonex check --seed '#3b82f6' --pairs '[["on-surface","surface"], …]'
   ```
   Exit `1` enumerates the failing pairs; pick a higher-contrast token for that slot, or raise `--contrast`, and re-check.

Before mapping, know what *kind* of tone each role is — accents work as fills, containers are backgrounds, inverse flips polarity. The three role classes and where each binds safely are in [patterns.md](../patterns.md#which-role-binds-safely-where-the-three-classes).

The cardinality mismatch (MD3 splits, dumb targets fuse) is the lossy part. When in doubt, map a fused slot to the token that satisfies its *strictest* use, then prove it with `check --pairs`.

Finally, **record the recipe** — the exact `generate` command — in the file you write (a comment header). The recipe reproduces the role *values*; the mapping you just made is reproduced by the slots in the file itself. A later agent re-runs the recipe and re-applies the same mapping; without the recipe in the file, your binding is unrecoverable once the conversation is gone.

## Worked example — React Email (`<Tailwind>` config)

*Illustrative: this is the method applied to one tool, not a catalog entry. Any target follows the same four steps.*

React Email styles emails with a `<Tailwind>` component; its color surface is the config's `theme.extend.colors` map, consumed as utility classes (`bg-surface`, `text-on-surface`). A small (~7-slot) manifest:

| email slot | utility today | role | paired-against |
| --- | --- | --- | --- |
| body / container bg | `bg-gray-100`, white | `surface` | the text on it |
| heading / body text | `text-gray-800` | `on-surface` | `surface` |
| footer / muted text | gray-500 | `on-surface-variant` | `surface` |
| button fill | `bg-brand` | `primary` | button text |
| button text | `text-white` | `on-primary` | `primary` |
| **link (text)** | brand | `primary` | `surface` — **4.5:1 as text** |
| hr / border | gray-200 | `outline-variant` | — |

Four target-specific gotchas the generic method doesn't carry:

1. **Hex, not oklch.** Email clients (Outlook especially) have poor `oklch()` support — emit `--format hex`. This is the *opposite* of shadcn's oklch default.
2. **Single mode.** Email has no `dark:` selector; pick one mode with `--mode light` (like design.md).
3. **Replace the stock grays.** The value-add is swapping React Email's default `bg-gray-100` / `text-gray-800` for seed-derived `surface` / `on-surface` — neutrals that carry the brand instead of generic Tailwind grey.
4. **Check the link-as-text pair.** A brand color that passes as a button *fill* can fail as link *text* (4.5:1). It's the pairing a hand-picked hex most often breaks.

```
# 1. gate the mode the email ships
tonex check --seed '#7a517b' --mode light

# 2. author the role set as hex, one mode
tonex generate --seed '#7a517b' --to colors --format hex --mode light

# 3. bind the roles into theme.extend.colors (surface, on-surface, on-surface-variant,
#    primary, on-primary, outline-variant) — drop a recipe comment at the top of the file:
#    // tonex generate --seed '#7a517b' --to colors --format hex --mode light

# 4. verify the pairings — note the link-as-text pair ["primary","surface"]
tonex check --seed '#7a517b' --mode light \
  --pairs '[["on-surface","surface"],["on-surface-variant","surface"],["on-primary","primary"],["primary","surface"]]'
```

**The example is illustrative; the method is the product.** Don't grow this file into a per-tool catalog (a MUI section, a Stripe section…) — that rebuilds the per-tool explosion the general method exists to avoid. New target → run the four steps; add a worked example here only if a tool surfaces a genuinely new *class* of gotcha.
