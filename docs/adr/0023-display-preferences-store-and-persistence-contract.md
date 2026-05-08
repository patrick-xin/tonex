> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Display preferences — taxonomy, store boundary, persistence contract

ADR-0021 line 128 pre-authorized "lift to a small UI store when a second consumer appears." `color-roles-list` (the role inspector at `/theme/color-roles`) is that consumer: it wants the same extended-token visibility filter that the export dialog has surfaced as a local toggle. The lift is small in code; the principles it forces are not. UI prefs are state that *isn't* portable theme (ADR-0017), and the auth/server-sync roadmap means today's localStorage shape is tomorrow's wire contract — committing the boundaries now is cheaper than re-litigating per pref.

**Decision:** seven commitments, organized from concept to mechanism.

## 1. Three-category taxonomy

State formerly grouped as "UI prefs" partitions into three categories with distinct lifecycles:

- **Display preferences** — long-lived, applicable across the whole app, sync-eligible when authed. Examples: `showExtended`, `showTwColorPicker`, inspect `colorFormat`, `showContrastWarnings`, `contrastAlgorithm` (`'apca-w3' | 'wcag2'`). The user's question: *"how do I want the app to look across all my uses?"*
- **Session state** — bounded to a working context, sync-eligible for *resume*. Examples: theme being edited, panel layouts, dialog scratch state. Out of scope for this ADR; documented as a future store when its first consumer (likely auth) lands.
- **Job parameters** — ephemeral to a single action. Examples: `includeExtended`, `includePalette`, `includeChart`, `includeContrastVariants`, and `colorFormat` *in the export dialog*. The user's question: *"what do I want in this export I'm about to copy?"*

The categorization is not a UX nicety — it determines which artifact owns the state. Each category gets a different home; conflating them is the failure mode this ADR prevents.

**Why:** ADR-0021 said "UI prefs aren't portable theme" but didn't subdivide what UI prefs *are*. Without subdivision, the export dialog's per-action toggles look like preferences, and lifting them seems natural. They aren't, and it isn't.

## 2. `useUiPrefs` is display-preferences-only; lives in www

`apps/www/src/lib/stores/ui-prefs.ts` hosts a zustand store named `useUiPrefs` for display preferences. Job parameters stay React-local in their owning feature — the export dialog keeps its `ExportOptions` toggles unchanged. Session state earns a separate store when its first consumer materializes.

`useUiPrefs` lives in www, not in `@tonex/core`, mirroring ADR-0021's layered-boundaries discipline. `@tonex/core` owns theme-engine inputs (`useSource`); www owns app UX. Display prefs don't drive `deriveTheme` — they drive what UI components render — so they belong in the consuming layer.

**Why:** the layer boundary keeps `@tonex/core` reusable by non-www consumers (Lumi, future tools) without dragging app-shell preferences along.

## 3. App-level single source of truth, no override; divergent semantics lift as two prefs

A display pref in `useUiPrefs` is the only source of truth for that pref across all consumers. The dialog-seed-with-local-override pattern is **rejected** — two visible toggles disagreeing is a UX bug we close at the architectural level.

When two surfaces *appear* to want the same pref but mean different things — the canonical example is `colorFormat`: inspect's "what format do I want in tooltips across all browsing" vs export's "what format do I want in this paste" — they are not the same pref. The display-pref half lifts as `colorFormat` (or whatever name fits the inspect surface); the job-parameter half stays in `ExportOptions`. **Two named items, not one item with override semantics.**

**Why:** the seed-then-override pattern is exactly where two-toggles-disagreeing UX bugs originate. Naming the divergence as a category mismatch (display pref vs job parameter) resolves the apparent conflict at compile time.

## 4. Display popover canonical; MdRail-portable-state boundary

Display preferences surface in a "Display" popover (gear or eye icon) composed into `features/nav-tabs/`. **Not** "Settings" — that name reads as system-y stuff (account, language, theme name); "Display" reads as "what I see in this app," which is what these prefs are.

`MdRail` (`features/md-rail/`) holds *controls that change the derived theme* — portable state per ADR-0017 (source color, scheme variant, contrast level, palette overrides, custom colors, surface adjustments). The Display popover holds *prefs that change what I see without touching the theme*. Each surface stays focused; nothing slides into either as a junk drawer. The split is principled — state-class boundary, not chrome aesthetics.

A pref may *also* surface inline next to its affected content for discoverability, writing the same `useUiPrefs` field — single source of truth, multiple access points, no conflict (commitment 3 still holds because both write-paths target the same store key). Not the default; case-by-case as discoverability demand emerges. `showExtended` ships popover-only (keyboard shortcut covers power-user access; inline duplication would clutter the role-list header without earning its keep).

**Why:** MdRail bloats fast if portable-state controls and visibility prefs co-mingle. Naming the boundary by *what kind of state lives here* (not by *which chrome it sits in*) gives every future pref an unambiguous home.

