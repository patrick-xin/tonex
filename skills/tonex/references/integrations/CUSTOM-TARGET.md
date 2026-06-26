# Integrations — binding tonex into any target

**The general model — tonex emits roles, you bind them.** For any target without a built-in projection, use this file as the mapping cookbook. The role set and knobs are in [PALETTE.md](../PALETTE.md), reusable role-selection patterns are in [PATTERNS.md](../PATTERNS.md), and the hard rules are in [SKILL.md](../../SKILL.md).

`--to colors` prints the full role set. Map each role onto a target slot by *intent*, then prove every pairing with `check --pairs`. Names are a default, not a contract — bind the generated `secondary` as your primary or `tertiary` as an accent freely; the guarantee follows the pairing you check, not the name you keep. The roster is **core (28) by default**; widen with `--extended` only when the target has slots core lacks — see [PALETTE.md](../PALETTE.md#the-role-set---to-colors).

## The method — surface every usage, then bind

Start from the target's **actual color usage**, not its named slots. A slot manifest misses the literals buried in shadows, borders, gradients, and overlays — the values most likely to clash or fail. Five steps:

**1 — Surface all color usage.** Grep the whole artifact — templates, component CSS, inline styles — not just a `:root`/token block. Inventory every literal (`#hex`, `rgb/rgba/hsl`, named colors, gradient stops): where it appears and how it's used (solid fill, text, border, alpha overlay, shadow, gradient). This inventory, not the named slots, is what you bind; every entry must end up sourced from the recipe, none left hand-written.

**2 — Generate and read values.** `generate … --to colors` prints the full role set, both modes ([PALETTE.md](../PALETTE.md); `--extended` only for slots core lacks). Each value's tone is already gated against its paired surface — bind the value, don't re-pick lightness.

**3 — Build the binding map.** Map each usage to a role by **intent**, not name: action fill → `primary`, its text → `on-primary`, card → `surface-container`, muted text → `on-surface-variant`. A foreign slot that fuses what MD3 splits (one `--ink` = text + border + icon over several backgrounds) takes the token satisfying the **union** of its constraints — its strictest use. Role classes (accents are fills, containers backgrounds, inverse flips polarity) are in [PATTERNS.md](../PATTERNS.md#which-role-binds-safely-where-the-three-classes). The map is inert — it records decisions, changes nothing.

**4 — Alias the tokens.** *Invariant: every slot takes its mapped role's value; nothing stays hand-written.* Wiring depends on target capability:
- **Reference-capable** (CSS custom properties, DTCG aliases, token refs): point the foreign name at the token — `--ink: var(--on-surface)`. Live, self-documenting.
- **Literal-only** (inline hex, value-only JSON, SVG fills, email): resolve the role to a concrete value and write it in. No live link — the recipe metadata is the only record, so recording it is mandatory.

An overlay is a token + an alpha over a known background, never a hand-picked `rgba`: reference-capable → `color-mix(in srgb, var(--token) N%, transparent)`; literal-only → composite the token at that alpha yourself. Decorative overlays (shadows, washes) are contrast-exempt but still must be token-derived; a load-bearing overlay (carries text or a 3:1 boundary) is checked as its **composited effective color**, not the bare token.

**5 — Build and gate.** Emit the artifact last, after the map is complete, so no un-mapped literal slips through. Gate the final recipe with `check`, and every asserted foreign pairing with `check --pairs` (e.g. `check --seed '#3b82f6' --pairs '[["on-surface","surface"],["primary","surface"]]'`; exit `1` enumerates failing pairs — raise `--contrast` or re-pair, then re-check). Embed the exact `generate` command in the artifact's metadata.

The names you feed `check --pairs` and `adjust` come from one emitted layer — see [Token naming across surfaces](#token-naming-across-surfaces).

## Token naming across surfaces

Drive `check --pairs` with names from the emitted layer you're mapping. Drive `adjust` only with bare MD role names from `--to colors`. The `--` prefix is the tell: a bare name is an MD role, a `--`-prefixed name is a shadcn slot.

| token | `--to colors` key · `adjust` · `check --pairs` (md) | `--to shadcn` · `check --pairs` (shadcn) |
| --- | --- | --- |
| primary | `primary` | `--primary` |
| on-primary | `on-primary` | `--primary-foreground` |
| surface | `surface` | `--background` |
| on-surface | `on-surface` | `--foreground` |

- **md roles are bare** (`on-surface`) — exactly what `--to colors` prints. `adjust` takes these; `check --pairs` takes them for an md pairing. Don't assume foreign schema names such as Material JSON `onPrimary` are accepted unless `describe` says so.
- **shadcn slots keep the `--`** (`--foreground`, `--card`, `--muted`, `--destructive`) — exactly what `--to shadcn` prints. `check --pairs` takes these for a shadcn pairing (`adjust` is md-only).
- **One namespace per `--pairs` call.** Keep every pair within one layer — all bare MD roles **or** all `--`-shadcn slots, never mixed.
- The internal `--color-*` id is **not** an input — tonex rejects it and points you at the bare role name.

## Worked example — a literal-only target (React Email)

The **literal-only** branch of step 4: no `var()`, no `color-mix` — resolve roles to concrete hex and write them in, recipe lives in metadata. (A reference-capable target instead aliases foreign names onto the tokens and composites overlays with `color-mix`.)

React Email styles emails with a `<Tailwind>` component; its color surface is `theme.extend.colors`, consumed as utility classes (`bg-surface`, `text-on-surface`). The ~7-slot manifest:

| email slot | role | paired-against |
| --- | --- | --- |
| body / container bg | `surface` | the text on it |
| heading / body text | `on-surface` | `surface` |
| muted / footer text | `on-surface-variant` | `surface` |
| button fill | `primary` | button text |
| button text | `on-primary` | `primary` |
| link (as text) | `primary` | `surface` — **4.5:1 as text** |
| hr / border | `outline-variant` | — |

Three things the generic method doesn't carry, all target-specific:

- **Hex, not oklch** (`--format hex`) — Outlook's `oklch()` support is poor. The opposite of shadcn's default.
- **One delivered mode** — email has no `dark:` selector. `--to colors` still prints both modes; copy only the light values you bind, and scope `check --mode light` to match the shipped artifact.
- **Check the link-as-text pair.** A brand color that passes as a button *fill* can still fail as link *text* at 4.5:1 — the pairing a hand-picked hex most often breaks.

```
generate --seed '#7a517b' --to colors --format hex
check --seed '#7a517b' --mode light \
  --pairs '[["on-surface","surface"],["on-surface-variant","surface"],["on-primary","primary"],["primary","surface"]]'
```

