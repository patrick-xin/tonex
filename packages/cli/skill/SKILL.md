---
name: tonex
description: Use when theming an app or design system from a brand color, building a light+dark token system, or whenever WCAG contrast must hold across both modes — anytime you would otherwise hand-pick hex values.
---

# Tonex

Turn one brand seed hex into an accessible, WCAG-contrast-checked color system with Material Color Utilities — a full light-and-dark set of MD3 color tokens. tonex authors only the color layer: it fills a project's color tokens/slots from the seed and owns nothing else. 

## The one rule

**Every value in a theme comes from `tonex`, and from the *same* recipe.** The recipe is the seed plus the knobs you settle on (`--variant`, `--contrast`, any surface knob); from it `tonex` derives all ~50 token values, light and dark, as one coherent set. The seed is the *one* color you choose — the **input**; you never pick any value *derived* from it. Your job is judgment — choose the seed and the knobs, gate the result, author it into the target — not color math.

Two ways to break this, equally fatal:
- **Hand-picking** — typing a hex that isn't the seed. Catch yourself, stop, ask `tonex`.
- **Splicing recipes** — pasting a token from a *different* run (another `--variant` or `--contrast`) into a theme built from another. It came from `tonex`, so it *looks* legal — but contrast is only guaranteed *within* one recipe, so a spliced token voids the gate exactly like a hand-picked one. To change one token: shift the recipe and regenerate the whole set, or `adjust` then **re-gate** — never paste across runs.

## Mental model

- **Engine.** `tonex` runs Material Color Utilities (MCU) over the seed and emits **canonical values + facts + exit codes**. From one seed it derives a full light **and** dark system; you decide what to do with it.
- **Canonical output = MD3 color tokens.** The native artifact is the Material Design 3 color-role set — ~50 tokens (`primary`, `on-primary`, `surface-container`, …), canonically named `--color-*`. Every *target* (shadcn, design.md, any tool) is a **projection** of those tokens: a renaming or a subset. `--color-*` is the canonical name every other vocabulary derives from.
- **You author the color layer only.** `tonex` fills a project's color tokens/slots; it owns nothing else — not components, not spacing, not the rest of a design file. Touch the colors, leave everything else alone.
- **Exit codes are control flow** — branch on them, don't just read the text:
  - `0` clean · `1` a **text** pair fails WCAG → fix the *colors* (a remedy below) · `2` the call is malformed → fix the *flags*.
- **The contract is self-describing.** `tonex describe` is the exact commands, flags, and contrast policy. This skill is the *workflow and judgment*; `describe` is the *contract*. If they ever disagree, trust `describe`.

## Decision tree

Run top to bottom. Each step is mechanical — just run it — **except** the lines marked **your judgment**, the only places you decide.

**1 · Explore** — before generating anything, read how the project already handles color. Open the stylesheets and theme/token files that define it, plus any brand asset present, and note three things:
- **Vocabulary** — the token names the project speaks → which projection you'll author into (resolved at step 4).
- **Destination + mode** — the file you'll write into, and whether it carries both light/dark or a single mode. Observe it; don't assume.
- **Brand signal** — an existing brand color, logo, or palette in the project. A *candidate to raise with the user* at step 2, not a seed you adopt on your own.

**2 · Seed** — the single irreplaceable input. The user owns it; you propose, you never pick it silently.
- **Already in hand** — given in the request, or the user confirms one explore surfaced → use it → step 3.
- **Not in hand** → **your judgment:** it's a discussion, not one question. Talk through the product, its audience, and the feeling they want; use anything explore surfaced as something to react to; converge on a single hex and get their sign-off. Don't extract a color from an image yourself, and don't pick one out of a multi-color palette unasked — propose and confirm. Don't fall back to "just give me a hex."

**3 · Gate** — settle the recipe before you emit anything. `tonex check --seed '#3b82f6'` (add `--aaa`; set `--mode` to match what step 1 said the target carries). Branch on the exit code:
- `0` → sound → step 4.
- `1` → a text pair fails WCAG. Run `tonex check --seed '#3b82f6' --aaa --find-contrast` → adopt the `--contrast` it reports → re-gate. If `UNREACHABLE`, gate at AA. Never hand-edit a value; never ship.
- `2` → usage error. Read the did-you-mean, fix the flags/JSON, re-run.

The recipe is the seed + `--variant` (default `cmf`) + the settled `--contrast` + a surface knob **only if the background is too tinted** (**your judgment**): `--tint <0..1>` or `--desaturate <0..1>`.

**4 · Generate the projection** — at the settled recipe, straight into the target from step 1. Ask `tonex` for the target's vocabulary; never convert colors yourself:
- shadcn / Tailwind → `--to shadcn` → [targets/shadcn.md](targets/shadcn.md)
- design.md (`@google/design.md`) → `--to yaml --mode <light|dark>` → [targets/design-md.md](targets/design-md.md)
- Material Theme Builder JSON → `--to json` → [targets/json.md](targets/json.md)
- no built-in projection → **your judgment:** generate `colors.json` (`--to colors`), hand-map its token keys to the target's slots, then verify every pairing with `check --pairs` → [REFERENCE.md](REFERENCE.md#authoring-into-a-target-with-no-built-in-projection)

`colors.json` is the source you author *from*, generated only in that last case — the built-in projections write straight to the paste target, so don't emit it speculatively.

**Side path** — nudge ONE token without re-seeding: `tonex adjust --shifts '…'` (never gates) → re-gate (step 3). Detail in [REFERENCE.md](REFERENCE.md#adjusting-one-token).

## Token naming differs by surface — the #1 trap

The same MD3 token has a different name per command. Using the wrong one is the most common error:

| where | name for `primary` |
| --- | --- |
| `colors.json` keys | `primary` |
| `--to shadcn` output | `--primary` |
| `adjust` / `check --pairs` tokens | `--color-primary` |

Drive `adjust` / `--pairs` from the `--color-*` form. shadcn output names do **not** round-trip back to `--color-*`. Full map in [REFERENCE.md](REFERENCE.md#token-naming-across-surfaces).

## More

- Per-target authoring guides → [targets/shadcn.md](targets/shadcn.md), [targets/design-md.md](targets/design-md.md), [targets/json.md](targets/json.md).
- Authoring into a target with no built-in projection, the contrast guarantee a fused slot must satisfy, the full naming map, the contrast policy, and the exit-code playbook → [REFERENCE.md](REFERENCE.md).
- Choosing a variant, the `tint`/`desaturate` surface knobs, and reading oklch values → [REFERENCE.md](REFERENCE.md#choosing-a-variant).
- The exact, authoritative flag contract → `tonex describe`.
