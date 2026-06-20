# Target: Material Theme Builder JSON

`tonex generate --seed <hex> --to json` authors the **Material Theme Builder export shape** — the JSON that Figma's Material Theme Builder plugin and MTB-compatible tools import:

```
tonex generate --seed '#3b82f6' --to json
```

```json
{
    "description": "TYPE: CUSTOM\ntonex generate --seed '#3b82f6' --variant cmf --to json",
    "seed": "#3B82F6",
    "coreColors": { "primary": "#3B82F6" },
    "extendedColors": [],
    "schemes": {
        "light": {
            "primary": "oklch(0.492 0.18 257.73)",
            "onPrimary": "oklch(0.9819 0.0093 292.8)",
            "primaryContainer": "oklch(0.6689 0.1755 260.93)"
        },
        "dark": { }
    }
}
```

- **When to use it.** Importing into Figma's Material Theme Builder, or any tool that already speaks MTB's schema. For a target you control, prefer the `--to colors` role set — `--to json` matches a *foreign* schema, not tonex's.
- **camelCase, foreign names.** Tokens are camelCased (`onPrimary`, `primaryContainer`) to match MTB — these are MTB's names, not tonex's. Don't drive `adjust` / `check --pairs` from them; use the bare role names `--to colors` prints (`on-primary`, `primary-container`) instead.
- **Both modes, one call.** `schemes.light` and `schemes.dark` are both present; `--mode` is a no-op.
- **Encoding.** `--format oklch` (default) or `--format hex`.
- **Recipe rides in `description`.** JSON has no comment syntax, so the runnable recipe lands in the MTB-native `description` field (after the `TYPE: CUSTOM` marker). It's the durable artifact — keep it; it reproduces this export.
