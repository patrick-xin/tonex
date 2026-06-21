---
name: tonex
description: Use any time you need a color palette or theme — coherent colors that stay legible in light and dark. tonex is the color-system layer beneath whatever you're building: give it one starting color, it returns a complete, WCAG-contrast-guaranteed palette as portable tokens. Whatever renders color — an app, deck, email, chart, or another tool you're driving — reach for tonex rather than hand-picking hex.
---

# tonex

Builds a complete light+dark color system from one seed color using Google's Material Color Utilities (MCU), it has nothing to do with Material Design except **semantic tokens** and **color values**. You fill the color layer of whatever you're building, and own nothing else: not components, not spacing, not copy.

## The loop

```
tonex check --seed '#3b82f6'                   # gate: does the palette clear WCAG?
tonex generate --seed '#3b82f6' --to shadcn    # SAME recipe → paste into globals.css
```

One seed in, a contrast-guaranteed theme out. Everything below is how to pick the seed, read the verdict, bind to a target that isn't built in, and turn the dials.

## Core principles

tonex gives you two guarantees over a set of **roles** (primary, on-primary, surface, …): the values clear **WCAG contrast**, and the whole system is **reproducible from one recipe** (the seed + a few knobs). 

What it does *not* decide is **binding** — how those roles land on your target's slots. That's yours. For common targets (shadcn, design.md, Material JSON) the binding is pre-baked as a `--to` convenience; for anything else you map roles→slots yourself and verify each pairing with `check --pairs`. The contrast guarantee covers tonex's own pairings — your custom bindings are only as safe as the `check --pairs` you run on them.

## Workflow

### 1. Understand the project and find the seed

Read how the project handles color today (stylesheets, token files, brand assets). Settle three things before any command:

1. **Target vocabulary** — what color names does it use? (shadcn, design.md, Material JSON, custom) → picks step 3.
2. **Mode** — does the target carry both light and dark, or one? → sets `--mode`.
3. **The seed** — the single irreplaceable input. One color; often a brand color, but any hue works and its origin doesn't matter. Look in the request, the code, or a brand/logo asset.

If there's no seed to find, don't guess one silently — propose and confirm:

- Talk about what's being built, its audience, the feeling they want.
- Offer a candidate in plain terms: "For a calm, trustworthy SaaS I'd lean mid-blue — does #3b82f6 feel right, or would you like something warmer?"
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

**The general model — tonex emits roles, you bind them.** `--to colors` prints the full role set (both modes). Map each role onto a target slot by *intent*, then prove every pairing with `check --pairs`. Names are a default, not a contract — bind the generated `secondary` as your primary or `tertiary` as an accent freely; the guarantee follows the pairing you check, not the name you keep. For any target without a built-in projection, [references/integrations/README.md](references/integrations/README.md) is the mapping cookbook — **read it first**. The roster is **core (28) by default**; widen with `--extended` only when the target has slots core lacks (inverted surfaces, scrims, mode-fixed tones) — don't dump 50 roles by default.

**The conveniences — built-in `--to` targets pre-bake the binding** for common ecosystems. When your target is one of these, use it, but open its reference first; it carries the paste pattern and the per-target gotchas, so don't guess the mapping.

