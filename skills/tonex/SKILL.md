---
name: tonex
description: Use when theming an app or design system from a brand color, building a light+dark token system, or whenever WCAG contrast must hold across both modes — anytime you would otherwise hand-pick hex values.
---

# tonex

Builds a complete light+dark color system from one seed hex using Google's Material Color Utilities (MCU). You fill the project's color layer from the seed and own nothing else — not components, not spacing, not the rest of a design file.

tonex gives you two guarantees over a set of **roles** (primary, on-primary, surface, …): the values clear **WCAG contrast**, and the whole system is **reproducible from one recipe** (the seed + a few knobs). What it does *not* decide is **binding** — how those roles land on your target's slots. That's yours. For common targets (shadcn, design.md, Material JSON) the binding is pre-baked as a `--to` convenience; for anything else you map roles→slots yourself and verify each pairing with `check --pairs`. The contrast guarantee covers tonex's own pairings — your custom bindings are only as safe as the `check --pairs` you run on them.

## Workflow

### 1. Understand the project and find the seed

Read how the project handles color today — stylesheets, token files, any brand assets. Note:

- **Target vocabulary** — what names does it use? (shadcn, design.md, Material JSON, custom) → determines step 3.
- **Mode** — does the target carry both light and dark, or one? → determines `--mode`.
- **Brand signal** — an existing color in the codebase, logo, or asset file.

The seed is one brand hex, the single irreplaceable input. It may be in the request, in the code, or in a brand asset. If not:

- Talk about the product, its audience, and the feeling they want.
- Propose a candidate in plain terms: "For a calm, trustworthy SaaS I'd lean toward a mid-blue — does #3b82f6 feel right, or would you like something warmer?"
- Get confirmation before proceeding.

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

### 3. Generate and bind

Use the exact same recipe as step 2 — same `--seed`, `--variant`, `--contrast`, surface knob if any. Same recipe is what ensures the delivered theme matches the one that passed.

**The general model — tonex emits roles, you bind them.** `--to colors` prints the full role set, both modes. Map each role onto the target's slot by *intent*, then verify every pairing with `check --pairs`. This is the path for any target without a built-in projection — [REFERENCE.md § authoring into a target with no built-in projection](REFERENCE.md#authoring-into-a-target-with-no-built-in-projection) is the mapping cookbook; **read it first**. The role set is **core (28) by default**; if the target has slots core doesn't cover (inverted surfaces, scrims, mode-fixed tones), tell the user `--extended` is available and let them opt in — you know what the project needs, so don't dump 50 roles by default.

**The conveniences — built-in `--to` targets pre-bake the binding** for common ecosystems. When your target is one of these, use it, but open its reference first; it carries the paste pattern and the per-target gotchas, so don't guess the mapping.

- shadcn / Tailwind → open [references/shadcn.md](references/shadcn.md), then `--to shadcn` → paste into `globals.css`
- design.md → open [references/design-md.md](references/design-md.md), then `--to yaml --mode <light|dark>`
- Material Theme Builder JSON → open [references/json.md](references/json.md), then `--to json`

**Deliver the recipe with the colors.** Whatever target you write into, the delivered file must carry its recipe — the exact `generate` command — so a later agent can reproduce or extend it without hunting for flags lost to context. The recipe is the durable source of truth; there is no separate `colors.json` to commit (`--to colors` is a throwaway you read while mapping, not a manifest anything reads back).

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
- [ ] for a custom (non-built-in) binding, `check --pairs` cleared every role→slot pairing you asserted.
- [ ] the delivered file carries its recipe (the exact `generate` command) so the next agent can reproduce it.

## More

- Variant groups, surface knobs (`--tint` / `--desaturate`), reading oklch values → [REFERENCE.md](REFERENCE.md#choosing-a-variant)
- Authoring into a target with no built-in projection, contrast policy, exit-code playbook → [REFERENCE.md](REFERENCE.md)
- **The full option menu + exact flag contract → `tonex describe`** — every variant, binding, target, and flag with its default, machine-readable. It is the authoritative surface: if any prose in this skill disagrees with it, `describe` wins. Run it when the user wants to explore the options tonex offers (don't invent choices or stay silent on them), or to drive tonex with no skill loaded.
