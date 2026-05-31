# Variants — one widened interface, special cases as data

Variants are named MCU scheme strategies (cmf, tonalSpot, neutral, vibrant, expressive, fidelity, content, rainbow, fruitSalad, monochrome) registered as a named-slot map. Some variants take a single seed; cmf takes a seed plus an optional secondary source colour (the 2026 spec's two-source feature).

The shape question at slice 1 ship review was: should the `VariantStrategy` interface (a) widen with an optional second-source param, (b) split into a discriminated union of `SingleSourceVariant | TwoSourceVariant`?

**Decision:** Variants live in `packages/core/src/variants/` as a `Record<string, VariantStrategy> as const satisfies` map. One file per variant, registered in a barrel `index.ts`. `VariantStrategy` is a **single widened interface — option (a)**, not split per arity. The interface carries an optional `secondHct` parameter read only by `cmf`; the other variants ignore it. `derive.ts` is the single site that translates camelCase variant names to MCU's SCREAMING_SNAKE convention via the strategy's `mcuVariant` field. The interface lives alongside the registry so no single variant file becomes the de facto template.

**Why:** Option (a) was chosen for three reasons.

- **YAGNI-friendly.** One special case doesn't justify a discriminator.
- **Adding a normal variant is one file with no decision overhead.** No "which strategy shape do I implement?" question — the answer is always "this one."
- **Splitting becomes worth it only when a 3rd two-source variant ever appears.** Unlikely on the MCU roadmap.

**Consequence:**

- New single-source variant → one file in `variants/`, model on `tonalSpot.ts`. Register in barrel.
- New two-source variant → model on `cmf.ts`. Register in barrel. The interface already accommodates it.
- `cmfSecondSourceHex` lives on `PortableTheme` (per ADR-0006: flat with prefixed name). `derive.ts` threads it into `cmf.build` only — every other variant call passes through with `secondHct` unset.
- Disable rule for invalid combos (e.g. tertiary palette override when `variant === 'cmf'`) is a UI concern. The engine accepts whatever the source says; UI prevents invalid source states up-front rather than emitting runtime warnings.
- If a 3rd two-source variant ever lands, this ADR's option (a) becomes the candidate to amend. Until then, the optional param is the contract.
