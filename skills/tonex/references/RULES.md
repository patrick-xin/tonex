# tonex — the rulebook

The hard rules, each with its *why* and the failure it prevents. The five **invariants** are also stated tight in [SKILL.md](../SKILL.md#invariants-never-break-these) — that copy is always in context; this one is the annotated version, plus the local mechanical rules. `tonex describe`'s `contrast` / `exitCodes` fields are authoritative for thresholds and codes; trust them over any prose here.

## Invariants (workflow-wide — never break these)

| rule | why | failure if broken |
| --- | --- | --- |
| **Seed-only hexes** — the only color you type is the user's seed | every other value is derived and contrast-checked; a hand-typed hex is ungated | an off-palette color that fails contrast or clashes, shipped silently |
| **One recipe per theme** — never mix tokens from two runs | the guarantee holds *within* one recipe's tonal system, not across recipes | two values that each passed alone but fail as a pair |
| **`check` is mandatory** — gate the final recipe before shipping | the contrast guarantee is the whole product; an ungated theme is worthless | a light-mode pass that fails in dark, caught by users instead of you |
| **Deliver the recipe** — the file carries its exact `generate` command | the recipe is the durable source of truth; conversation context is lost | the next agent can't reproduce or extend; the values become orphaned |
| **`describe` wins** — the live contract beats this prose | flags, variants, and thresholds change; docs lag | a stale flag name or threshold quietly does the wrong thing |

## Local rules (point-of-use)

- **Don't mix layers in one `--pairs` call.** A single `check --pairs` stays within one layer — all bare md roles, or all `--`-prefixed shadcn slots, never both in the same call. *(Why: the two layers are different token namespaces; detail in [palette.md](palette.md#token-naming-across-surfaces).)*
- **The internal `--color-*` id is not an input.** Drive `adjust` / `check --pairs` with the bare role name (`primary`) or the shadcn slot (`--primary`) — tonex rejects `--color-primary` and points you at the right name.
- **`adjust` never gates.** It reports the achieved ±HCT delta (facts only) and does *not* check contrast — always re-run `check` after a shift. *(Detail in [contrast.md](contrast.md#adjusting-one-token).)*
- **`--second-color` is `cmf`-only.** On any other variant it's a usage error (exit `2`), not a silent no-op — tonex refuses rather than derive a theme that ignored your flag.
- **Surface knobs don't excuse skipping the gate.** `--tint` / `--desaturate` are contrast-stable by construction (tone is pinned), but the recipe changed — re-run `check` anyway. *(Detail in [palette.md](palette.md#surface-knobs-tint-and-desaturate).)*

## Exit codes (the response to each)

The codes mirror `tonex describe`'s `exitCodes`; the *response* is the judgment.

| exit | meaning | what to do |
| --- | --- | --- |
| `0` | clean / output produced | proceed |
| `1` | a text pair fails WCAG — the **artifact** is wrong | apply a color remedy (`--find-contrast` then raise `--contrast`, or re-pair to a higher-contrast token). Never ship it. |
| `2` | usage / input error — the **call** is wrong | fix the flags or JSON. tonex prints a did-you-mean for typos. |

Never collapse `1` and `2` — they demand opposite responses (fix the colors vs. fix the command).
