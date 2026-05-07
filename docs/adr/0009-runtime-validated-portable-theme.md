> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Runtime-validated PortableTheme contract

`PortableTheme` is the wire shape — what gets serialised to localStorage, files, or the network — and the input surface for `deriveTheme`. Until now it lived as a TypeScript interface plus a 9-step migration ladder plus field-level setter validators (`isValidHex`, `validateCustomColorEntry`). All three guard *write* time. Nothing guarded *read* time: a corrupted localStorage record (manual tampering, schema bug, partial write, browser-storage quota mid-write) flowed straight into `deriveTheme`, where MCU would throw on the first malformed input.

**Decision:** Add a runtime schema for `PortableTheme` and validate the rehydrated state against it.

1. **Library: valibot.** `@tonex/core` will publish to npm. Tree-shaken valibot adds ~1–2kb to the bundle for the surface we use (`object`, `record`, `picklist`, `pipe`, `check`, `safeParse`); zod would have added ~13kb for the same job. Lingua-franca familiarity isn't worth ~10kb of payload on a colour-engine library.
2. **Where it lives.** `PortableThemeSchema` and `parsePortableTheme()` sit at the bottom of `packages/core/src/theme/schema.ts`, next to the `PortableTheme` interface itself. Re-exported through the `/schema` subpath.
3. **Wire-in point: post-rehydrate inside `onRehydrateStorage`.** The migration ladder runs first and lifts the persisted shape to v9; the schema then validates the v9 result. Schema describes the *current* shape only — it does not need to know about historical shapes, because migrate produces v9 by contract.
4. **Recovery: all-or-nothing reset to `DEFAULT_INPUTS`.** On parse failure the rehydrate handler calls `state.actions.reset()` and then flips `_hydrated`. No per-field fallback. The failure path is rare (corruption, manual tampering); per-field fallback would add maintenance surface for vanishingly rare events while obscuring the diagnostic signal ("your localStorage was reset" beats "some of your edits silently disappeared").
5. **Single source of truth for field-level checks.** `isValidHex` and `validateCustomColorEntry` are reused inside the schema as `v.check` refinements — the schema does not duplicate the regex or the slug-collision logic. Setter-side validation and rehydrate-side validation share the same primitives.

**Why:**

- Migration handles cross-version shape lift. Schema handles current-shape contract. Two responsibilities, two pieces of code.
- Post-rehydrate placement keeps the schema free of `Partial<>` shapes. Inside-migrate placement would require the schema to handle "this field might be undefined because we're mid-lift" semantics.
- All-or-nothing recovery is what the user actually wants when their state is broken: a working editor. Per-field fallback produces a half-broken editor whose state silently diverges from what the user thought they had.
- valibot's `pipe + check` pattern lets us add structural-then-semantic validation (object shape passes, then refinement runs) without writing custom predicates twice.

**Consequence:**

- Adding a field to `PortableTheme` requires adding it to `PortableThemeSchema`. Forgetting will not corrupt the rehydrate path (extra fields on the stored blob are accepted; missing fields fall back to `DEFAULT_INPUTS` via zustand's spread), but the new field's shape will not be validated. The drift-guard test plus the round-trip test in `source.test.ts` catch this — adding a `PortableTheme` field requires extending `NONDEFAULT_INPUTS`, which exercises the field through both write and rehydrate.
- Adding a new constraint to a field: add a `v.check` refinement on the schema and have the setter call into the same predicate. The schema and the setter do not get to disagree about what "valid" means for a given field.
- Bundle cost: ~1.5kb added to `@tonex/core`'s payload. Acceptable given the contract guarantee. If bundle pressure ever becomes acute, valibot's modular API allows further trimming (per-validator imports).
- The schema is the truth-source for "what counts as a v9 PortableTheme." Documentation that names allowed values (variant names, surface algos, neutral palette names) should reference the const tuples (`VARIANT_NAMES`, `SURFACE_ALGOS`, `NEUTRAL_PALETTE_NAMES`, etc.) rather than restating the values, so the docs and the schema cannot drift.
- Migration ladder bumps still need their own forward-migration logic — the schema does not bridge versions, it validates a single version. The order is fixed: bump `SCHEMA_VERSION`, extend the migrate ladder, extend `PortableTheme`, extend `PortableThemeSchema`, extend `DEFAULT_INPUTS`, extend `NONDEFAULT_INPUTS` test fixture.
- A future "import a theme from a file" path will reuse `parsePortableTheme` directly — same recovery semantics (reject the file outright on parse failure, surface a UI message). The contract is the same regardless of source.
- `validateCustomColorEntry` keeps its existing string-returning signature for UI form-level surfacing; the schema only cares about the binary "valid? yes/no". Both call shapes coexist because the schema's per-entry refinement uses an empty existing-set, leaving cross-entry slug uniqueness to the array-level check.
