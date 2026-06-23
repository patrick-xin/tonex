# tonex — the palette

How to **shape** the palette: the role set, the variant and surface knobs that derive it, and how to read its oklch values. Companion to [SKILL.md](../SKILL.md); for how role names land on a target's slots, see [CUSTOM-TARGET.md](integrations/CUSTOM-TARGET.md). The authoritative flag contract is always `describe`; this file is the judgment the contract can't encode.

## The role set (`--to colors`)

```
generate --seed '#3b82f6' --to colors
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

`--to colors` prints the **full role set, both modes** — the universal output.

- Any color surface can consume this raw palette.
- `--to shadcn|yaml|json` are convenience projections that pre-bind the same role set for popular consumers.
- For every other target, bind roles→slots yourself — the how-to is in [CUSTOM-TARGET.md](integrations/CUSTOM-TARGET.md).
- Treat this output as a **throwaway rendering, not a manifest**. Nothing reads it back; the durable source of truth is the recipe in the delivered artifact, not a separate `colors.json`.

- **Body re-derives from the header.** Every value under `light`/`dark` comes from the header inputs. If you do keep this around while mapping, never hand-edit a value into the body — the next regenerate discards it.
- **Both modes, always.** Unlike `--to yaml`, this rendering is not single-mode; `--mode` is ignored.
- **Core roster by default; `--extended` widens it.** The roster is a *capacity ladder*, not a taxonomy. The default 28 **core** roles (the accents, their containers, the full `surface-container-*` family, outlines) are the sufficient baseline for most projects. `--extended` adds the 22 **extended** roles (`*-fixed`, `*-dim`, `inverse-*`, `surface-tint`, `shadow`, `scrim`) — reach for it only when a target has slots core doesn't cover (inverted surfaces, modal scrims, tones that hold across modes). The question is "does core cover this project's slots?", not "is this a Material feature?". You know the project, so tell the user `--extended` exists and let them opt in rather than defaulting to the wider set.
- **One encoding per rendering**, chosen by `--format oklch|hex`. To re-encode, re-run with the other format — don't convert values yourself.

## A role is the seed re-toned, not the seed

A role carries the seed's hue and chroma; only its **lightness** is reassigned for the job it has to do. `primary` is the seed re-toned to sit legibly on `surface`; `primary-container` is the same brand color re-toned lighter to hold `on-primary-container` text. The seed's character survives in every role — what moves is the tone, so the pair clears WCAG.

- **Do** read a role as "the brand color, tuned for this slot." The whole point of the engine is that you don't pick tones by eye — it reassigns lightness so each pairing is legible.
- **Don't** expect `primary` or `primary-container` to come back equal to the seed hex. They won't, and that's not drift — they're the seed re-toned for contrast. If you wanted the literal seed back, you wouldn't need an engine.
- **Don't** treat a re-toned `primary` as a different color and reach for a fresh hue. It's the same color doing a different job; switching the variant or knob changes the *feel*, not which color it is.

When the literal seed is genuinely the requirement — a logo fill, a brand mark, a deliberate brand moment — that's an escape hatch, not the default: see [CONTRAST.md § The literal-brand escape hatch](CONTRAST.md#the-literal-brand-escape-hatch).

## Choosing a variant

`--variant` picks the algorithm that derives the system from the seed. Default is **`cmf`** (the latest Material color spec scheme) — keep it unless the user asks for a different feel. It does three things no standard variant does: a **seed-tone-faithful primary** (a light seed yields a light primary; every other variant snaps primary to a fixed lightness), **colored surfaces** that carry real brand hue instead of near-neutral grey (kept legible by dynamic contrast), and it's the **only variant that reads `--second-color`** (see below). The ten variants fall into four groups — this table mirrors `describe`'s `variants` field (the authoritative group→variant map):

| group | feel | variants |
| --- | --- | --- |
| `cmf` | seed-tone-faithful primary · colored surfaces · reads `--second-color` | `cmf` |
| `standard` | source-faithful — stays close to the seed | `tonalSpot`, `fidelity`, `content` |
| `expressive` | high-chroma, playful — intentionally diverges from the seed | `vibrant`, `expressive`, `rainbow`, `fruitSalad` |
| `subdued` | low-chroma / near-grayscale | `neutral`, `monochrome` |

You can't *see* the output, so don't assert a variant "looks" a certain way — **verify**. Generate two and compare the primary's chroma (see [Reading oklch values](#reading-oklch-values)):

```
generate --seed '#3b82f6' --variant cmf --to colors
generate --seed '#3b82f6' --variant vibrant --to colors
# compare the primary's chroma (the middle oklch number) — the higher one is the more vivid variant
```

Switch groups only on explicit user intent — "more vivid" → `expressive`, "muted/calm" → `subdued`. Absent that, `cmf`.

### A second source color (`--second-color`, cmf only)

`cmf` is the only variant that reads a **second** source color. Pass a second brand hex (or oklch) and MCU rebuilds the **tertiary** palette from its hue+chroma and shifts the **error** hue — `primary` and `secondary` stay derived from `--seed`. Reach for it when the brand has two colors and you want the second to drive the tertiary accent:

```
generate --seed '#3b82f6' --second-color '#ff8800' --to colors
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

`--tint-palette` picks the neutral identity (default `zinc`), only consumed when `--tint` is set. The values are the Tailwind v4 neutrals (`slate`, `gray`, `zinc`, `neutral`, `stone`) plus four project-extended ones (`taupe`, `mauve`, `mist`, `olive`); `describe` carries the full enum. You can't see the result, so don't pick by adjective — the choice only matters near `--tint 0`, where the output is the pure chosen palette at each token's MCU tone. At level 1 the surfaces converge toward the primary's hue regardless of palette.

**The knobs barely move contrast.** Both pin each token's *tone* and change only hue/chroma, so WCAG ratios mostly track the same luminance relationship across the `0→1` range. A surface knob won't break a comfortably-passing theme. Re-gate anyway (the recipe changed, and `check` is one command): a light-mode accent-on-`surface` pair already sitting at the AA edge can still wobble by a fraction.

## Reading oklch values

Values are `oklch(L C H)`: **L** = lightness/tone (0–1), **C** = chroma (how colorful, ~0–0.37), **H** = hue (degrees). You can't see color, but you can compare these numbers — a higher **C** is more saturated, a lower **L** is darker. That's how you compare two variants, or confirm an `adjust` landed: read the axis, don't guess the look.

## End-to-end examples

End-to-end walkthroughs live with their target, since each is target-specific — e.g. theming a shadcn app at AAA is in [integrations/SHADCN.md](integrations/SHADCN.md#end-to-end-theme-a-shadcn-app-at-aaa).
