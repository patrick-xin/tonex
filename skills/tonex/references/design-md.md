# Target: DESIGN.md (`@google/design.md`)

## What DESIGN.md is

`@google/design.md` (Google, Apache-2.0) is an **agent-first design-system format**: a single `DESIGN.md` file that captures a project's design system as structured text — a `colors:` block, a `components:` block, etc. — so agents and tools read one canonical file instead of scattered config. It ships a CLI (`npx @google/design.md`) that lints and exports the file. It is newer than most of your training data, so don't assume the project already has one — check before you fill it.

Its `colors:` block is a flat map of **M3 / MCU color tokens → sRGB hex** — the same token vocabulary tonex derives. That makes the projection near-lossless: tonex tokens map onto design.md keys almost one-to-one.

## tonex fills the color block — it never reads the file

tonex **authors** the `colors:` block from a seed; it never parses an existing DESIGN.md and never reconciles against it. The DESIGN.md is the foreign source of truth for *everything except color* — tonex owns only the color block. Overwrite that block; leave the rest of the file alone.

## How

```
tonex generate --seed '#3b82f6' --to yaml --mode light
```

```yaml
colors:
  primary: "#005bc4"
  on-primary: "#f9f8ff"
  primary-container: "#5391ff"
  on-primary-container: "#001232"
  secondary: "#495f8b"
  on-secondary: "#f9f8ff"
  surface: "#f9f9ff"
  on-surface: "#26324b"
  # … the rest of the tokens
```

- **Single mode.** DESIGN.md has no light/dark axis, so pick one — `--mode light` or `--mode dark` (defaults to `light` if omitted). Emit each mode separately if the project keeps two files.
- **Hex only.** The format's Color type is sRGB hex, so `--format` is ignored — values are always quoted lowercase `#rrggbb` (a bare `#…` would be a YAML comment).
- **Bare block.** Output is just `colors:` with no `---` fences — paste it over the existing `colors:` block.

## Gating it — `tonex check` is the contrast authority, not `design.md lint`

`npx @google/design.md lint` validates **structure** (broken references, unparseable values) via its exit code, and reports contrast as `contrast-ratio` *warnings* on component pairs — it is not a hard WCAG gate. So:

1. **Gate contrast with `tonex check` before you paste.** Scope it to the mode you emitted, because you only shipped one:
   ```
   tonex check --seed '#3b82f6' --mode light            # add --aaa for AAA
   ```
   Exit `0` → the color block is sound. Exit `1` → apply a remedy (`--find-contrast`, raise `--contrast`) and re-emit.
2. **Optionally run `design.md lint` after pasting** to confirm the file still parses and you didn't break a reference — but treat its `contrast-ratio` findings as advisory; `tonex check` already settled contrast.
