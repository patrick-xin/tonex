---
name: tonex
description: Use any time you need a color palette or theme — coherent colors that stay legible in light and dark. tonex is the color-system layer beneath whatever you're building: give it one starting color, it returns a complete, WCAG-contrast-guaranteed palette as portable tokens. Whatever renders color — an app, deck, email, chart, or another tool you're driving — reach for tonex rather than hand-picking hex.
---

# tonex

Builds a complete color system from source colors using Google's Material Color Utilities and MD-style semantic roles. It does not impose Material components, spacing, layout, or copy. It owns the color layer only: semantic tokens and contrast-gated color values.

Tonex provides a safety net; you're still the painter. It derives roles, but it does not decide every binding — how those roles land on the target's slots. For common targets (shadcn, design.md, Material JSON), binding is pre-baked as a `--to` convenience. For anything else, map roles→slots yourself and verify each asserted pairing with `check --pairs`.

Before running Tonex, choose the command prefix once: if `command -v tonex` succeeds, use `tonex ...`; otherwise use `npx @tonex-dev/cli@latest ...`. Examples below use the short `tonex ...` form.

`tonex describe` is the live contract. If these docs disagree with the CLI about flags, variants, thresholds, or exit codes, trust `tonex describe`.


## Non-negotiables

Before calling a theme done, confirm:

- `tonex describe` was checked for the current CLI contract.
- The final delivered recipe was gated with `tonex check` and passed. Cite the cleared-pair count if the CLI prints one.
- `tonex check` and `tonex generate` used the **same palette flags** (`--seed`, `--variant`, `--contrast`, `--second-color`, `--custom`, surface knobs). `--aaa` is gate-only. `--mode` scopes `tonex check` and selects the emitted YAML mode, while `colors`/`shadcn`/`json` emit both modes and ignore it. For the exhaustive per-flag, per-command matrix, read `tonex describe` — don't assume a flag crosses commands.
- Every delivered value came from one recipe; no hand-picked orphan hex values. Only type user-supplied source colors: the seed, explicit custom semantic colors, or a deliberate literal-brand escape hatch.
- The delivered artifact carries the exact recipe command so a later agent can reproduce it.
- For a custom binding, every asserted foreground/background pair passed `tonex check --pairs`.

## Workflow

### 1. Check available commands

```bash
tonex describe
```

It returns the live contract as top-level fields: `commands`, `variants`, `contrast`, `exitCodes`, `bindings`, `targets`.

### 2. Understand the project and find the seed

Read how the project handles color today (stylesheets, token files, brand assets). Settle three things before generating:

1. **Target vocabulary** — shadcn, design.md (`--to yaml`), Material JSON, or custom.
2. **Mode** — target-dependent: `yaml/design.md` emits one mode; `shadcn`, `json`, and `colors` emit both. Scope `check --mode` when the delivered artifact is explicitly single-mode.
3. **Seed** — the single primary source color. Often a brand color, but any hue works.

If there's no seed to find, don't guess silently. Ask about the product, audience, and desired feel, then propose a candidate in plain terms and get confirmation before proceeding.

### 3. Generate for the target

- shadcn / Tailwind v4: [references/integrations/SHADCN.md](references/integrations/SHADCN.md)
- design.md: [references/integrations/DESIGN-MD.md](references/integrations/DESIGN-MD.md)
- Material Theme Builder JSON: [references/integrations/JSON.md](references/integrations/JSON.md)
- creative surfaces (decks, marketing, social): [references/integrations/CREATIVE.md](references/integrations/CREATIVE.md)
- any other target: [references/integrations/CUSTOM-TARGET.md](references/integrations/CUSTOM-TARGET.md)

### 4. Gate contrast

Before delivering any final artifact, run `check` against the exact final recipe. You may skip checks only for exploratory drafts that are not being delivered.

Use exit codes this way: `0` proceed; `1` means the color artifact failed and must be fixed or explicitly renegotiated; `2` means the command/input is wrong.

