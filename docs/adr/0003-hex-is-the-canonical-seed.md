> **State:** Frozen. Append amendment blocks only — never rewrite the body. New decisions get new ADRs.

# Hex is the canonical seed representation

Most shadcn users think in hex (logos, brand books, color pickers). HCT (hue/chroma/tone) is MCU's internal perceptual representation but is unfamiliar to the target audience.

**Decision:** The seed is persisted as a hex string. HCT triple is a derived selector. Sliders that edit HCT use a transient draft buffer (current `theme-store.draft`), which commits back to hex on release.

**Why:**
- Round-tripping a picked hex through HCT decompose+recompose is lossy: `#3B82F6` becomes `#3B82F4`. Annoying for "I pasted my brand color" — which is the primary intake path.
- Persisting the user's intent (the hex they picked) is more honest than persisting the engine's decomposition.
- The `draft` buffer already exists in the current code precisely because hex-input UX fights HCT-as-canonical. This ADR makes that already-implicit truth explicit.

**Consequence:** Slider state path: HCT triple lives in a draft buffer while dragging, gets converted to hex on commit. Read path: components needing HCT call a `hctFromHex` selector. There is no `hue/chroma/tone` field on the persisted source.
