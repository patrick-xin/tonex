# @tonex/mcu — vendored, migrate to npm on official release

The MCU 2026 spec (cmf variant, two-source palettes) is unreleased on npm. The engine fix (per ADR-0001) is hard-tied to that spec. Two options were on the table: pin npm's older release and lose 2026-only features, or vendor the upcoming source until release.

**Decision:** `packages/mcu/` holds a **local copy of the unreleased 2026 MCU spec source files**, exposed as `@tonex/mcu` to the rest of the workspace. When MCU lands on npm with the 2026 features, the package is replaced by a thin re-export from the npm install (or deleted entirely if consumers can switch to a direct dependency).

Vendored third-party source isn't written to our strictness bar, so the package concedes two strictness flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) for its own files. The concession is declared on the vendored package and **never lowers the shared `base.json`** — it leaves when the package does. Its live effect is the tsconfig's to state, not this ADR's.

**Why:** A package boundary at MCU is load-bearing for three reasons.

1. **Third-party code at arm's length.** Vendoring without a package boundary lets contributors and Claude reach into MCU internals freely; the wall turns those reaches into explicit imports, which are reviewable.
2. **Spec-version pinning at a single point.** When migrating to npm-MCU, only `packages/mcu/` changes (or disappears). Consumers of `@tonex/mcu` are insulated.
3. **The strictness concession is the vendored package's, not the workspace's.** We don't lower the shared base to accommodate third-party discipline gaps; the bar we hold our *own* code to lives in `base.json`, untouched.

**Consequence:**

- When MCU lands on npm with 2026 features: replace `packages/mcu/` with a re-export from the npm package (or remove and migrate consumers to a direct dep). The strictness concession leaves with the vendored source.
- New code in `@tonex/core` treats the concession as mcu's alone — not a workspace policy to build on.
- Don't fork upstream MCU. The package is a local *copy*, not a fork — when npm ships, we leave. If 2026-spec divergences from upstream are ever introduced, they must be removed before the migration window opens.
- Type-import discipline holds: when `@tonex/core` consumes mcu types, it imports them as types and treats them as upstream contract; it does not silently widen mcu's surface.

**Code anchors:** `packages/mcu/tsconfig.json`, `packages/core/src/theme/derive/derive.ts` — vendored MCU source; the strictness concession is declared on the package's own tsconfig.