### 5. Deliver output

Deliver the colors and the recipe together. The exact `generate` command must live in the target file or native metadata field, not only in chat.

### 6. Offer the dials

After the first deliverable, briefly offer adjustment directions if the user is still iterating visually:

- **Mood** — vivid vs. restrained → [§ Choosing a variant](references/PALETTE.md#choosing-a-variant)
- **Surface tint** — brand-tinted backgrounds vs. neutral grey → [§ Surface knobs](references/PALETTE.md#surface-knobs-tint-and-desaturate)
- **Contrast** — AA vs. stricter AAA (`--aaa`)
- **Borders** — crisp vs. faint, shadcn-style (`--soft-borders`)
- **Surface layering** (shadcn) — flat vs. stacked card/popover depth → [§ Surface layering](references/integrations/SHADCN.md#surface-layering)

If they choose a dial, regenerate, re-gate, and re-deliver.

## Command reference

A fast index — `describe` carries the exhaustive flag matrix.

| command | purpose |
| --- | --- |
| `generate --seed <hex> --to <target>` | derive + print one projection (`colors`/`shadcn`/`yaml`/`json`) |
| `check --seed <hex> [--aaa] [--mode]` | gate the whole theme's contrast (the authoritative WCAG verdict) |
| `check --seed <hex> --find-contrast` | report the minimum `--contrast` that clears the level |
| `check --seed <hex> --pairs '<json>'` | verify specific `[fg, bg]` token-name pairings |
| `check <fg> <bg>` / `check --pairs '<json>'` (no `--seed`) | theme-free ad-hoc check; each color is hex or oklch |
| `check --foreground <fill>` | derive the AA-safe text color for one literal fill (the [literal-brand escape hatch](references/CONTRAST.md#the-literal-brand-escape-hatch)) |
| `adjust --seed <hex> --shifts '<json>'` | shift named tokens by a ±HCT delta (facts only; never gates) |
| `describe` | the machine-readable contract (commands, variants, contrast policy, exit codes, bindings, targets) |

Add `--json` to `check` and `adjust` for machine-readable output.

## Common traps

- Keep `check --pairs` within one namespace — see [token naming](references/integrations/CUSTOM-TARGET.md#token-naming-across-surfaces).
- Do not use internal `--color-*` ids as inputs.
- Treat `adjust` as exploratory by default. It does not persist into `generate`. If you deliberately deliver adjusted values, the artifact must record both commands (`generate` + `adjust`) and the adjusted literal pairs must be checked ad hoc. See [references/CONTRAST.md](references/CONTRAST.md#adjusting-one-token).
- `--second-color` is `cmf`-only; on other variants it exits `2`.
- Surface knobs change the recipe, so re-run `check` even though they are contrast-stable by construction.
- If AAA is unreachable, ask whether AA is acceptable or offer to change pairings/design constraints; do not silently downgrade.

## Reference map

- [references/PALETTE.md](references/PALETTE.md) — role set, variants, surface knobs, oklch.
- [references/CONTRAST.md](references/CONTRAST.md) — gate policy, exit-code playbook, `adjust`, literal-brand escape hatch.
- [references/PATTERNS.md](references/PATTERNS.md) — role binding patterns, semantic colors, `--extended`.
- [references/integrations/CUSTOM-TARGET.md](references/integrations/CUSTOM-TARGET.md) — binding into custom targets, token naming across surfaces.
- [references/integrations/SHADCN.md](references/integrations/SHADCN.md) — shadcn / Tailwind v4 projection.
- [references/integrations/DESIGN-MD.md](references/integrations/DESIGN-MD.md) — DESIGN.md `colors:` block (`--to yaml`).
- [references/integrations/JSON.md](references/integrations/JSON.md) — Material Theme Builder JSON.
- [references/integrations/CREATIVE.md](references/integrations/CREATIVE.md) — For creative works, decks, marketing/landing pages, social, etc..