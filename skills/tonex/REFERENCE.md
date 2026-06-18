# tonex — reference

Companion to [SKILL.md](SKILL.md). The authoritative flag contract is always `tonex describe`; this file is the judgment the contract can't encode.

## The role set (`--to colors`)

```
tonex generate --seed '#3b82f6' --to colors
```

```jsonc
{
  "seed": "#3b82f6",
  "variant": "cmf",
  "contrast": 0,
  "surface": { "algo": "desaturate", "level": 0 },
  "format": "oklch",           // the rendering declares its own encoding
  "light": { "primary": "oklch(0.492 0.18 257.73)", "on-primary": "…", /* 28 core roles */ },
  "dark":  { "primary": "…", /* same 28 roles */ }
}
```

`--to colors` prints the **full role set, both modes** — the universal output. This raw palette is what *any* color surface consumes: a shadcn app, a deck, an email, a chart, a foreign tool's theme. The `--to shadcn|yaml|json` formats are not the boundary of what tonex can color — they're conveniences that pre-bind this same role set for popular consumers. For everything else you read `--to colors` and bind roles→slots yourself. It is a **throwaway rendering, not a manifest**: nothing in the toolchain reads it back, so don't commit it or treat it as a source of truth. The durable source of truth is the **recipe** (the `generate` command), and it travels with the *delivered* file (see each target's reference), never in a separate `colors.json`.

- **Body re-derives from the header.** Every value under `light`/`dark` comes from the header inputs. If you do keep this around while mapping, never hand-edit a value into the body — the next regenerate discards it.
- **Both modes, always.** Unlike `--to yaml`, this rendering is not single-mode; `--mode` is ignored.
- **Core roster by default; `--extended` widens it.** The roster is a *capacity ladder*, not a taxonomy. The default 28 **core** roles (the accents, their containers, the full `surface-container-*` family, outlines) are the sufficient baseline for most projects. `--extended` adds the 22 **extended** roles (`*-fixed`, `*-dim`, `inverse-*`, `surface-tint`, `shadow`, `scrim`) — reach for it only when a target has slots core doesn't cover (inverted surfaces, modal scrims, tones that hold across modes). The question is "does core cover this project's slots?", not "is this a Material feature?". You know the project, so tell the user `--extended` exists and let them opt in rather than defaulting to the wider set. (A further rung — raw palette tones 0..100 — isn't exposed yet.)
- **One encoding per rendering**, chosen by `--format oklch|hex`. To re-encode, re-run with the other format — don't convert values yourself.

## Choosing a variant

`--variant` picks the algorithm that derives the system from the seed. Default is **`cmf`** — keep it unless the user asks for a different feel. The ten variants fall into four groups — this table mirrors `tonex describe`'s `variants` field (the authoritative group→variant map; trust it if they ever disagree):

| group | feel | variants |
| --- | --- | --- |
| `cmf` | modern fidelity — balanced, stands structurally apart (extra roles, fixed colors) | `cmf` |
| `standard` | source-faithful — stays close to the seed | `tonalSpot`, `fidelity`, `content` |
| `expressive` | high-chroma, playful — intentionally diverges from the seed | `vibrant`, `expressive`, `rainbow`, `fruitSalad` |
| `subdued` | low-chroma / near-grayscale | `neutral`, `monochrome` |

You can't *see* the output, so don't assert a variant "looks" a certain way — **verify**. Generate two and compare the primary's chroma (see [Reading oklch values](#reading-oklch-values)):

```
tonex generate --seed '#3b82f6' --variant cmf --to colors
tonex generate --seed '#3b82f6' --variant vibrant --to colors
# compare the primary's chroma (the middle oklch number) — the higher one is the more vivid variant
```

Switch groups only on explicit user intent — "more vivid" → `expressive`, "muted/calm" → `subdued`. Absent that, `cmf`.

### A second source color (`--second-color`, cmf only)

`cmf` is the only variant that reads a **second** source color. Pass a second brand hex (or oklch) and MCU rebuilds the **tertiary** palette from its hue+chroma and shifts the **error** hue — `primary` and `secondary` stay derived from `--seed`. Reach for it when the brand has two colors and you want the second to drive the tertiary accent:

```
tonex generate --seed '#3b82f6' --second-color '#ff8800' --to colors
# tertiary now derives from the orange; primary/secondary unchanged
```

