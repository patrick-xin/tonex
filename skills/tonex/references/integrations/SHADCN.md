# Target: shadcn / Tailwind v4

`generate --seed <hex> --to shadcn` authors a paste-ready `:root` / `.dark` block of oklch custom properties under **shadcn's own token names**, not MD3's:

```
generate --seed '#3b82f6' --to shadcn
```

```css
/* generate --seed '#3b82f6' --variant cmf --to shadcn */

:root {
  --background: oklch(0.9838 0.0079 286.25);
  --foreground: oklch(0.3184 0.0479 264.22);
  --card: oklch(0.9484 0.0246 275.91);
  --card-foreground: oklch(0.3184 0.0479 264.22);
  --popover: oklch(0.9484 0.0246 275.91);
  --popover-foreground: oklch(0.3184 0.0479 264.22);
  --primary: oklch(0.492 0.18 257.73);
  --primary-foreground: oklch(0.9819 0.0093 292.8);
  --secondary: oklch(0.8463 0.0755 266.57);
  --secondary-foreground: oklch(0.3866 0.0786 262.73);
  --muted: oklch(0.8894 0.046 269.16);
  --muted-foreground: oklch(0.4865 0.0476 266.59);
  --accent: oklch(0.9142 0.0411 270.46);
  --accent-foreground: oklch(0.3184 0.0479 264.22);
  --destructive: oklch(0.504 0.1571 26.79);
  /* … */
}
/* .dark { … } follows in the same block */
```

- **Both modes, one call.** The output carries `:root` (light) *and* `.dark`; `--mode` is a no-op here. Paste the whole block into `globals.css`.
- **shadcn names, not MD3 names.** This renames the underlying MD3 tokens into shadcn's vocabulary — `on-primary` → `--primary-foreground`, `surface` → `--background`, plus shadcn-only slots (`--card`, `--muted`, `--accent`, `--destructive`). `check --pairs` takes the `--slot` names as direct input (`[["--primary-foreground","--primary"]]`); to retune a tone, use the bare md role (`on-primary`). Don't mix `--`-slots and bare md roles in one `--pairs` call — full map and the namespace rule in [CUSTOM-TARGET.md](CUSTOM-TARGET.md#token-naming-across-surfaces).
- **Encoding.** oklch by default (shadcn v4's native form); `--format hex` for sRGB.

## Surface layering

`--binding <preset>` picks how shadcn's *surface* slots (`--card`, `--popover`, `--muted`, `--accent`, `--sidebar*`) route onto the md surface-elevation tiers — the depth/layering feel. It's shadcn-only (noted-and-ignored elsewhere) and **pure routing**: it doesn't re-derive the palette (variant/surface/contrast), but it is part of the projection recipe and must stay in the delivered command.

| preset | feel |
| --- | --- |
| `default` | balanced — a neutral surface mapping to start from |
| `clean` | flat — card, popover, and background share one layer |
| `mixed` | mode-aware — light and dark route to different layers |
| `layered` | stacked depth — each surface sits on its own elevation tier |
| `seamless` | subtle depth — cards lift gently, popovers blend into the page |

Every preset keeps each slot paired with its guaranteed on-color (`--card` → a surface tier, `--card-foreground` → `on-surface`), so presets differ in elevation, not intended legibility. The whole-theme `check` gates the palette pairings, not every shadcn projection preset. Keep non-default `--binding` and `--soft-borders` in the delivered `generate` command; do not invent a manual route table unless the CLI exposes one through `describe` or output metadata. `--soft-borders` layers on top of any binding, softening the edge roles (`--border`/`--input`/`--sidebar-border`) to the faint `outline-variant` tone.

## End-to-end: theme a shadcn app at AAA

```
# 1. gate the seed at AAA; if it fails, find the remedy
check --seed '#3b82f6' --aaa
check --seed '#3b82f6' --aaa --find-contrast      # → AAA clears at --contrast 0.89

# 2. re-gate at the remedy and confirm clean
check --seed '#3b82f6' --aaa --contrast 0.89      # PASS, exit 0

# 3. author into shadcn at the SAME recipe, paste into globals.css
generate --seed '#3b82f6' --contrast 0.89 --to shadcn
```

The recipe (`--seed … --contrast 0.89`) is identical across the gate and the projection — that's what keeps the shipped block the exact colors you gated.
