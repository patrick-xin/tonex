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
It shifts named tokens by a relative ±HCT delta and prints before/after plus the **gamut-clamped achieved** delta (so a clamp shows up in the numbers). It **never gates contrast** — re-run `check` afterward (decision tree step 3). The token names are the bare md roles `--to colors` prints; see [token naming](palette.md#token-naming-across-surfaces).

## The literal-brand escape hatch

Roles re-tone the seed for legibility ([palette.md](palette.md#a-role-is-the-seed-re-toned-not-the-seed)), so `primary` won't equal the seed hex. Usually that's exactly what you want. The exception is when the **literal** brand color is the requirement and exactness is the point — a logo fill, a brand mark, a deliberate brand moment where the color must be *that* hex, not a contrast-tuned cousin. You already hold the exact seed: it was your own input.

For that case, paint the fill with the literal seed, then derive its text color with the generator instead of guessing:

```
tonex check --foreground '<seed>'
# → PASS — foreground oklch(0.983 0.0123 317.74) on #6750a4 — 6.11:1 clears AA text (4.5)
```

`check --foreground <fill>` takes one literal fill (6-digit hex or canonical oklch) and prints the AA-safe foreground (the on-color) for it, with the achieved ratio and a PASS/FAIL verdict. It honors `--aaa` / `--large` and `--format oklch|hex`, and `--json` for a machine-readable row. Exit `0` when the foreground clears the level; exit `1` only when **no** foreground can reach it — a mid-tone fill against the raised AAA bar — and even then it returns the max-contrast pick, so you always get the best available text color.

- **Do** reach for `check --foreground <seed>` when the literal brand color must appear as-is. One deterministic call gives a guaranteed-legible text color for the fill — no guessing a foreground and looping on the verifier.
- **Don't** make this the default. Prefer roles; the literal value is for the rare slot where the *exact* hex is the deliverable, not the whole surface. If the brand color just needs to *feel* present, that's `primary`, not a literal pin.
- **Don't** treat the literal pin as a coordinated part of the system. It sits **outside** tonex's contrast guarantee — only the fill↔foreground pair this command returns is gated. Verify any *other* pairing that literal color participates in with `check --pairs '[[<fg>, <fill>]]'` (or `check <fg> <fill>`).
- **Don't** invent a standing `brand` token for it. There's no surfaced brand slot; the literal value is the seed you already have, used in place for one job — keep it in the recipe so a later agent knows it was a deliberate pin, not derived output.
