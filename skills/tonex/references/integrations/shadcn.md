# Target: shadcn / Tailwind v4

`tonex generate --seed <hex> --to shadcn` authors a paste-ready `:root` / `.dark` block of oklch custom properties into **shadcn's own token names** — not the MD3 token names:

```
tonex generate --seed '#3b82f6' --to shadcn
```

```css
/* tonex generate --seed '#3b82f6' --variant cmf --to shadcn */

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

- **Both modes, one call.** The output carries `:root` (light) *and* `.dark` (dark); `--mode` is a no-op here. Paste the whole block into `globals.css`.
- **Leading recipe comment is the durable artifact.** The `/* tonex generate … */` line is the runnable command that reproduces this exact block (resolved knobs, so a later default change can't drift it). Keep it — it's how the next agent regenerates or extends the theme.
- **shadcn names, not MD3 names.** This renames the underlying MD3 tokens into shadcn's vocabulary — `on-primary` → `--primary-foreground`, `surface` → `--background`, plus shadcn-only slots (`--card`, `--muted`, `--accent`, `--destructive`). To **check** a shadcn pairing, feed these `--slot` names straight into `check --pairs` (`[["--primary-foreground","--primary"]]`) — they're valid input. To **adjust** the underlying tone, use the bare md role name (`on-primary`); `adjust` is md-only. See the map in [palette.md](../palette.md#token-naming-across-surfaces).
- **Encoding.** Defaults to oklch (shadcn v4's native form). `--format hex` for sRGB hex instead.

## Surface layering

`--binding <preset>` picks how shadcn's *surface* slots (`--card`, `--popover`, `--muted`, `--accent`, `--sidebar*`) route onto the md surface-elevation tiers — the depth/layering feel. shadcn-only (noted-and-ignored for other targets). It's **pure routing**: it doesn't touch the recipe (variant/surface/contrast), so the same seed re-projects into a different arrangement without re-deriving.

| preset | feel |
| --- | --- |
| `default` | balanced — a neutral surface mapping to start from |
| `clean` | flat — card, popover, and background share one layer |
| `mixed` | mode-aware — light and dark route to different layers |
| `layered` | stacked depth — each surface sits on its own elevation tier |
| `seamless` | subtle depth — cards lift gently, popovers blend into the page |

- **Contrast-safe across all five.** Each preset keeps every slot paired with its guaranteed on-color (`--card` → a surface tier, `--card-foreground` → `on-surface`), so the WCAG guarantee survives the reroute — the presets differ in elevation, not legibility.
- **`check` doesn't read `--binding`** — it gates the default routing. The presets are curated safe; if you ship a non-default one and want belt-and-suspenders, verify its slots with `check --pairs` using the **md tokens** they route to.
- **`--soft-borders` layers on top** of whichever binding is in play — it softens the edge roles (`--border`/`--input`/`--sidebar-border`) to the faint `outline-variant` tone, independent of the routing.

## End-to-end: theme a shadcn app at AAA

```
# 1. gate the seed at AAA
tonex check --seed '#3b82f6' --aaa
#   FAIL → find the remedy:
tonex check --seed '#3b82f6' --aaa --find-contrast
#   FOUND — AAA clears at --contrast 0.89

# 2. re-gate at the remedy level and confirm clean
tonex check --seed '#3b82f6' --aaa --contrast 0.89          # PASS, exit 0

# 3. author into shadcn at the SAME recipe, paste into globals.css
tonex generate --seed '#3b82f6' --contrast 0.89 --to shadcn
```

The recipe (`--seed … --contrast 0.89`) is identical across the gate and the projection — that's what keeps the shipped shadcn block the exact colors you gated.
