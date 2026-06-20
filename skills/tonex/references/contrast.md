# tonex — contrast & gating

How to **gate** the palette: what `check` blocks vs. warns, how to read its exit codes, and how to nudge a single token. Companion to [SKILL.md](../SKILL.md); the contrast guarantee is the whole reason to use tonex, so this is step 2 of the workflow, not an afterthought. The authoritative thresholds are always `tonex describe`'s `contrast` / `exitCodes` fields; this file is the interpretation they can't carry.

## Contrast policy (what `check` blocks vs. warns)

This table and the thresholds below mirror `tonex describe`'s `contrast` field (the authoritative policy + numbers; trust it if they ever disagree). What's here is the *interpretation* the field can't carry.

| pair kind | verdict | effect on exit code |
| --- | --- | --- |
| text on its background | **block** | failure → exit `1` |
| non-text (borders, large UI) | warn | advisory, never blocks |
| decorative | exempt | not evaluated |

- Default bar is **AA**; `--aaa` raises it. `--large` uses large-text thresholds for the ad-hoc `<fg> <bg>` / theme-free `--pairs` forms.
- The theme-free forms (`<fg> <bg>` and `--pairs` without `--seed`) accept each color as a **6-digit hex or canonical `oklch(L C H)`** — paste a shadcn/tweakcn oklch straight in. An out-of-gamut oklch is gamut-mapped to sRGB before scoring, and the verdict echoes that projected hex (the color actually scored).
- `--mode light|dark` scopes the audit to one projection (default: both, the stricter union). Scope it when you only emitted one mode (e.g. a single-mode design.md `colors:` block) so the gate matches what you shipped.
- The remedy ladder for a text failure: `--find-contrast` to get the minimum `--contrast` → re-generate → re-check. If `UNREACHABLE`, gate at AA.

## Exit-code playbook

The codes mirror `tonex describe`'s `exitCodes` (authoritative; trust it if they ever disagree). The *response* to each is the judgment below.

| exit | meaning | what to do |
| --- | --- | --- |
| `0` | clean / output produced | proceed |
| `1` | a text pair fails WCAG — the *artifact* is wrong | apply a color remedy: `--find-contrast` then raise `--contrast`, or re-pair the slot to a higher-contrast token. **Never** ship the artifact. |
| `2` | usage/input error — the *call* is wrong | fix the flags/JSON. tonex prints a did-you-mean for typo'd flags and unknown token names. |

Don't collapse `1` and `2` — they demand opposite responses (fix the colors vs. fix the command).

## Adjusting one token

Nudge a single token without re-seeding the whole theme:
```
tonex adjust --seed '#3b82f6' --shifts '[{"mode":"dark","token":"primary","dTone":5}]'
# → dark  primary  #6e9fff → #86adff   req t+5 c+0   got t+4.99 c-6.78
```
It shifts named tokens by a relative ±HCT delta and prints before/after plus the **gamut-clamped achieved** delta (so a clamp shows up in the numbers). It **never gates contrast**, and it **doesn't persist** — so the whole-theme `check --seed` gate re-derives clean from the seed and won't see your shift. Verify the shift *ad-hoc* instead: feed the printed after-value and the color it pairs against into the `check <fg> <bg>` form (e.g. `tonex check '#86adff' '<paired-bg>'`). The token names are the bare md roles `--to colors` prints; see [token naming](palette.md#token-naming-across-surfaces).
