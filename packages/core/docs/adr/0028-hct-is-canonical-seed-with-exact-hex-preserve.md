> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# HCT is the canonical seed, with exactHex preserved across hex-input paths

Supersedes ADR-0003 ("Hex is the canonical seed representation"). The hex-as-canonical model held while the only slider drift surface was per-axis round-tripping — fixable by per-tick precision (issue #56, fixed in PR #58). Issue #57 exposed a second, structural drift that cannot be patched at the slider layer: in the `CHROMA_HUE_LOCK` regime (`chroma < 4`), a chroma-only touch silently rotates the underlying hue by up to **12.888°**, because `hexFromHct → hctFromHex` is not an identity at low chroma — MCU's solver picks a different in-gamut hue when chroma changes. The slider's hue is disabled at that point on the principle "hue has no perceptual signal here," but the persisted seed encodes a hue regardless; downstream consumers (chart palette via `MULTI_HUE_OFFSETS`, custom-color blending, any subsequent chroma rise) see the rotated value, not the user's pick. The "lock" is cosmetic; the state moves underneath.

The only way to make slider state honest is to stop the round-trip — which means HCT, not hex, has to be the persisted source of truth.

**Decision:** `PortableTheme.seed` becomes a canonical HCT record with an optional `exactHex` slot:

```ts
seed: {
  hue: number
  chroma: number
  tone: number
  exactHex?: string  // present iff the user's last seed-write came through a hex-input path
}
```

- **Slider setters** (`setSeedHue`, `setSeedChroma`, `setSeedTone`) write the HCT axis directly and **clear `exactHex`** — the user is manipulating the HCT space now, so any pasted hex is no longer the live intent.
- **Hex-input setters** (paste, native picker, image extraction) write both: `seed = { ...hctFromHex(hex), exactHex: hex }`. Two writes, one invariant: when `exactHex` is set, it equals `hexFromHct({hue, chroma, tone})` modulo solver epsilon, with the user's exact bytes preserved.
- **`seedHex` is a derived selector**: `s.seed.exactHex ?? hexFromHct(s.seed)`. Read sites that need a hex (exporters, `applyDom`, hex-input field display) call the selector. Read sites that need HCT (sliders, gradients) read the canonical fields directly — no `hctFromHex(s.seedHex)` anywhere in product code.

**Why preserve `exactHex` instead of going pure-HCT canonical:** ADR-0003's primary motivating example — `#3B82F6` round-trips through HCT to `#3B82F4` — is real and unchanged by this decision. Pasting a brand hex and immediately seeing it silently mutated is the worst possible first-touch UX for the primary intake path. `exactHex` preserves the user's pasted bytes verbatim until they actively choose to leave hex-mode by dragging an HCT slider. At that moment the HCT canonical takes over (which is what they're now manipulating anyway), and `exactHex` is cleared. Both intent regimes are honoured at the layer where each is the live one.

**Why not dual canonical with `lastTouched`:** symmetric storage of both `seedHex` and `seedHct` plus a discriminator multiplies the invariants every read site has to honour, and adds a third value (the flag) whose corruption silently flips interpretation of the other two. `exactHex?` is a single-direction lean — HCT is *always* the canonical axes; `exactHex` is a non-load-bearing decoration that only affects the hex-projection selector.

**Consequence:**

1. **`PortableTheme.seedHex` (the persisted string field) is removed.** `seed: {hue, chroma, tone, exactHex?}` replaces it. Pre-launch breaking change — bump `SCHEMA_VERSION`; no migration ladder while there are no live users to preserve (ADR-0009 c.4). Existing localStorage rehydrate fails schema parse, recovers via `state.actions.reset()` per ADR-0009.
2. **`seedHexLock` continues to gate every seed-input pathway** at the store seam — it's now phrased as "lock the canonical seed" but applies identically to HCT-axis setters, hex-input setters, image extraction, and any future seed source. The lock-vs-override pair (ADR-0007) is unchanged.
3. **`useHctFromHex` hook collapses to a thin selector + update pair.** The hook exists today as a legacy HCT-cache hook in the editor rail to hold an HCT cache locally and dodge the 0↔360 round-trip — that cache becomes redundant once HCT is canonical in the store. The 5e-3 tolerance gate (issue #56 fix) stays at the setter layer as defense-in-depth.
4. **`CHROMA_HUE_LOCK = 4` UX is unchanged** — the hue slider still visually disables when `chroma < 4`. The fix is structural: with HCT canonical, the hue field is *preserved* across a chroma touch instead of being recomputed from the new (chroma, tone) hex. The visual lock now matches the underlying state.
5. **Reconciles with ADR-0006 (single flat source store).** `seed: {hue, chroma, tone, exactHex?}` is a nested record, but ADR-0006's prohibition is on nested struct slots used for *categorisation* ("which slice does this field go in?"). A canonical seed is a *value* — parallel to `{ light, dark }` mode-keyed records, which ADR-0006 explicitly classifies as values, not slices. The flat-store rule remains intact.
6. **Reaffirms ADR-0017 (WYSIWYG no preview/export drift).** This change is upstream of `deriveTheme` — every Sink still consumes the same `deriveTheme(source) → {md, shadcn, warnings}` output. The drift this ADR closes is *between source-state and user-intent*, not between preview and export. The byte-equality contract (`applyDom` ≡ exporters) holds because both still derive from `seedHex` (now via the selector) the same way.

**Acceptance criteria:**

1. `PortableTheme.seed: {hue, chroma, tone, exactHex?}` is the persisted source of truth; `PortableTheme.seedHex` (the field) is removed.
2. Wide sweep across the `chroma < 4` regime (the 75-seed probe surfaced in #57): after any chroma-only or tone-only setter call, `|Δhue|` is bounded by solver epsilon (effectively 0).
3. Lock-release case: dragging chroma from 3.99 → 4.5 preserves the original hue. Today this drifts up to 3.3° on 8/15 probed seeds.
4. Hex-paste preservation: `setSeedFromHex('#3B82F6')` followed by a `seedHex` selector read returns `'#3B82F6'` exactly — not `#3B82F4`. Any HCT-axis setter call after that clears `exactHex`; the next selector read returns `hexFromHct(seed)`.
5. ADR-0009's schema-bump procedure followed: `SCHEMA_VERSION` bumped, `PortableThemeSchema` updated, `DEFAULT_INPUTS` and `NONDEFAULT_INPUTS` updated, round-trip test exercises the new shape.
6. Drift-guard test (the #56 setter-tolerance suite) is extended with a low-chroma-no-hue-drift assertion that fails on master and passes after this change.
