# tonex — the palette

How to **shape** the palette: the role set, the variant and surface knobs that derive it, and how its tokens are named. Companion to [SKILL.md](../SKILL.md). The authoritative flag contract is always `tonex describe`; this file is the judgment the contract can't encode.

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

**The knobs don't move contrast.** Both pin each token's *tone* and change only hue/chroma — and WCAG ratios are tone-driven, so they barely shift across the whole `0→1` range. A surface knob won't break a comfortably-passing theme. Re-gate anyway (the recipe changed, and `check` is one command): a light-mode accent-on-`surface` pair already sitting at the AA edge can still wobble by a fraction.

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

Add `--json` to `check` and `adjust` for machine-readable output. Contrast policy, exit codes, and the `adjust` remedy live in [contrast.md](contrast.md).

## End-to-end examples

End-to-end walkthroughs live with their target, since each is target-specific — e.g. theming a shadcn app at AAA is in [integrations/shadcn.md](integrations/shadcn.md#end-to-end-theme-a-shadcn-app-at-aaa).
