---
name: tonex
description: Use any time you need a color palette or theme — coherent colors that stay legible in light and dark. tonex is the color-system layer beneath whatever you're building: give it one starting color, it returns a complete, WCAG-contrast-guaranteed palette as portable tokens. Whatever renders color — an app, deck, email, chart, or another tool you're driving — reach for tonex rather than hand-picking hex.
---

# tonex

Builds a complete light+dark color system from one seed color using Google's Material Color Utilities (MCU), it has nothing to do with Material Design except **semantic tokens** and **color values**. You fill the color layer of whatever you're building, and own nothing else: not components, not spacing, not copy.

## Core principles

tonex gives you two guarantees over a set of **roles** (primary, on-primary, surface, …): the values clear **WCAG contrast**, and the whole system is **reproducible from one recipe** (the seed + a few knobs). 

What it does *not* decide is **binding** — how those roles land on your target's slots. That's yours. For common targets (shadcn, design.md, Material JSON) the binding is pre-baked as a `--to` convenience; for anything else you map roles→slots yourself and verify each pairing with `check --pairs`. The contrast guarantee covers tonex's own pairings — your custom bindings are only as safe as the `check --pairs` you run on them.

## Workflow

### 1. Understand the project and find the seed

Read how the project handles color today — stylesheets, token files, any brand assets. Note:

- **Target vocabulary** — what names does it use? (shadcn, design.md, Material JSON, custom) → determines step 3.
- **Mode** — does the target carry both light and dark, or one? → determines `--mode`.
- **Brand signal** — an existing color in the codebase, logo, or asset file.

The seed is one color — the single irreplaceable input. It's often a brand color, but any starting hue works and it doesn't matter where it came from. It may be in the request, in the code, or in a brand asset. If not:

- Talk about what's being built, its audience, and the feeling they want.
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

See [references/contrast.md](references/contrast.md) for complete contrast documentation.

### 3. Generate and bind

Use the exact same recipe as step 2 — same `--seed`, `--variant`, `--contrast`, surface knob if any. Same recipe is what ensures the delivered theme matches the one that passed.

**The general model — tonex emits roles, you bind them.** `--to colors` prints the full role set, both modes. Map each role onto the target's slot by *intent*, then verify every pairing with `check --pairs`. The role *names* are a suggested default, not a contract: binding the generated `secondary` as your UI's primary, or `tertiary` as an accent, is fair game. The contrast guarantee follows the *pairing you check*, not the name you keep — so remap freely, then prove it. This is the path for any target without a built-in projection — [references/integrating.md](references/integrating.md) is the mapping cookbook; **read it first**. The role set is **core (28) by default**; if the target has slots core doesn't cover (inverted surfaces, scrims, mode-fixed tones), tell the user `--extended` is available and let them opt in — you know what the project needs, so don't dump 50 roles by default.

**The conveniences — built-in `--to` targets pre-bake the binding** for common ecosystems. When your target is one of these, use it, but open its reference first; it carries the paste pattern and the per-target gotchas, so don't guess the mapping.

