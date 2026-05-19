> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# @tonex/mcu — vendored, migrate to npm on official release

The MCU 2026 spec (cmf variant, two-source palettes) is unreleased on npm. The engine fix (per ADR-0001) is hard-tied to that spec. Two options were on the table: pin npm's older release and lose 2026-only features, or vendor the upcoming source until release.

**Decision:** `packages/mcu/` holds a **local copy of the unreleased 2026 MCU spec source files**, exposed as `@tonex/mcu` to the rest of the workspace. When MCU lands on npm with the 2026 features, the package is replaced by a thin re-export from the npm install (or deleted entirely if consumers can switch to a direct dependency).

The vendored copy doesn't pass full strict-mode TypeScript. The escape hatch lives **only on `packages/mcu/tsconfig.json`**:

```jsonc
{
  "noUncheckedIndexedAccess": false,
  "exactOptionalPropertyTypes": false
}
```

The shared `packages/typescript-config/base.json` keeps full strict. Core, www, and any future package inherit strict — only mcu's own typecheck graph is relaxed.

**Why:** A package boundary at MCU is load-bearing for three reasons.

1. **Third-party code at arm's length.** Vendoring without a package boundary lets contributors and Claude reach into MCU internals freely; the wall turns those reaches into explicit imports, which are reviewable.
2. **Spec-version pinning at a single point.** When migrating to npm-MCU, only `packages/mcu/` changes (or disappears). Consumers of `@tonex/mcu` are insulated.
3. **Strict-mode relax stays scoped.** Disabling strict on the shared base would let third-party code's discipline gaps bleed into our own code. Local relax keeps the policy honest — strict applies to everything *we* write.

**Consequence:**

- When MCU lands on npm with 2026 features: replace `packages/mcu/` with a re-export from the npm package (or remove and migrate consumers to a direct dep), delete the strict-mode relax (mcu's source leaves the typecheck graph at that moment).
- New code in `@tonex/core` cannot rely on the strict-mode relax — that's mcu's local concession, not a workspace policy.
- Don't fork upstream MCU. The package is a local *copy*, not a fork — when npm ships, we leave. If 2026-spec divergences from upstream are ever introduced, they must be removed before the migration window opens.
- Type-import discipline holds: when `@tonex/core` consumes mcu types, it imports them as types and treats them as upstream contract; it does not silently widen mcu's surface.
