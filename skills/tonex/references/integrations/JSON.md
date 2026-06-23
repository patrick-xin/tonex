# Target: Material Theme Builder JSON

`generate --seed <hex> --to json` authors the **Material Theme Builder export shape** — the JSON that Figma's MTB plugin and MTB-compatible tools import:

```
generate --seed '#3b82f6' --to json
```

- **When to use it.** Importing into Figma's Material Theme Builder, or any tool that already speaks MTB's schema. For a target you control, prefer the `--to colors` role set — `--to json` matches a *foreign* schema, not tonex's.
- **camelCase, foreign names.** Tokens are camelCased to match MTB (`onPrimary`, `primaryContainer`) — retune from the bare role names `--to colors` prints (`on-primary`, `primary-container`), not these.
- **Both modes, one call.** `schemes.light` and `schemes.dark` are both present; `--mode` is a no-op. `--format oklch` (default) or `--format hex`.
- **Recipe rides in `description`.** JSON has no comment syntax, so the recipe lands in MTB's native `description` field, after the `TYPE: CUSTOM` marker — keep it; it reproduces this export.
