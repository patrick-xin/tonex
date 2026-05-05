> **State:** Living. Edit when slice-shaping rules change.

# Slice strategy

Implementation in tonex proceeds as **vertical slices** (tracer bullets), not layer-by-layer bottom-up. Each slice is one Red-Green-Refactor cycle with a one-sentence promise.

## Two non-negotiable rules

1. **Slice promise = one sentence.** If you can't say it in a sentence, the slice is too big — split. The Red test captures this contract.
2. **No "while I'm here" elaboration.** YAGNI inside the slice. Anything outside the Red test is a different slice.

## Why vertical, not layer-by-layer

- **The seam between core and www is the highest-risk join.** If the API is shaped wrong, you find out after building 10 layers on top of it. Verify on day one with the smallest possible tracer.
- **Tests pass in isolation, fail at integration.** A fully-tested spine that doesn't drive a button is theater. The CSS variable on the DOM and a real component rendering is the real test.
- **Pattern-gravity needs a validated reference.** The first slice's shape becomes the template for every subsequent slice. Building 80% of core before the first integration sets the template without ever validating it.

## Depth before breadth in foundation slices

Within a foundation slice, prefer **depth** (smallest token set that exercises every architectural seam — source → derive → DOM → export, light/dark, md+shadcn, editing pressure) over **breadth** (full token catalog computed but editing loop untested).

Why:
- Without real UI, the user cannot track many tokens visually — verification silently fails and untested tokens accumulate.
- Once the small loop is fully proven, scaling token coverage becomes copy-the-pattern work — low logic-error risk, suitable for subagents because the mechanism is fixed and they only add data.

When proposing slice contents, default to the smallest token set that touches every seam. Reject "let's compute the full token catalog now" until the editing loop is proven on a minimal set.

## Seam coverage order

Slice 1 (the day-one tracer) verifies BOTH layers — md default + shadcn sub-scope. The "and" is load-bearing. Subsequent slices thicken specific layers.

| Slice | New seam verified | Adds |
|---|---|---|
| 1 | source → derive → DOM, both layers | one md token + one shadcn token, end-to-end |
| 2 | Multi-token output | All shadcn tokens + all MD3 tokens through derive. Full token map test. |
| 3 | Persistence seam | Schema validation + zustand persist + reset-on-parse-fail |
| 4 | Exporter seam | `exporters/css.ts` + copy button. CSS string contract test. |
| 5 | Variant breadth | All MCU 2025 variants. Switching test. |
| 6+ | Override seams | One per slice, simplest first |
| 7 | Surface system / ColorSystem | TW palette as real ColorSystem. Surface picker UI. |
| 8 | Lock seam | Reset behaviors |
| 9+ | Real UI features | seed-picker, preview, mapping, lock — port lifted UI components |

## How to apply

- When asked "what should I build next?" — name the slice's one-sentence promise FIRST. Refuse expansions.
- Each slice's tests (Red) are the contract. Don't write code outside what the test demands.
- Refactor (the third R) only happens green. Never refactor while red.
