> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# Single flat source store — no slices, no sub-stores

The source-of-truth zustand store holds every persisted user choice (seed hex, variant, contrast level, surface treatment, lock state, overrides, role bindings). A reasonable-sounding suggestion is to split it into slices (`createLockSlice`, `createOverrideSlice`, etc.) or feature-scoped sub-stores once the field count grows.

**Decision:** Source state is **one zustand store** with a **flat top-level shape**. Categorisation lives in field-name prefixes (e.g. `md3*`, `shadcn*`, `surface*`, `cmf*`) — the prefix is the taxonomy, the shape stays flat. Mode-keyed records (`{ light, dark }`) are values, not slices. Actions are bundled under a single `actions` key with stable identity.

**Why:** Each slice creates a precedent for the next, and the per-feature taxonomy debate ("which slice does this go in?") replaces what should be a one-line addition. This is a stricter form of ADR-0005 — that ADR rejects facades on the output side; this one rejects fragmentation on the input side.

**Consequence:**

- New feature wants state? Add a flat field with a prefixed name. Categorisation lives in the prefix, not in nested structure.
- Don't propose `useXStore` even for genuinely orthogonal concerns (lock state, UI state, etc.) — they go on the source store as fields.
- The exception bar is high: a separate store is only justified when there is a real lifecycle boundary (e.g. ephemeral session state that must NOT be persisted, or third-party integration state owned by a library). "It feels cleaner" is not a reason.
- The persisted shape (`PortableTheme`) is the flat fields minus runtime-only fields (`_hydrated`, `actions`); flat layout makes the strip mechanical — no traversal, no slot-map.
- The lock-vs-override pair (per ADR-0007) demonstrates the rule's range: two parallel pinning concerns at materially different shapes (boolean vs per-token mode-keyed hex) live as flat siblings, not nested under a "pinning manifest."
