# Edge weight is an ambient modifier under preset identity

The shadcn layer carries one user knob, `shadcnRoleBindings` (ADR-0026) — a flat per-mode map from each shadcn role to an MD token name. "Soft-border" — softening the UI's edges to a hairline outline — is expressed *inside* that map by re-pointing three edge roles at the soft token. But it was positioned as a governing setting (its own toggle, mode-symmetric, living in a settings panel) while stored as ordinary binding content that presets also own. A setting that should sit *above* the preset tier was implemented *inside* it, collapsing two layers into one field.

Two symptoms followed. Toggling soft-border dropped both preset pickers to "Custom", because detection exact-matched the full binding map — nothing was hand-edited, yet the theme read as off-catalog. And applying a preset silently reset the edges to hard, because the preset's curated bindings overwrote them — soft-border didn't survive a switch the way a global style should.

**Decision:** three commitments — the cut, how the state is held, and how it travels.

## 1. Edge roles are a sub-axis, factored out of preset identity

`--border`, `--input`, and `--sidebar-border` form the edge-weight sub-axis. `--ring` is deliberately **excluded**. The "which preset is active" matchers compare every role *except* these three — so two themes that differ only in edge weight are the **same** preset, reported with an edge annotation, not as custom.

**Why exclude `--ring`:** the focus ring is intentionally loud and already varies across presets on its own (some route it to the outline, some to primary). Folding it into the edge axis would make "edge" mean two unrelated things and let a ring difference masquerade as an edge change.

**Road not taken — strip edges from identity entirely.** Treating all three edge roles as never-part-of-identity (match presets on the non-edge roles, ignore edges completely) was rejected: a non-standard edge binding — say a user routes `--border` to primary — would then be *invisible*, silently swallowed by the active preset. The roles must stay individually honest, so the rule recognizes the *standard* edge transforms (hard, soft) and reports anything else as a custom edge ("noir · custom edges").

## 2. Edge weight is read from the bindings, never stored as provenance

Whether the theme is "soft" or "hard" is **computed** from the edge roles — do they all point at the hairline edge, in both modes? — not held as a separate boolean above the binding tier. There is a soft end and a hard end of the axis; any asymmetry (one mode soft, a single edge drifted, an off-outline custom edge) reads as not-soft.

**Why:** a governed `softBorder` field would have to remove the three edge roles from the free-binding pool — but binding `--border` to a non-edge token, though rare, must never be blocked (the standing constraint on this layer). Reading the state back out of the bindings keeps the roles fully bindable and keeps the model by-value, consistent with ADR-0026's symbolic-binding cut and the project's avoidance of stored provenance.

**Road not taken — a stored governing flag.** Rejected for the pool-removal cost above and the provenance it would introduce into a layer that is otherwise pure by-value bindings.

## 3. Applying a preset is ambient sticky-soft

Preset-apply re-asserts the *current* edge weight on top of the preset's curated bindings: a soft edge weight survives a switch the way dark mode does. Hard and hand-set ("custom") edges are **not** carried — a preset that bakes its own soft edges keeps them.

**Why:** soft-border reads as a durable preference ("I like soft edges everywhere"), so it should ride along a switch; a one-off custom edge reads as local intent that a deliberate preset switch is entitled to replace. The asymmetry is the point.

**Road not taken — symmetric "the setting always governs"** (carry every edge state across switches) and **"no ambient"** (apply always lands the preset's literal edges, soft-border resets on every switch). The first over-carries — it resurrects "why did my edges follow me?" in the other direction for custom edges; the second makes soft-border feel broken, silently lost on every switch.

## Consequences

- Both matchers — theme-preset and binding-preset — are edge-tolerant, so the picker stays lit through a soft-border toggle and no longer trips the preset-switch dialog.
- The three edge roles remain fully user-bindable; nothing is removed from the editor or the schema, and no schema version bumps.
- Presets are re-curated so "off" genuinely lands the hard edge — standardizing every preset's edges, so "off = outline" stops being a lie in one of the two confusion directions.
- www builds the presentation half on top: "custom" is divergence from the *active* baseline with this edge modifier composed per-role — see ADR-0036. The core decision stops at how identity and apply treat edges; how a row renders its custom dot is a www concern.
- The override UI groups four roles as the visual "edge" family (it includes `--ring`), but the axis is three. Intentional, and worth saying aloud so "edge" isn't read as four.

**Code anchors:** `packages/core/src/theme/edge-weight.ts` — the sub-axis SSOT (soft/hard ends, read-not-stored), `packages/core/src/theme/preset-apply.ts` — the ambient sticky-soft re-assertion.