## 5. Versioned persistence schema; sync-eligible when authed

The store mirrors `useSource`'s actions-namespace shape:

```ts
interface UiPrefs {
  showExtended: boolean
  // add fields ONLY when a second consumer materially needs them (commitment 6)
}

interface UiPrefsActions {
  setShowExtended(next: boolean): void
  reset(): void
}

type UiPrefsState = UiPrefs & {
  _hydrated: boolean
  actions: UiPrefsActions
}
```

`selectUiPrefs(s)` is a two-key blacklist (`_hydrated`, `actions`) — adding new prefs auto-flows through `partialize`; adding new actions auto-stays out of persistence. Same maintenance-free pattern as `selectPortable` in `useSource`.

Persistence: `localStorage` via `createJSONStorage`, name `'tonex-ui-prefs'`, version starts at 1. Migration ladder follows ADR-0009 discipline as fields land. **The persisted shape is a wire contract**, not implementation incidentalia — when auth ships, the same shape lifts to a server-backed storage adapter without migration. The sync mechanism itself (storage-adapter swap, conflict resolution, offline cache) is parked; the schema discipline is committed now.

**Why:** treating localStorage as a contract today is the cheapest way to make tomorrow's server-sync mechanical. The auth-tier feature *"your prefs roam across devices"* becomes a backend implementation detail, not a frontend rewrite.

## 6. Scope-creep guard: second consumer materially needs it

A pref enters `useUiPrefs` only when a *second* consumer materially needs it. The first consumer doesn't lift — it owns the state locally. Speculative store fields drift, accumulate, and require migration entries when they were never actually shared.

"Materially needs" is the test. Two consumers happening to render the same boolean is not enough — the boolean has to mean the same thing to both, and changing it must produce the same intent across both. When the answer is "different intent," see commitment 3 — the right move is two named prefs, not one shared with override.

**Why:** ADR-0021's "lift on second consumer" rule, made permanent and category-aware. This ADR's existence is itself an instance of the rule firing — `color-roles-list` was the second consumer for `showExtended`.

## 7. Pattern-deviations from useSource

The store mirrors `useSource`'s shape but deliberately diverges on three details:

- **No debounce.** `useSource` debounces 200ms because slider drag streams writes at ~60Hz (Issue #9). Display prefs flip one at a time on user click — debouncing is unnecessary complexity. Plain `localStorage` via `createJSONStorage`.
- **No consumer null-gate on `_hydrated`.** Display prefs are visibility-only — the pre-hydrate state IS the lean default, which is the safe-to-display default. Worst case: one-frame flicker if the user had toggled a pref on. Acceptable for cosmetic prefs; *not* acceptable for portable-theme state, which is why `useResolvedTokens` rightly null-gates per ADR-0015. The `_hydrated` flag stays exposed: a future pref where pre-hydrate flicker would be unacceptable can null-gate locally without changing the store contract.
- **No `flushPersist` seam.** `useSource` exports `flushPersist` for tests and lifecycle handlers because the debounced queue needs draining. With no debounce, no queue, no seam.

**Why:** patterns earn their cost when the access pattern justifies them. Click-driven display prefs have a different cost profile than drag-driven theme inputs; matching the pattern blindly would import complexity without import value.

## Consequences

- Export include-flags (`includeExtended`, `includePalette`, `includeChart`, `includeContrastVariants`) **never lift** to `useUiPrefs`, regardless of how many surfaces eventually share their shape. They are job parameters by category; sharing happens through the action's argument signature, not a store field. A future inspect UI that wants its own visibility filter for the same underlying capability gets its own display pref (commitment 1) — `useUiPrefs.showExtended` and `ExportOptions.includeExtended` coexist as deliberately independent switches with the same name pattern.
- The auth/server-sync swap is mechanical: replace `createJSONStorage(() => localStorage)` with a server-backed adapter (with localStorage cache for offline), keep the schema and the migration ladder, consumers don't change. Schema bumps require ladder entries per ADR-0009.
- "Should this be a pref?" routes through the taxonomy: display → `useUiPrefs` (with second-consumer guard); session → future store; job parameter → React-local. Disagreement about which category a flag belongs to is the productive disagreement.
- ADR-0021 line 128 is **superseded** by this ADR's commitments 1, 2, 5, and 6. The "lift to a small UI store when a second consumer appears" rule is preserved (commitment 6); the surrounding context (categorization, layer boundary, persistence contract) is added.
- `docs/agents/code-conventions.md` gains a one-paragraph reference pointing to this ADR's taxonomy and boundary rules so the convention layer stays in sync without restating the contract.
- The Display popover's first occupant is `showExtended`. Future occupants enter only via commitment 6 (second-consumer guard); the popover is not a junk drawer for "things we might want a switch for someday."
