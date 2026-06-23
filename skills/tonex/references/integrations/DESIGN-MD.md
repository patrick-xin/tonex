# Target: DESIGN.md

[DESIGN.md](https://github.com/google-labs-code/design.md/) is an agent-first design-system format: a single `DESIGN.md` file capturing a project's design system as structured text — a `colors:` block, a `components:` block, and so on — so agents read one canonical file instead of scattered config. It ships a CLI (`npx @google/design.md`) that lints and exports the file. Check whether the project actually has one before filling it.

Its `colors:` block is a flat map of **tokens → color values**. tonex **authors** that block from a seed; it never parses or reconciles against an existing file. The DESIGN.md owns everything *except* color — If the `colors:` block already lists tokens, overwrite just those (and ask before adding any extra roles generated); if it's empty, write the full role set.

```
generate --seed '#3b82f6' --to yaml --mode light
```

```yaml
# generate --seed '#3b82f6' --variant cmf --to yaml --mode light
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

DESIGN.md has no light/dark axis, so pick one — `--mode light` or `--mode dark` (defaults to `light`). Emit each mode separately if the project keeps two files.

## Gating it — `check` is the contrast authority, not `design.md lint`

`npx @google/design.md lint` validates *structure* via its exit code and reports contrast as `contrast-ratio` **warnings** — it is not a hard WCAG gate. So:

1. **Gate contrast with `check` before you paste**, scoped to the one mode you emitted:
   ```
   check --seed '#3b82f6' --mode light            # add --aaa for AAA
   ```
   Exit `0` → the block is sound. Exit `1` → apply a remedy (`--find-contrast`, raise `--contrast`) and re-emit.
2. **Optionally run `design.md lint` after pasting** to confirm the file still parses — but treat its `contrast-ratio` findings as advisory; `check` already settled contrast.

## Capture color-usage intent

A DESIGN.md is authored interactively, offer writing the prose while you and the user are settling the design. When you write it, ground it in what a downstream agent can act on — **provenance** and **role intent**. Prose should match the file's existing prose density.

Examples

```markdown
## Colors

The palette centers on "Golden Retriever" orange to drive action and signal energy. This is balanced by "Sky Walk" blue, which provides a calming counterpoint for administrative tasks and scheduling.

- **Primary:** Use for main actions, active states, and highlights.
- **Secondary:** Use for secondary information, trust indicators, and navigation accents.
- **Neutral:** A range of soft grays used for backgrounds and borders to keep the UI feeling "premium."
- **Deep Charcoal:** Used for all primary text to ensure high legibility and a grounded, professional feel.
```

```markdown
## Colors

The palette is anchored in the transition from shadow to light.

- **Primary (Amber/White-Gold):** Represents the solar corona and the "diamond ring" flash. Used for critical CTAs and high-importance highlights.
- **Secondary (Soft Cyan):** Represents the atmospheric thinning and the ethereal glow of the sky during totality. Used for interactive states and secondary information.
- **Tertiary (Deep Indigo):** Provides the "midnight" depth, used for subtle atmospheric gradients and deep backgrounds.
- **Neutral (Obsidian/Charcoal):** A near-black foundation that ensures the vibrant accents pop with maximum intensity.

Gradient usage is mandatory: use radial gradients for backgrounds to simulate the circular nature of the eclipse, moving from `Neutral` at the edges to `Tertiary` or `Secondary`
```