# Integrations — binding tonex into any target

**The general model — tonex emits roles, you bind them.** For any target without a built-in projection, use this file as the mapping cookbook. The role set and knobs are in [PALETTE.md](../PALETTE.md), reusable role-selection patterns are in [PATTERNS.md](../PATTERNS.md), and the hard rules are in [SKILL.md](../../SKILL.md).

`--to colors` prints the full role set. Map each role onto a target slot by *intent*, then prove every pairing with `check --pairs`. Names are a default, not a contract — bind the generated `secondary` as your primary or `tertiary` as an accent freely; the guarantee follows the pairing you check, not the name you keep. The roster is **core (28) by default**; widen with `--extended` only when the target has slots core lacks — see [PALETTE.md](../PALETTE.md#the-role-set---to-colors).

## The method — treat the target as a slot manifest

Find the target's color surface — a config object, a token file, a theme block, a set of CSS variables — and treat it as a list of `{ slot, intent, paired-against }`. Then, for each slot:

1. **Generate the roles.** `generate … --to colors` prints the full role set in both modes. The roster and knobs are in [PALETTE.md](../PALETTE.md); widen with `--extended` only when the target has slots core lacks (see [PALETTE.md](../PALETTE.md#the-role-set---to-colors)).
2. **Pick the token by intent.** MD3 tokens *are* the intent layer — a primary action fill is `primary`, its text `on-primary`, a card surface `surface-container`. The token's value already carries the tone tonex guaranteed against its paired surface, so don't re-pick lightness; read the value and bind it.
3. **Verify every pairing.** A foreign target fuses what MD3 splits: one `--ink` slot can be text *and* border *and* icon over several backgrounds, so its value has to satisfy the **union** of contrast constraints across every background it touches. Gate token-name pairs with the seed recipe, for example `check --seed '#3b82f6' --pairs '[["on-surface","surface"],["primary","surface"]]'`. Exit `1` enumerates the failing pairs, so raise `--contrast` or pick a higher-contrast token for that slot and re-check ([CONTRAST.md](../CONTRAST.md)).

Map a fused slot to the token that satisfies its *strictest* use — that cardinality mismatch (MD3 splits, dumb targets fuse) is the lossy part of any binding. Before mapping, know what *kind* of tone each role is: accents are fills, containers are backgrounds, inverse flips polarity. The three role classes and where each binds safely are in [PATTERNS.md](../PATTERNS.md#which-role-binds-safely-where-the-three-classes).

The token names you feed `check --pairs` and `adjust` come from one emitted layer — see [Token naming across surfaces](#token-naming-across-surfaces) below.

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

## Worked example — a target with no built-in (React Email)

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