- shadcn / Tailwind → open [references/shadcn.md](references/shadcn.md), then `--to shadcn` → paste into `globals.css`
- design.md → open [references/design-md.md](references/design-md.md), then `--to yaml --mode <light|dark>`
- Material Theme Builder JSON → open [references/json.md](references/json.md), then `--to json`
- any other target (react-email, MUI, a custom design system, a skill you're driving) → open [references/integrating.md](references/integrating.md), then `--to colors` and bind by hand

**Deliver the recipe with the colors.** Whatever target you write into, the delivered file must carry its recipe — the exact `generate` command — so a later agent can reproduce or extend it without hunting for flags lost to context. The recipe is the durable source of truth.

**Side path — nudge one token without re-seeding:** `tonex adjust --shifts '…'` (never gates contrast) → re-run step 2. Detail in [references/contrast.md](references/contrast.md#adjusting-one-token).

**Side path — add a color the seed can't reach:** when the target needs a semantic or accent color outside the seed's palette (a `success` green on a blue brand), add it with `--custom '[{"name":"success","hex":"#22c55e"}]'` — MCU harmonizes the hex toward the seed (turn that off per-entry with `"blend": false`) and contrast-guarantees the derived roles like everything else, so `check` gates them too. Each entry rides in every output: the `--to shadcn` pair (`--success`/`--success-foreground`) and the derived roles (`success`, `on-success`, …) in `--to yaml`, `--to json`, and `--to colors`. `--to colors` and `--to json` also carry the **definitions** (colors' `custom` block / json's `extendedColors`) — the source hex + blend flag that re-derive the slugs, so the artifact stays self-describing. Pin them into the recipe so a later run reproduces them.

### 4. Offer the dials

The defaults ship a complete, contrast-safe theme — but they *are* defaults (`cmf`, AA, no surface treatment, crisp borders). The user can't ask for a knob they don't know exists, so once the first theme is on the table, tell them what they can turn — in plain outcome terms, not flag names, and without waiting to be asked:

- **Mood** — how vivid or restrained the whole palette feels → [§ Choosing a variant](references/palette.md#choosing-a-variant)
- **Surface tint** — backgrounds that carry the brand hue vs. stay neutral grey → [§ Surface knobs](references/palette.md#surface-knobs-tint-and-desaturate)
- **Contrast** — standard AA vs. stricter AAA (`--aaa`)
- **Borders** — crisp vs. faint, shadcn-style (`--soft-borders`)

Read those two palette.md sections *at this moment* — this is the one point in the workflow they pay off, and it's how you offer the live menu instead of reciting a list that rots. Each dial is a one-word change to the recipe: offer to re-generate with any, then re-gate (step 2) and re-deliver. The full menu with every flag and default is `tonex describe`.

## Token naming — use the name from the output you read

`adjust` and `check --pairs` take the **same names `generate` printed** — no renaming:

| where | name for `primary` |
|---|---|
| `--to colors` keys · `adjust` · `check --pairs` (md) | `primary` |
| `--to shadcn` output · `check --pairs` (shadcn) | `--primary` |

md roles are bare (`on-surface`); shadcn slots keep the `--` (`--foreground`). The `--` prefix is the tell: bare = md role, `--` = shadcn slot. `adjust` is md-only (bare roles); `check --pairs` takes either, but not mixed in one call. The internal `--color-*` id is **not** an input — tonex rejects it and points you at the bare name. Full map in [references/palette.md](references/palette.md#token-naming-across-surfaces).

## The invariant

Every token in the delivered theme comes from `tonex`, from one recipe. Never type a hex that didn't come from the user as the seed. Never paste tokens across two different runs — contrast is only guaranteed within one recipe. To change the feel: shift the recipe and regenerate the whole set, or `adjust` then re-gate.

**Step 2 is not optional.** A theme delivered without a passing `check` is unverified, and it holds only for a recipe you actually gated. "It's just a blue, it'll be fine" is exactly the pairing that fails in dark mode.

Before you call the theme done, confirm:

- `check` ran on the final recipe and you saw its `PASS` line — cite the cleared-pair count.
- `generate` used the **same** recipe `check` passed — same `--seed`, `--variant`, `--contrast`, surface knob.
- every hex/oklch in the delivered files came from one tonex run; none were hand-typed.
- for a custom (non-built-in) binding, `check --pairs` cleared every role→slot pairing you asserted.
- the delivered file carries its recipe (the exact `generate` command) so the next agent can reproduce it.

## More

- Variant groups, surface knobs (`--tint` / `--desaturate`), reading oklch values → [references/palette.md](references/palette.md#choosing-a-variant)
- Authoring into a target with no built-in projection → [references/integrating.md](references/integrating.md); contrast policy + exit-code playbook → [references/contrast.md](references/contrast.md)
- **The full option menu + exact flag contract → `tonex describe`** — every variant, binding, target, and flag with its default, machine-readable. It is the authoritative surface: if any prose in this skill disagrees with it, `describe` wins. Surface the options *proactively* (step 4) — don't wait to be asked, don't invent choices, don't stay silent on them; run `describe` to ground the menu in the live contract, or to drive tonex with no skill loaded.
