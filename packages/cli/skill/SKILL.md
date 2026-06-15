---
name: tonex
description: Use when theming an app or design system from a brand color, building a light+dark token system, or whenever WCAG contrast must hold across both modes — anytime you would otherwise hand-pick hex values.
---

# Tonex

Builds a complete light+dark color system from one seed hex using Google's Material Color Utilities (MCU). You fill the project's color layer from the seed and own nothing else — not components, not spacing, not the rest of a design file.

## Workflow

### 1. Understand the project and find the seed

Read how the project handles color today — stylesheets, token files, any brand assets. Note:

- **Target vocabulary** — what names does it use? (shadcn, design.md, Material JSON, custom) → determines step 3.
- **Mode** — does the target carry both light and dark, or one? → determines `--mode`.
- **Brand signal** — an existing color in the codebase, logo, or asset file.

The seed is one brand hex, the single irreplaceable input. It may be in the request, in the code, or in a brand asset. If not:

- Talk about the product, its audience, and the feeling they want.
- Propose a candidate in plain terms: "For a calm, trustworthy SaaS I'd lean toward a mid-blue — does #3b82f6 feel right, or would you like something warmer?"
- Get their confirmation before proceeding. Don't extract a color from an image unasked, and don't pick from a multi-color palette without proposing first.

### 2. Check contrast

```
tonex check --seed '<hex>' [--aaa] [--mode light|dark]
```

- Exit `0` → proceed to step 3.
- Exit `1` → a text pair fails. Find the fix:
  ```
  tonex check --seed '<hex>' --find-contrast [--aaa]
  ```
  Adopt the `--contrast` level it reports. Re-check. If `UNREACHABLE`, settle at AA.
- Exit `2` → bad call; fix the flags and re-run.

### 3. Generate

Use the exact same recipe as step 2 — same `--seed`, `--variant`, `--contrast`, surface knob if any. Same recipe is what ensures the delivered theme matches the one that passed.

**Open your target's recipe before you generate — it carries the paste pattern and the per-target gotchas. Don't guess the mapping.**

- shadcn / Tailwind → open [targets/shadcn.md](targets/shadcn.md), then `--to shadcn` → paste into `globals.css`
- design.md → open [targets/design-md.md](targets/design-md.md), then `--to yaml --mode <light|dark>`
- Material Theme Builder JSON → open [targets/json.md](targets/json.md), then `--to json`
- No built-in target → [REFERENCE.md § authoring into a target with no built-in projection](REFERENCE.md#authoring-into-a-target-with-no-built-in-projection) is the mapping cookbook — **read it first**, then `--to colors`, map its token keys to the target's slots, and verify every pairing with `check --pairs`

**Side path — nudge one token without re-seeding:** `tonex adjust --shifts '…'` (never gates contrast) → re-run step 2. Detail in [REFERENCE.md](REFERENCE.md#adjusting-one-token).

## Token naming differs by surface — the #1 trap

The same underlying token has a different name per command:

| where | name for `primary` |
|---|---|
| `colors.json` keys | `primary` |
| `--to shadcn` output | `--primary` |
| `adjust` / `check --pairs` | `--color-primary` |

Drive `adjust` / `--pairs` from the `--color-*` form. shadcn output names do not round-trip back to `--color-*`. Full map in [REFERENCE.md](REFERENCE.md#token-naming-across-surfaces).

## The invariant

Every token in the delivered theme comes from `tonex`, from one recipe. Never type a hex that didn't come from the user as the seed. Never paste tokens across two different runs — contrast is only guaranteed within one recipe. To change the feel: shift the recipe and regenerate the whole set, or `adjust` then re-gate.

**Step 2 is not optional.** A theme delivered without a passing `check` is unverified — the WCAG guarantee is the whole reason to use tonex, and it holds only for a recipe you actually gated. "It's just a blue, it'll be fine" is exactly the pairing that fails in dark mode.

Before you call the theme done, confirm:

- [ ] `check` ran on the final recipe and you saw its `PASS` line — cite the cleared-pair count.
- [ ] `generate` used the **same** recipe `check` passed — same `--seed`, `--variant`, `--contrast`, surface knob.
- [ ] every hex/oklch in the delivered files came from one tonex run; none were hand-typed.

## More

- Variant groups, surface knobs (`--tint` / `--desaturate`), reading oklch values → [REFERENCE.md](REFERENCE.md#choosing-a-variant)
- Authoring into a target with no built-in projection, contrast policy, exit-code playbook → [REFERENCE.md](REFERENCE.md)
- Exact flag contract → `tonex describe`