- **It is not the MD3 `secondary` role.** That role stays a tonal sibling of the seed; `--second-color` only touches `tertiary` + `error`. Don't reach for it expecting a second *primary*.
- **cmf only.** On any other variant it's a usage error (exit 2), not a silent no-op — the other schemes ignore a second source, so tonex refuses rather than derive a theme that quietly ignored your flag.
- It accepts the same input as `--seed` (hex or canonical oklch) and rides in the recipe, so a second-source theme reproduces exactly.

## Surface knobs: tint and desaturate

Both make a too-tinted background less colorful, but they are **not inverses** — opposite zero-points, different mechanisms. Reach for one only when the default surface carries too much of the seed's hue:

| | `--tint <0..1>` | `--desaturate <0..1>` |
| --- | --- | --- |
| `0` | **maximum** effect — repaints surfaces with the chosen neutral palette, no brand character | **no-op** — MCU surfaces untouched |
| `1` | that neutral nudged back toward the primary's hue | chroma forced to 0 (fully neutral) |
| mechanism | swaps in a chosen neutral identity, blends brand hue back | scales MCU's chroma down on its own hue |

So `--tint 0` and `--desaturate 0` do **opposite** things — they are not one knob with a sign. `desaturate` drains the brand out of MCU's own surface; `tint` replaces the surface with a fixed neutral and dials brand back in. Pass one, never both.

`--tint-palette` picks the neutral identity (default `zinc`). Only consumed when `--tint` is set:

| palette | character |
| --- | --- |
| `slate` | cool blue-grey |
| `gray` | neutral grey |
| `zinc` | neutral grey, slightly warmer (default) |
| `neutral` | true neutral |
| `stone` | warm grey |
| `taupe` | warm beige |
| `mauve` | muted violet |
| `mist` | cool blue-grey, lighter |
| `olive` | warm yellow-green |

The palettes are Tailwind v4 neutrals (plus four project-extended ones: `taupe`, `mauve`, `mist`, `olive`). At `--tint 0` the output is the pure chosen palette at each token's MCU tone, so the choice matters most near level 0 — at level 1 the surfaces converge toward the primary's hue regardless.

## Reading oklch values

Values are `oklch(L C H)`: **L** = lightness/tone (0–1), **C** = chroma (how colorful, ~0–0.37), **H** = hue (degrees). You can't see color, but you can compare these numbers — a higher **C** is more saturated, a lower **L** is darker. That's how you compare two variants, or confirm an `adjust` landed: read the axis, don't guess the look.

## Token naming across surfaces

Drive `adjust` and `check --pairs` with the **exact name you read from the output you're mapping** — no renaming. The `--` prefix is the tell: a bare name is an md role, a `--`-prefixed name is a shadcn slot.

| token | `--to colors` key · `adjust` · `check --pairs` (md) | `--to shadcn` · `check --pairs` (shadcn) |
| --- | --- | --- |
| primary | `primary` | `--primary` |
| on-primary | `on-primary` | `--primary-foreground` |
| surface | `surface` | `--background` |
| on-surface | `on-surface` | `--foreground` |

- **md roles are bare** (`on-surface`) — exactly what `--to colors` prints. `adjust` takes these; `check --pairs` takes them for an md pairing.
- **shadcn slots keep the `--`** (`--foreground`, `--card`, `--muted`, `--destructive`) — exactly what `--to shadcn` prints. `check --pairs` takes these for a shadcn pairing (`adjust` is md-only). A single `--pairs` call must stay within one layer — don't mix a bare md role with a `--slot`.
- The internal `--color-*` id is **not** an input — tonex rejects it and points you at the bare role name.

## Authoring into a target with no built-in projection

`--to shadcn|yaml|json` are the built-in projections — each has its own guide: [shadcn](references/shadcn.md), [design.md](references/design-md.md), [json](references/json.md). For any other target you build the projection by hand — this is the skill's job, not the CLI's.

Treat the target's color surface as a **slot manifest**: a list of `{ slot, intent, paired-against }`. For each slot:

1. **Pick the token by intent.** MD3 tokens *are* the intent layer — a "primary action fill" is `primary`, its text is `on-primary`, a card surface is `surface-container`, etc. Read the value from the `--to colors` output. This name→intent match is the *default*, not a rule: if you'd rather drive the UI from the generated `secondary` or `tertiary`, do it — the names don't bind you. What you can't skip is step 3: the guarantee covers the pairing you check, whatever roles it's between.
2. **The tone is already fixed.** You don't choose lightness — the token's value already carries the contrast tonex guaranteed against its paired surface. Don't re-pick it.
3. **Verify every pairing you assert.** A foreign target fuses what MD3 splits — one `--ink` slot may be text *and* border *and* icon over several backgrounds. That slot's value must satisfy the **union** of contrast constraints across *every* background it touches. After mapping, gate it:
   ```
   tonex check --seed '#3b82f6' --pairs '[["on-surface","surface"], …]'
   ```
   Exit `1` enumerates the failing pairs; pick a higher-contrast token for that slot, or raise `--contrast`, and re-check.

