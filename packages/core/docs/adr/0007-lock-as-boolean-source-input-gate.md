# Lock is a boolean source-input gate, not a derived-side snapshot

A reasonable-sounding suggestion for "pin a color" is a per-token derived snapshot — a struct that captures rendered values and replays them on every derive. We considered it (`lockedSnapshot: LockedSnapshot | null`) and rejected it after threat-modeling the user's actual behavior.

**Decision:** Lock is a **boolean field on the source store** that gates *input* writes. Today there is one such field:

```ts
seedHexLock: boolean
```

When `true`, every seed-mutation pathway (`setSeedHex`, `setSeedHue`, `setSeedChroma`, `setSeedTone`, image-extraction picker) early-returns without touching state. UI disables the corresponding inputs at the same moment. The locked seedHex stays at its lock-time value because writes are blocked — no separate snapshot is stored.

**Why:** The user's mental model is "prevent accidental touch of the input" — the threat surface is the seed-input pathway, not the rendered output. Three reasons against the snapshot variant:

1. **Per-token lock collides with override.** Locking *after* setting overrides would either destroy the overrides or silently take precedence — both are destructive UX.
2. **Source-input gate keeps lock orthogonal to override.** Different fields, no precedence question, no merge logic in derive.
3. **Pinning identity ≠ pinning rendered values.** The user wants "this hex stays this hex"; the values it produces follow whatever variant / contrast / surface treatment is in play. That's exactly what blocking input writes delivers.

**Consequence:**

- Lock and override are **orthogonal flat siblings** on `PortableTheme`. Override is per-token, mode-keyed, hex-valued. Lock is global, not-mode-keyed, boolean. Two parallel pinning concerns at materially different shapes — the difference is the proof that ADR-0006's single-flat-field rule handles both without nesting.
- Centralisation is load-bearing: every seed-mutation pathway routes through the one source-seam gate, so a pathway that forgets it leaks the lock.
- Reset (`reset()` action) is allowed to bypass the gate; reset restores `DEFAULT_INPUTS` whose `seedHexLock` is `false` again. Locking does not survive reset.
- The rejected `lockedSnapshot` struct stays closed: future "lock another input" needs are new boolean fields, not a struct — a narrower lock surface, fewer surprises.
- Disable invalid interaction states up-front (UI tooltip + greyed input) rather than allowing the action and emitting a runtime warning. The lock toggle and the lock-aware setters are both consumers of the same boolean source-of-truth.

**Code anchors:** `packages/core/src/theme/source.ts` — lock is a boolean source-input gate, not a snapshot.
