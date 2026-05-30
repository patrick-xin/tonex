> **State:** Living. Edit when a source-store, lock, seed, or schema rule changes; the why lives in the cited ADR.

# Source store · lock · seed · schema

Governs `theme/source.ts` and `theme/schema.ts`.

## Store + lock — flat store, boolean gate
- **One flat zustand store, no slices.** New state = flat field with a prefixed name; don't propose `createXSlice`, sub-stores, or `useXStore`. Exception bar is a real lifecycle boundary (e.g. ephemeral state that must not persist). _(ADR-0006)_
- **Categorisation via prefix, not nested structure.** Prefix is the taxonomy; shape stays flat. Mode-keyed `{ light, dark }` records are *values*, not slices. _(ADR-0006)_
- **Actions bundled under a single `actions` key.** Stable identity, single import target. Runtime-only fields (`_hydrated`, `actions`) are stripped from the persisted shape via `selectPortable`. _(ADR-0006)_
- **Lock is a boolean input gate.** Every seed-mutation pathway (`setSeedHex`, `setSeedHue`, `setSeedChroma`, `setSeedTone`, image-extraction picker) early-returns when `seedHexLock === true`. A forgotten gate leaks the lock. _(ADR-0007)_
- **Lock ≠ snapshot.** Don't store rendered values; the gate blocks input writes, so the locked seed stays at its lock-time value. _(ADR-0007)_
- **Future "lock another input" → new boolean field.** Don't reach for a struct (`lockedSnapshot`) or per-token map. _(ADR-0007)_
- **Reset bypasses the gate.** `reset()` restores `DEFAULT_INPUTS`; locking does not survive reset. _(ADR-0007)_
- **Disable invalid states up-front in UI.** Lock-aware setters and the lock toggle consume the same boolean source-of-truth; don't allow the action then emit a runtime warning. _(ADR-0007)_

## Seed — canonical HCT, optional exact hex
- **HCT is canonical; `exactHex` is optional preserve.** Persist `seed: { hue, chroma, tone, exactHex? }`. **Don't reintroduce a top-level `seedHex` field.** _(ADR-0028 c.1)_
- **Slider setters clear `exactHex`.** `setSeedHue/Chroma/Tone` write the HCT axis directly and drop `exactHex` — the prior pasted hex is no longer live intent. _(ADR-0028)_
- **Hex-input setters write both.** Paste, native picker, image extraction write `seed = { ...hctFromHex(hex), exactHex: hex }`. _(ADR-0028)_
- **`seedHex` is a derived selector** — `s.seed.exactHex ?? hexFromHct(s.seed)`. No `hctFromHex(s.seedHex)` in product code. _(ADR-0028)_
- **No dual canonical with `lastTouched`.** Storing both `seedHex` and `seedHct` plus a discriminator was rejected; `exactHex?` is the single-direction lean. _(ADR-0028)_
- **`seedHexLock` gates the canonical seed** identically across HCT-axis setters, hex-input setters, image extraction, and any future seed source. _(ADR-0028 c.2)_

## Schema / PortableTheme — wire shape + valibot
- **Adding a field extends `PortableThemeSchema`, defaults, and the round-trip fixture.** Forgetting won't corrupt rehydrate (extras accepted; missing fall back to `DEFAULT_INPUTS`) but the field goes unvalidated. _(ADR-0009)_
- **valibot, not zod.** `@tonex/core` publishes to npm; the bundle delta isn't worth lingua-franca familiarity. _(ADR-0009 c.1)_
- **Schema validates current shape; `migrate` lifts across versions.** Two responsibilities, two pieces of code. _(ADR-0009)_
- **Validation runs post-rehydrate inside `onRehydrateStorage`.** Migrate runs first; schema validates the result, never a `Partial<>`. _(ADR-0009 c.3)_
- **Field-level predicates are shared.** A new constraint adds a `v.check` refinement and the setter calls the same predicate. _(ADR-0009 c.5)_
- **Recovery is all-or-nothing reset.** On parse failure the handler calls `state.actions.reset()` then flips `_hydrated`. No per-field fallback. _(ADR-0009 c.4)_
- **No forward migrations while there are no live users to preserve.** A `SCHEMA_VERSION` bump currently leans on the reset above rather than a `migrate` branch — older persisted records fail schema parse and reset to `DEFAULT_INPUTS`. Add a forward-migration branch in `migrate` once persisted user state must survive a bump. _(ADR-0009 c.4)_
- **Schema is the truth-source for allowed-value tuples** (`VARIANT_NAMES`, `SURFACE_ALGOS`, `NEUTRAL_PALETTE_NAMES`, …); restating the values is the drift class. _(ADR-0009)_
