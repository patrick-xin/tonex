# Runtime-validated PortableTheme contract

`PortableTheme` is the wire shape — what gets serialised to localStorage, files, or the network — and the input surface for `deriveTheme`. Until now it lived as a TypeScript interface plus a migration ladder plus field-level setter validators (`isValidHex`, `validateCustomColorEntry`). All three guard *write* time. Nothing guarded *read* time: a corrupted localStorage record (manual tampering, schema bug, partial write, browser-storage quota mid-write) flowed straight into `deriveTheme`, where MCU would throw on the first malformed input.

**Decision:** Add a runtime schema for `PortableTheme` and validate the rehydrated state against it.

1. **Library: valibot.** `@tonex/core` will publish to npm. Tree-shaken valibot's used surface (`object`, `record`, `picklist`, `pipe`, `check`, `safeParse`) is a fraction of zod's equivalent payload; lingua-franca familiarity isn't worth the bundle delta on a colour-engine library.
2. **Where it lives.** `PortableThemeSchema` and `parsePortableTheme()` are co-located with the `PortableTheme` interface and re-exported through the `/schema` subpath.
3. **Wire-in point: post-rehydrate inside `onRehydrateStorage`.** The migration ladder runs first and lifts the persisted shape to the current version; the schema then validates the result. Schema describes the *current* shape only — it does not need to know about historical shapes, because migrate produces the current version by contract.
4. **Recovery: all-or-nothing reset to `DEFAULT_INPUTS`.** On parse failure the rehydrate handler calls `state.actions.reset()` and then flips `_hydrated`. No per-field fallback. The failure path is rare (corruption, manual tampering); per-field fallback would add maintenance surface for vanishingly rare events while obscuring the diagnostic signal ("your localStorage was reset" beats "some of your edits silently disappeared").
5. **Single source of truth for field-level checks.** `isValidHex` and `validateCustomColorEntry` are reused inside the schema as refinements — the schema does not duplicate the regex or the slug-collision logic. Setter-side validation and rehydrate-side validation share the same primitives.

**Why:**

- Migration handles cross-version shape lift. Schema handles current-shape contract. Two responsibilities, two pieces of code.
- Post-rehydrate placement keeps the schema free of `Partial<>` shapes. Inside-migrate placement would require the schema to handle "this field might be undefined because we're mid-lift" semantics.
- All-or-nothing recovery is what the user actually wants when their state is broken: a working editor. Per-field fallback produces a half-broken editor whose state silently diverges from what the user thought they had.
- Structural-then-semantic validation (object shape passes, then refinement runs) lets us reuse setter-side predicates without writing custom ones twice.

**Consequence:**

- Adding a field to `PortableTheme` requires adding it to `PortableThemeSchema`. Forgetting will not corrupt the rehydrate path (extra fields on the stored blob are accepted; missing fields fall back to `DEFAULT_INPUTS` via zustand's spread), but the new field's shape will not be validated. The round-trip test fixture exercises new fields through both write and rehydrate paths.
- Adding a new constraint to a field: add a `v.check` refinement on the schema and have the setter call into the same predicate. The schema and the setter do not get to disagree about what "valid" means for a given field.
- Bundle cost is acceptable given the contract guarantee. If bundle pressure ever becomes acute, valibot's modular API allows further trimming (per-validator imports).
- The schema is the truth-source for "what counts as a v9 PortableTheme." Documentation that names allowed values (variant names, surface algos, neutral palette names) should reference the const tuples (`VARIANT_NAMES`, `SURFACE_ALGOS`, `NEUTRAL_PALETTE_NAMES`, etc.) rather than restating the values, so the docs and the schema cannot drift.
- Migration ladder bumps still need their own forward-migration logic — the schema does not bridge versions, it validates a single version. Field additions extend the schema, defaults, and test fixture; the schema is the truth-source for the current-version shape.
- A future "import a theme from a file" path will reuse `parsePortableTheme` directly — same recovery semantics (reject the file outright on parse failure, surface a UI message). The contract is the same regardless of source.
- `validateCustomColorEntry` exposes both binary-return and message-return shapes for the same predicate — UI form-level surfacing uses the message form; the schema uses the binary form. Both call shapes coexist because the schema's per-entry refinement uses an empty existing-set, leaving cross-entry slug uniqueness to the array-level check.
