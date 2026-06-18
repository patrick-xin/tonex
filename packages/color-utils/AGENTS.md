# @tonex/color-utils — the external-color-lib boundary

The seam where tonex touches a third-party color library (**culori**, today). A leaf: `@tonex/core` depends on this; this depends on no tonex package. Not a core-consumer — so unlike the CLI / core-react, it carries the *firewall* rules, not the "consume core" pointer.

## The firewall (ADR-0025)

- **The only place `culori` is imported in the whole graph.** Everyone else imports from `@tonex/color-utils`; reaching for `culori` directly anywhere else is a drift error (enforced by `scripts/check-conventions.mjs` → `culori-firewall`). To swap the underlying lib, you touch only this package.
- **Spec-faithful primitives live here, once.** WCAG relative luminance (culori's gamma-correct `wcagLuminance`) and the symmetric `(Lhi+0.05)/(Llo+0.05)` contrast ratio are defined here as the source of truth. Consumers compose against them — they never re-implement the formula.

## argb-canonical (ADR-0021)

- TokenMaps are **argb numbers**; this package owns the projections (`hexString`, `oklchString`, `argbFromHex`, `argbFromOklch`, …). Project at the read site; don't store a projected value.
- tonex owns the string forms (ADR-0025 commitment 3) — `oklchString` is tonex's spelling, not culori's default; keep it that way so output stays stable.