The cardinality mismatch (MD3 splits, dumb targets fuse) is the lossy part. When in doubt, map a fused slot to the token that satisfies its *strictest* use, then prove it with `check --pairs`.

Finally, **record the recipe** — the exact `generate` command — in the file you write (a comment header). The recipe reproduces the role *values*; the mapping you just made is reproduced by the slots in the file itself. A later agent re-runs the recipe and re-applies the same mapping; without the recipe in the file, your binding is unrecoverable once the conversation is gone.

## Contrast policy (what `check` blocks vs. warns)

This table and the thresholds below mirror `tonex describe`'s `contrast` field (the authoritative policy + numbers; trust it if they ever disagree). What's here is the *interpretation* the field can't carry.

| pair kind | verdict | effect on exit code |
| --- | --- | --- |
| text on its background | **block** | failure → exit `1` |
| non-text (borders, large UI) | warn | advisory, never blocks |
| decorative | exempt | not evaluated |

- Default bar is **AA**; `--aaa` raises it. `--large` uses large-text thresholds for the ad-hoc `<fg> <bg>` / theme-free `--pairs` forms.
- The theme-free forms (`<fg> <bg>` and `--pairs` without `--seed`) accept each color as a **6-digit hex or canonical `oklch(L C H)`** — paste a shadcn/tweakcn oklch straight in. An out-of-gamut oklch is gamut-mapped to sRGB before scoring, and the verdict echoes that projected hex (the color actually scored).
- `--mode light|dark` scopes the audit to one projection (default: both, the stricter union). Scope it when you only emitted one mode (e.g. a single-mode design.md `colors:` block) so the gate matches what you shipped.
- The remedy ladder for a text failure: `--find-contrast` to get the minimum `--contrast` → re-generate → re-check. If `UNREACHABLE`, gate at AA.

## Exit-code playbook

The codes mirror `tonex describe`'s `exitCodes` (authoritative; trust it if they ever disagree). The *response* to each is the judgment below.

| exit | meaning | what to do |
| --- | --- | --- |
| `0` | clean / output produced | proceed |
| `1` | a text pair fails WCAG — the *artifact* is wrong | apply a color remedy: `--find-contrast` then raise `--contrast`, or re-pair the slot to a higher-contrast token. **Never** ship the artifact. |
| `2` | usage/input error — the *call* is wrong | fix the flags/JSON. tonex prints a did-you-mean for typo'd flags and unknown token names. |

Don't collapse `1` and `2` — they demand opposite responses (fix the colors vs. fix the command).

## Adjusting one token

Nudge a single token without re-seeding the whole theme:
```
tonex adjust --seed '#3b82f6' --shifts '[{"mode":"dark","token":"primary","dTone":5}]'
# → dark  primary  #6e9fff → #86adff   req t+5 c+0   got t+4.99 c-6.78
```
It shifts named tokens by a relative ±HCT delta and prints before/after plus the **gamut-clamped achieved** delta (so a clamp shows up in the numbers). It **never gates contrast** — re-run `check` afterward (decision tree step 3).

## Command cheat-sheet

| command | purpose |
| --- | --- |
| `generate --seed <hex> --to <target>` | derive + print one projection (`colors`/`shadcn`/`yaml`/`json`) |
| `check --seed <hex> [--aaa] [--mode]` | gate the whole theme's contrast (the authoritative WCAG verdict) |
| `check --seed <hex> --find-contrast` | report the minimum `--contrast` that clears the level |
| `check --seed <hex> --pairs '<json>'` | verify specific `[fg, bg]` token-name pairings |
| `check <fg> <bg>` / `check --pairs '<json>'` (no `--seed`) | theme-free ad-hoc check; each color is hex or oklch |
| `adjust --seed <hex> --shifts '<json>'` | shift named tokens by a ±HCT delta (facts only; never gates) |
| `describe` | the machine-readable contract (commands, flags, contrast policy, exit codes) |

Add `--json` to `check` and `adjust` for machine-readable output.

## End-to-end examples

End-to-end walkthroughs live with their target, since each is target-specific — e.g. theming a shadcn app at AAA is in [references/shadcn.md](references/shadcn.md#end-to-end-theme-a-shadcn-app-at-aaa).
