# Slice strategy

Implementation proceeds as **vertical slices** (tracer bullets), not layer-by-layer. Each slice is one Red-Green-Refactor cycle with a one-sentence promise, cutting through every layer (source → derive → DOM → export → UI) so the core↔www seam — the highest-risk join — is exercised on day one, not after ten layers sit on top of it. Shipped slice history lives in `CHANGELOG.md`.

## Two non-negotiable rules

1. **Slice promise = one sentence.** If you can't say it in a sentence, the slice is too big — split. The Red test captures this contract.
2. **No "while I'm here" elaboration.** YAGNI inside the slice. Anything outside the Red test is a different slice.

## Depth before breadth in foundation slices

Within a foundation slice, take the **smallest token set that exercises every seam** (source → derive → DOM → export, light/dark, md+shadcn, editing pressure) over the full token catalog. Reject "compute the full token catalog now" until the editing loop is proven on a minimal set — without real UI, untracked tokens accumulate untested. Once the small loop is proven, scaling token coverage is copy-the-pattern work, suitable for subagents.

## Seam coverage order

Slice 1 verifies **both layers** (md default + shadcn sub-scope) end-to-end; the "and" is load-bearing — its shape becomes the template every later slice copies. Subsequent slices thicken one seam each: multi-token output, persistence, exporter, variant breadth, overrides (one per slice, simplest first), surface system, lock.

## How to apply

- When asked "what should I build next?" — name the slice's one-sentence promise FIRST. Refuse expansions.
- Each slice's Red tests are the contract. Don't write code outside what the test demands.
- Refactor (the third R) only happens on green. Never refactor while red.
- **Blueprint slices** (no code, only ADRs / repo doc updates) are legitimate when an architectural decision spans multiple implementation slices and must land before any of them ship. _(ADR-0019; ADR-0020)_

## Two adapters = real seam

A typed abstraction (registry, interface, base class) earns its keep only when a second concrete adapter is in scope. **One concrete = no abstraction. Two concrete = candidate abstraction.** One consumer's inferred shape is speculation — the second consumer typically reshapes it. A speculative second ("we might add Radix") doesn't count. The rule fires across scales: a `ColorEngine` slot, lifting exporters to a registry, a shared surface-treatment options bag, an importer interface.
