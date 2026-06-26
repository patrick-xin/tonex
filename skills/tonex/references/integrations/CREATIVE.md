# tonex — creative surfaces (decks, marketing, editorial)

Binding posture for surfaces that sell a feeling, not run an app: decks, marketing/landing pages, social, email heroes, posters, report covers. Same palette, same gate as everywhere else — what changes is how boldly you bind. A creative surface is a **custom target with no pre-baked binding**, so the mechanics are in [CUSTOM-TARGET.md](CUSTOM-TARGET.md) + [PATTERNS.md](../PATTERNS.md); this file sets how aggressively to use them. Contract is always `describe`.

## Posture: palette, not contract

In a product UI the role names are a contract — `on-primary` only on `primary`, a `*-container` only as a background. **Do not carry that contract onto a creative surface.** It produces one dead layout every time: `surface` background, one `primary` accent, `on-surface` text, repeat.

Here the role set is a **palette to compose with**. Any token, anywhere, for impact: `primary` full-bleed, `tertiary` as a giant headline, a `*-container` as a color block, `error` as a cross-hue accent. The `on-*` / `*-container` names mark the *guaranteed-safe* pairings — not the only legal ones.

This is safe for one reason worth keeping: **every role is the seed re-toned** ([PALETTE.md](../PALETTE.md#a-role-is-the-seed-re-toned-not-the-seed)), so cross-role combinations are pre-harmonized. The discipline doesn't vanish — it moves from the role name to the gate. **Compose boldly, then `check` every text pair.** Use the gate to *unlock* aggressive pairings, not just confirm safe ones.

## Curate a working set — never dump the full palette

`--to colors` is 28 roles × 2 modes. Handing all of it downstream re-creates the timidity: the agent name-matches against the safe neutrals instead of composing. Select **~10–14 values, one mode**, and announce them in plain terms ("deep teal block, coral accent").

| job | pull from | n |
| --- | --- | --- |
| anchors / large type | `primary`, `secondary`, `tertiary` | 3 |
| bold blocks, full-bleed | the three `*-container` | 3 |
| breathing background + text | `surface`, `on-surface` | 2 |
| ink / deep blocks | **dark-mode** `surface`, `surface-bright` | 1–2 |
| rationed cross-hue accent | `error`, or one `--custom` / `--extended` | 1–2 |

Pull ink tones from the **dark** projection even in a light deck — richest near-black the seed offers. Mixing modes is fine; you verify against the literal values you placed (see loop).

By default `primary`, `secondary`, and `tertiary` share the seed's hue. When a composition wants a complementary or cross-hue accent, **don't invent the color yourself** — pass `--second-color` (CMF only) and the engine derives a harmonized accent, reshaping the **tertiary palette only** and leaving primary and secondary untouched.

## Rules

Each ends at the gate.

1. **Color-block every 2–3 frames.** Full-bleed `*-container`, `primary`, or dark-mode `surface` as a cleanser. Not every frame on `surface`.
2. **Use the deep tones.** `*-container` and dark-mode surfaces are the bold colors — favor them over muted `primary` on white. (`--extended` adds `*-fixed`/`*-dim` if you need more.)
3. **Scale = boldness.** Color occupies 40%+ of a hero frame. Oversized type also clears a lower contrast bar — see `--large` below.
4. **Cross-role pairing is allowed** (`tertiary` on `primary-container`, `secondary` on ink). Pre-harmonized → verify each text pair.
5. **Ration the peak.** 1–2 high-chroma moments per deck, usually the accent. Let the rest breathe.

## Verify loop

Every fg/bg pair must pass `check`.

Named pairs (both colors are roles, same palette):

```bash
tonex check --seed '#3b82f6' --pairs '[["tertiary","primary-container"],["on-surface","secondary-container"]]'
```

Theme-free (a literal value, e.g. an ink tone pulled from the other mode):

```bash
tonex check 'oklch(0.92 0.02 195)' 'oklch(0.16 0.014 196)'
```

Exit codes per [CONTRAST.md](../CONTRAST.md#exit-code-playbook): `0` keep; `1` step to the harmonized `on-*` or next tone and re-check — **never retreat to a neutral surface**; `2` fix the call.

**Display type clears a lower bar.** Large text scores at AA `3:1` (not `4.5:1`). Oversized headlines qualify — pass `--large` so the gate scores them right:

```bash
tonex check 'oklch(0.69 0.095 194)' 'oklch(0.16 0.014 196)' --large
```

A vivid accent that fails as body text often passes as a headline. `--large` only for genuinely large type — never to force small text through.

**Cross-hue accent:** `error` is the built-in, already harmonized and gated — the right default. Non-red accent → add via `--custom` with `blend: true` ([PATTERNS.md](../PATTERNS.md#state-and-semantic-colors-success-warning-info)). One accent, used once or twice.

## Failure mode — do not ship

Every frame `surface` + one `primary` accent + `on-surface` text. Passing the gate is necessary, not sufficient — a beige deck passes contrast and still fails the brief. Add color blocks (1), deep-tone backgrounds (2), one peak (5).

## Deliver

The exact `generate` command travels in the artifact (speaker notes, HTML comment, footer) — plus the **working set** and any **theme-free literals** placed from the other mode, so a later agent reproduces the composition, not a timid re-derive.

## End-to-end

```bash
# full palette, then curate down
tonex generate --seed '#0e8c86' --to colors

# verify the bold pairings the composition asserts
tonex check --seed '#0e8c86' --pairs '[["primary-container","surface"],["tertiary","primary-container"],["error","surface"]]'

# verify ink-block pairs from the dark projection (literal)
tonex check 'oklch(0.92 0.02 195)' 'oklch(0.16 0.014 196)'
tonex check 'oklch(0.69 0.095 194)' 'oklch(0.16 0.014 196)' --large

# exit 1 → step to on-* / next tone, re-check. deliver with recipe + working set + literals.
```
