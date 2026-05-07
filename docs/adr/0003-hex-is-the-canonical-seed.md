> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Hex is the canonical seed representation

Most shadcn users think in hex (logos, brand books, color pickers). HCT (hue/chroma/tone) is MCU's internal perceptual representation but is unfamiliar to the target audience.

**Decision:** The seed is persisted as a hex string. HCT triple is a derived selector. Sliders that edit HCT use a transient draft buffer (current `theme-store.draft`), which commits back to hex on release.

**Why:**
- Round-tripping a picked hex through HCT decompose+recompose is lossy: `#3B82F6` becomes `#3B82F4`. Annoying for "I pasted my brand color" — which is the primary intake path.
- Persisting the user's intent (the hex they picked) is more honest than persisting the engine's decomposition.
- The `draft` buffer already exists in the current code precisely because hex-input UX fights HCT-as-canonical. This ADR makes that already-implicit truth explicit.

**Consequence:** Slider state path: HCT triple lives in a draft buffer while dragging, gets converted to hex on commit. Read path: components needing HCT call a `hctFromHex` selector. There is no `hue/chroma/tone` field on the persisted source.

## Amendment — 2026-05-05

The body references `theme-store.draft` as already existing. That was true of the prior prototype and is **not** yet true in the current rewrite — the HCT slider UI hasn't been ported, so no draft buffer exists in `packages/core/src/theme/source.ts` today. The decision (hex canonical, transient HCT draft on commit) still stands; the supporting "already exists" evidence does not. Build the draft buffer when the slider lands, not before.

## Amendment — 2026-05-06: HCT sliders commit per tick (issue #9 follow-up)

The body's "Sliders that edit HCT use a transient draft buffer... commits back to hex on release" describes the **prior prototype's** UX shape, when per-tick cost made commit-only the only affordable choice. The current production sliders (`HctControlSliders`, `PaletteColorPicker`) commit per tick — `onValueChange` writes through to the store directly, no draft buffer. Drag is live across all theme-consuming components, matching the rest of the editor (surface-tint, contrast, color picker hex typing).

**Why per-tick is now affordable:** issue #9 collapsed the streaming-input cost in core:
1. **Shared `getDerivedTheme` cache** — 1× derive per source change regardless of consumer count, vs. the prior (N+1)×.
2. **Per-token `applyDom` writes** — only changed CSS variables touch the DOM, vs. the prior full-stylesheet rewrite (see ADR-0017 amendment 2026-05-06).
3. **Debounced persist** — ~5 IO writes/sec instead of 60.

A 60Hz drag now runs ~1 derive + a handful of `setProperty` calls + at most 5 localStorage writes/sec. Comfortable inside frame budget; the draft-buffer's "defer the cost" leverage no longer pays for the UX inconsistency it created.

**What stays in this ADR:**
- Hex remains the canonical persisted seed. HCT triples are still derived selectors via `hctFromHex`, never stored.
- The intent argument (the user picked `#3B82F6`, persist that) is unchanged.
- Round-trip lossiness is unchanged — but `setSeedHue/Chroma/Tone` only round-trips on the axis being edited, and `hctFromHex(s.seedHex)` is recomputed each tick from the up-to-date hex.

**What no longer applies:**
- The "transient draft buffer while dragging" pattern. No `draft` field will be added to source. If a future input regresses streaming cost, the fix is in core (cache, applyDom, persist), not a per-input draft.
