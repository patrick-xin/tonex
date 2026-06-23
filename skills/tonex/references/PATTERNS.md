# tonex — patterns & best practices

Reusable binding patterns after you've identified a target's slot manifest. Start with the general method in [integrations/CUSTOM-TARGET.md](integrations/CUSTOM-TARGET.md), then use these patterns to choose safer role→slot mappings.

## Which role binds safely where (the three classes)

Before mapping a role onto a slot, know what *kind* of tone it is. This is MD3 tonal structure, so it holds across seeds — but `check --pairs` still proves the specific pairing:

- **Accents** — `primary` / `secondary` / `tertiary` are foreground tones: safe as a fill, icon, or label directly on the `surface` / `surface-container-*` ramp in both modes. Light-mode margins run tight (often barely over AA, no AAA headroom) — verify, don't assume slack.
- **Containers** — `*-container` are *background* tones, sat near surface luminance on purpose. Use them as the fill with their own `on-*-container` as the text on top — **never** as a foreground on `surface` (it lands ~1–2:1, invisible).
- **Inverse** — `inverse-surface` flips polarity; pair it only with `inverse-on-surface`. Accent and normal `on-*` tones don't separate from it.

A quick way to confirm a non-obvious pairing before you commit to it:

```
check --seed '#3b82f6' --pairs '[["secondary","surface"],["tertiary","surface-container-high"]]'
```

## State and semantic colors (success, warning, info)

`error` is **already a built-in role** (`error`, `on-error`, `error-container`, `on-error-container`) — don't re-add it. For the rest, add them with `--custom` so they derive and contrast-check like every other role. The custom hex values must come from the user, existing project tokens, or explicit confirmation; don't invent semantic colors silently.

```bash
CUSTOM='[{"name":"success","hex":"#22c55e"},{"name":"warning","hex":"#f59e0b"}]'
generate --seed '#3b82f6' --custom "$CUSTOM" --to colors
check --seed '#3b82f6' --custom "$CUSTOM"
```

Use the same `--custom` JSON in `generate` and `check`; it is part of the final recipe.

- MCU **harmonizes** each hex toward the seed so the state colors belong to the family. Keep the default `blend: true` unless the user explicitly says the value must remain literal/exact (a logo green, a regulated brand red); then set `"blend": false` for that entry.
- Each custom color derives a full **4-role MD group** (`success`, `on-success`, `success-container`, `on-success-container`) plus a shadcn pair (`--success` / `--success-foreground`). `check` gates them like anything else, so an unsafe custom hex blocks at exit 1.
- `shadcnSource` picks which pair feeds the shadcn slot: `"color"` (default) = the vivid fill (like `--primary` — a solid button), `"container"` = the muted background tone (a soft banner/badge). Other formats emit the derived roles according to their target shape.
- `--to colors` also carries the custom **definitions** (source hex + blend flag) in a `custom` block. YAML/JSON carry the derived roles or target-native custom-color shape plus the recipe; don't assume they preserve a separate definitions block.
- Pin the `--custom` JSON into the recipe so a later run reproduces them.

## When to reach for `--extended`

Reach for `--extended` only when the target has slots the core 28 roles don't cover — full decision in [PALETTE.md § The role set](PALETTE.md#the-role-set---to-colors).
