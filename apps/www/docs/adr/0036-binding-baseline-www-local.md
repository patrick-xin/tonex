# Binding baseline is www-local presentation state, not a PortableTheme field

The binding rail shows, per role, three faces of the same judgment: a "custom" dot, a per-row reset target, and a group highlight. They measured divergence from the fixed `DEFAULT_SHADCN_ROLE_BINDINGS`. On any non-default preset that was wrong twice over — it lit false-custom dots on untouched rows, and per-row reset restored the *default* preset's value, actively breaking the active preset (resetting `--card` on a non-default preset yanked it to default's `--card`, not the active one's).

The fix is to measure against the **active** baseline, with the ADR-0035 edge modifier composed on top. But preset detection is all-or-nothing: a hand-edit to a single non-edge role nulls detection, snapping every other row back to default-relative — the "I changed one field, why did the others change?" symptom.

**Decision:** four commitments — the unified judgment, where the fallback lives, how it fails, and how it's keyed.

## 1. One `expected` map drives custom, reset, and highlight

A single resolved `expected` binding map feeds the per-row custom dot, the per-row reset target, and the group highlight, so the three faces can never tell different stories. `expected` is the active baseline with the ADR-0035 edge modifier applied per-role; custom means the live binding differs from `expected`; reset restores `expected`. Baseline resolves active theme preset → active binding preset → fallback.

**Why:** three independently-computed "is this custom?" judgments drift apart and contradict each other on screen. One map can't.

## 2. The drift fallback is www-local persisted state, not a core field

When the bindings have drifted off every catalog preset, the fallback baseline is the last preset the user actually applied, tracked in a www-local persisted store — a sibling of ADR-0023's display-prefs store, under the same persistence discipline. Core's `PortableTheme` (ADR-0009) is untouched.

**Road not taken — a tracked `baselineBindings` field on `PortableTheme`.** Mechanically small, but rejected: it pushes a UI-presentation concern into the by-value wire shape, so every core consumer — and the future file/network import path ADR-0009 already anticipates — must serialize, validate, and migrate it forever, and a future www/core split would mean ripping it back out. It also forces a schema-version bump that wipes persisted themes. Per ADR-0023 c.2, state that doesn't drive `deriveTheme` belongs in the consuming layer; this is exactly that.

**Road not taken — detection-only with a fixed-default fallback, no new state.** This was shipped first, then superseded by this ADR. It leaves the residual gap: one non-edge edit re-poisons every sibling row to default-relative. Cheap and by-value-clean, but it is the precise symptom this ADR exists to close.

## 3. Detection stays primary; the store feeds only the drift branch

Exact preset match always wins. The store is consulted *only* when detection finds no preset. So a missed or stale baseline stamp degrades to default-relative — the prior shipped behavior — and **never** to a wrong preset. The store refines the drifted case; it is never the source of truth for identity.

**Why:** this is the safety property that made a www-local store acceptable without a core field. The worst failure mode is the old, already-lived-with behavior, not a confidently-mislabeled preset.

## 4. The baseline is keyed by bindings, not by a preset name

The store holds the applied binding map **by value**, not the name of the preset it came from.

**Why:** robust to a future where users save their own presets — the baseline is whatever bindings were applied, named or not — and it keeps the by-value model the rest of the theme uses. Storing a name would couple the baseline to the catalog and break the moment the catalog grows or a saved set has no canonical name.

## Consequences

- Every binding-mutating route must stamp the baseline. Today there are three: applying a theme preset, applying a binding preset, and reset. This is a load-bearing invariant — a fourth route that forgets to stamp degrades to default-relative; it fails safe per commitment 3 (never a wrong preset), but the "siblings relight" symptom returns. New mutating routes must stamp.
- Reset-to-defaults clears the baseline too, otherwise a post-reset hand-edit would measure against the stale last-applied preset.
- A future theme share/import path arrives with no baseline — the store is www-local and deliberately outside the wire shape. Detection-primary covers an import whose bindings exactly match a preset; a *drifted* imported theme re-opens the "siblings relight" gap on the recipient. Known and accepted; closing it is the sharing feature's job, and it is the natural place the by-value serialization story gets its own ADR.
- The pending 2025-spec binding expansion widens the role map detection compares and forces preset re-curation. This ADR's model is unchanged by that — only the catalog it measures against grows.

**Code anchors:** `apps/www/src/lib/stores/binding-baseline.ts` — the www-local baseline store, `apps/www/src/features/shadcn-rail/expected-bindings.ts` — the one expected map and detection-primary resolution.
