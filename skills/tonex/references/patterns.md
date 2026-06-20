# tonex — patterns & best practices

Recurring how-tos that aren't tied to one target. The general binding method is [integrations/README.md](integrations/README.md); the role set and knobs are [palette.md](palette.md); the hard rules are [RULES.md](RULES.md).

## Which role binds safely where (the three classes)

Before mapping a role onto a slot, know what *kind* of tone it is. This is MD3 tonal structure, so it holds across seeds — but `check --pairs` still proves the specific pairing:

- **Accents** — `primary` / `secondary` / `tertiary` are foreground tones: safe as a fill, icon, or label directly on the `surface` / `surface-container-*` ramp in both modes. Light-mode margins run tight (often barely over AA, no AAA headroom) — verify, don't assume slack.
- **Containers** — `*-container` are *background* tones, sat near surface luminance on purpose. Use them as the fill with their own `on-*-container` as the text on top — **never** as a foreground on `surface` (it lands ~1–2:1, invisible).
- **Inverse** — `inverse-surface` flips polarity; pair it only with `inverse-on-surface`. Accent and normal `on-*` tones don't separate from it.

A quick way to confirm a non-obvious pairing before you commit to it:

```
tonex check --seed '#3b82f6' --pairs '[["secondary","surface"],["tertiary","surface-container-high"]]'
```

## State and semantic colors (success, warning, info)

`error` is **already a built-in role** (`error`, `on-error`, `error-container`, `on-error-container`) — don't re-add it. For the rest, add them with `--custom` so they derive and contrast-check like every other role:

```
tonex generate --seed '#3b82f6' \
  --custom '[{"name":"success","hex":"#22c55e"},{"name":"warning","hex":"#f59e0b"}]' --to colors
```

- MCU **harmonizes** each hex toward the seed so the state colors belong to the family. Turn that off per-entry with `"blend": false` when a brand-exact value must stay literal (a logo green, a regulated brand red).
- Each entry rides every output — the derived roles (`success`, `on-success`, …) and, in `--to shadcn`, the pair (`--success` / `--success-foreground`). `check` gates them like anything else, so an unsafe custom hex blocks at exit 1.
- `--to colors` and `--to json` also carry the **definitions** (the source hex + blend flag that re-derive the slugs), so the artifact stays self-describing.
- Pin the `--custom` JSON into the recipe so a later run reproduces them.

## When to reach for `--extended`

The default **core** roster (28 roles) covers most projects. Reach for `--extended` only when the target has slots core doesn't cover — inverted surfaces, modal scrims, tones that hold across modes. The question is "does core cover this project's slots?", not "is this a Material feature?" — full decision in [palette.md](palette.md#the-role-set---to-colors).