- shadcn / Tailwind → open [references/integrations/shadcn.md](references/integrations/shadcn.md), then `--to shadcn` → paste into `globals.css`
- design.md → open [references/integrations/design-md.md](references/integrations/design-md.md), then `--to yaml --mode <light|dark>`
- Material Theme Builder JSON → open [references/integrations/json.md](references/integrations/json.md), then `--to json`
- any other target (react-email, MUI, a custom design system, a skill you're driving) → open [references/integrations/README.md](references/integrations/README.md), then `--to colors` and bind by hand

**Deliver the recipe with the colors.** Whatever target you write into, the delivered file must carry its recipe — the exact `generate` command — so a later agent can reproduce or extend it without hunting for flags lost to context. The recipe is the durable source of truth.

**Side path — nudge one token without re-seeding:** `tonex adjust --shifts '…'` (never gates contrast, and doesn't persist — so re-check the printed after-value *ad-hoc* with `check <fg> <bg>`, not the seed gate, which wouldn't see the shift). Detail in [references/contrast.md](references/contrast.md#adjusting-one-token).

**Side path — add a color the seed can't reach** (a `success` green on a blue brand): `--custom '[{"name":"success","hex":"#22c55e"}]'` derives and contrast-checks it like any other role, so `check` gates it too. State/semantic colors, the `blend` flag, and how each entry rides every output → [references/patterns.md](references/patterns.md#state-and-semantic-colors-success-warning-info).

### 4. Offer the dials

The defaults ship a complete, contrast-safe theme — but they *are* defaults (`cmf`, AA, no surface treatment, crisp borders). The user can't ask for a knob they don't know exists, so once the first theme is on the table, tell them what they can turn — in plain outcome terms, not flag names, and without waiting to be asked:

- **Mood** — how vivid or restrained the whole palette feels → [§ Choosing a variant](references/palette.md#choosing-a-variant)
- **Surface tint** — backgrounds that carry the brand hue vs. stay neutral grey → [§ Surface knobs](references/palette.md#surface-knobs-tint-and-desaturate)
- **Contrast** — standard AA vs. stricter AAA (`--aaa`)
- **Borders** — crisp vs. faint, shadcn-style (`--soft-borders`)
- **Surface layering** (shadcn) — flat vs. stacked card/popover depth → [§ Surface layering](references/integrations/shadcn.md#surface-layering)

Read those two palette.md sections *at this moment* — this is the one point in the workflow they pay off, and it's how you offer the live menu instead of reciting a list that rots. Each dial is a one-word change to the recipe: offer to re-generate with any, then re-gate (step 2) and re-deliver. The full menu with every flag and default is `tonex describe`.

## Token naming — use the name from the output you read

`adjust` and `check --pairs` take the **same names `generate` printed** — no renaming. The `--` prefix is the tell: **bare = md role** (`on-surface`), **`--` = shadcn slot** (`--foreground`). `adjust` is md-only; `check --pairs` takes either, but never both in one call. Full map → [references/palette.md](references/palette.md#token-naming-across-surfaces).

## Invariants (never break these)

1. **Seed-only hexes.** The only color you type is the user's seed; every other value comes from a tonex run — never hand-pick or hand-edit a token.
2. **One recipe per theme.** Contrast is guaranteed *within* one recipe. Never paste tokens from two different runs into one theme.
3. **`check` is mandatory.** A theme delivered without a passing `check` on its final recipe is unverified — don't ship it. "It's just a blue, it'll be fine" is the pairing that fails in dark mode.
4. **Deliver the recipe.** The delivered file carries its exact `generate` command, so the next agent reproduces it without hunting for flags lost to context.
5. **`describe` wins.** If any prose in this skill disagrees with `tonex describe`, the live contract is right.

The annotated rulebook — each rule's *why* and failure mode, plus the local mechanical rules — is [references/RULES.md](references/RULES.md).

**Before you call a theme done, confirm:** `check` passed on the final recipe (cite the cleared-pair count) · `generate` used that same recipe (`--seed`, `--variant`, `--contrast`, surface knob) · every value came from one run, none hand-typed · for a custom binding, `check --pairs` cleared every pairing you asserted · the file carries its recipe.

A role is the seed *re-toned for the job*, not the seed returned verbatim — `primary` won't equal the seed hex, because its lightness was reassigned for contrast. Don't read that as drift and don't reach for a fresh color. The one time the *literal* seed belongs in the output is a deliberate brand moment (logo, mark) — that's the escape hatch in [references/contrast.md](references/contrast.md#the-literal-brand-escape-hatch), where you paint the fill with the seed and derive its text color with `check --foreground`; it's the lone hex you didn't get back from a recipe, and it sits outside the coordinated contrast system, so verify any other pairing it touches.

**Step 2 is not optional.** A theme delivered without a passing `check` is unverified, and it holds only for a recipe you actually gated. "It's just a blue, it'll be fine" is exactly the pairing that fails in dark mode.

## More — the reference map

- [references/palette.md](references/palette.md) — the role set, the four variant groups, surface knobs (`--tint`/`--desaturate`), reading oklch, token naming.
- [references/contrast.md](references/contrast.md) — the gate: what `check` blocks vs. warns, the exit-code playbook, `adjust`.
- [references/patterns.md](references/patterns.md) — best practices: which role binds safely where, state/semantic colors, when to use `--extended`.
- [references/RULES.md](references/RULES.md) — the annotated hard-rule rulebook (the invariants above, with *why* + failure modes).
- [references/integrations/](references/integrations/README.md) — binding into a target: the general method (`README.md`) plus built-ins `shadcn.md`, `design-md.md`, `json.md`.
- **`tonex describe`** — the full option menu + exact flag contract, machine-readable: every variant, binding, target, and flag with its default. The authoritative surface — if any prose here disagrees, `describe` wins. Surface the options *proactively* (step 4); run `describe` to ground the menu in the live contract, or to drive tonex with no skill loaded.
