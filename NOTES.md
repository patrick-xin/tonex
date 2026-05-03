# Theme Tool — Design & Working Notes

Handoff doc. Read first next session. Two parts: (1) the design we converged on for the theme tool itself, (2) the harder, more durable conversation about how to work with Claude on a codebase that's already drifted.

---

## Part 1 — Project context

Building a tool where shadcn users don't worry about colors.

- **Input**: upload a logo (or paste a hex)
- **Process**: MCU extracts seed candidates, generates a scheme in a chosen mood, mapping converts MD3 tokens → shadcn tokens
- **Output**: copy-paste `globals.css` block (shadcn defaults: `:root` + `.dark`, oklch, `@theme inline` for Tailwind v4)
- **CLI later**, web tool first

**Stack constraints (locked):**
- Next.js, Tailwind v4
- base-ui — pre-styled to look shadcn but consuming MD tokens. This is a dual-audience play: same chrome later powers an MD-flavored page. Don't replace.
- MCU (Material Color Utilities)
- zustand with persist
- No backend

**Wedge / why this beats tweakcn, realtimecolors, shadcn themes page:**
MCU produces well-conditioned palettes (HCT/CAM16, accessibility-aware) in 5+ distinct moods from one seed. The live mood-shift demo from one uploaded logo is the unique pitch. Competitors don't have this because they don't use MCU.

---

## Part 2 — System design

### State layers

```
SOURCE (zustand, persisted)       DERIVED (pure, in-memory)         SINKS (DOM)
─────────────────────────         ─────────────────────────         ──────────
seedHex                      →    mdTokens                       →  chrome scope
variant                           shadcnTokens                      preview scope
contrastLevel                     exportCss                         clipboard
mappingOverrides                  warnings                          inline UI

NOT persisted: logoBlob. Only the extracted seed swatches persist. The
logo is not the artifact; the seed is.
```

**Rule**: zustand stores only what the user *picked*, never what the machine *computed*. Reload → same source → same derivation → same render. No invalidation logic. No race between persisted and computed state.

### Deep modules (Ousterhout sense — narrow interface, hidden complexity)

```
lib/theme/derive.ts          deriveTheme(source) → {md, shadcn, css, warnings}
                             Hides: MCU construction, mapping table, oklch
                             conversion, WCAG checks. Pure. Synchronous.

lib/image/extractSeeds.ts    extractSeeds(blob) → SeedCandidate[]
                             Hides: canvas decode, QuantizerCelebi,
                             Score.score, neutral fallback. Async.

lib/store.ts                 useThemeStore() → SourceState + setters.
                             Source-only. Persisted via zustand middleware.

components/preview/*         shadcn components, fed via CSS scope on container
components/chrome/*          base-ui components, fed via CSS scope on container
components/export/CopyBlock  reads exportCss, writes to clipboard
```

`deriveTheme` is **one synchronous function**, not a pipeline of `useMemo`s. MCU is <5ms; mapping is a lookup; CSS string is a join. One memo keyed on source is the same cost as four chained memos and is simpler.

### Errors & feedback

Errors surface where the user's attention already is for that action. Toasts only for actions that complete out-of-context.

| Origin | Surface |
|---|---|
| Logo decode failure | inline at upload control, blocking |
| Logo all-neutral (low chroma) | non-blocking banner above seed row |
| Override produces sub-WCAG | inline warning icon next to the token in mapping UI |
| Clipboard write denied | toast, retryable |
| Rehydrate failure | silent reset to defaults |

Warnings are **returned from `deriveTheme` as a `Warning[]` array**, not thrown. The UI decides where to render each by its `kind` field. Throwing from a pure derivation function is the wrong shape — it forces error boundaries around what should be a render.

### Inputs (locked)

Full MCU UI wrapper. Logo upload, seed swatch row (5 candidates from `Score.score`, user can re-pick if the algorithm guessed wrong), scheme variant, contrast level, per-token override, per-token mapping rewire for power users.

**The "upload → done" promise has one exception**: the seed swatch row. Multi-color logos (Slack, Instagram) trip pure-algorithmic seed picks ~10% of the time. One click of escape valve, no modal.

### Token mapping (default)

One hardcoded MD3 → shadcn table, exposed as a wiring UI for power users to rewire. Mismatch is sometimes the point. Default calls:

- `--background` ← `surface`, `--foreground` ← `onSurface`
- `--card` ← `surfaceContainerLow`, `--popover` ← `surfaceContainerHigh`
- `--muted` ← `surfaceContainerHighest`, `--muted-foreground` ← `onSurfaceVariant`
- `--secondary` ← `secondaryContainer`, `--accent` ← `tertiaryContainer`
- `--border` ← `outlineVariant`, `--input` ← `outline`, `--ring` ← `primary`
- `--destructive` ← `error`, `--destructive-foreground` ← `onError`
- `--chart-1..3` ← primary/secondary/tertiary; **`--chart-4..5` is the gap MCU doesn't fill** — derive from rotated tones with a "regenerate" affordance, and call this gap out honestly to the user
- `--sidebar-*` reuses the main mapping with a one-step elevation bump

---

## Part 3 — Working with Claude (the durable conversation)

This part matters more than Part 2, because Part 2 can be re-derived from a session and Part 3 cannot.

### The hard truth

**Claude is dominated by what it reads.** If the store has `setTokenOverride(mode, token, hex)`, the next action Claude adds will have `setSurfaceTintLevel(mode, level)`. Local file context beats CLAUDE.md every time, because the file is in front of Claude at generation time and CLAUDE.md is a paragraph it read 200 lines ago.

**Bad code begets bad code.** Pattern continuation isn't laziness; consistency is usually correct. The failure mode is when the pattern itself is wrong — then consistency *is* the bug.

**CLAUDE.md is not the load-bearing intervention.** Rules drown in pattern-matching gravity from a thousand existing files. Useful for things code can't express ("no backend ever", "warnings returned not thrown", "the copy-paste CSS string is the public contract"), useless for shape rules that the code itself contradicts.

### What survives across sessions

Only the code. Therefore the only durable intervention is to lift the code itself.

### How to actually work with Claude on this codebase

1. **Foundation files are templates, whether labeled or not.** The store, the central types file, the most-imported utility — every new file pattern-matches against these. Fix the foundations and subsequent files inherit.

2. **Comments in foundation files survive sessions.** A `// why: setPreset clears overrides because the preset is the new baseline, but tint levels persist because they're a viewing preference, not a theme value` is read at the moment of generation. CLAUDE.md is read before. In-file comments win.

3. **Human role: curator, not enforcer.** When Claude produces something off, the move is "model your code on file X," not "you violated rule 3." Examples beat abstractions.

4. **CLAUDE.md shrinks to ~10 lines.** Only constraints that have no in-code home. Examples:
   - No backend; client-only.
   - `deriveTheme` stays pure; zero React imports in `lib/theme/`.
   - Warnings are returned, never thrown.
   - The copy-paste CSS string is the public contract — its format is stable across refactors.

5. **Within a session, explicit corrections work.** "Don't add `mode` as a parameter — restructure" is followed. The problem is that corrections evaporate at session boundary. Therefore: **commit corrections to the code** so they compound.

### Working agreements (these stick only if foundation files exemplify them)

- Zustand persists only user input. Anything derivable is a selector.
- If the same parameter (e.g. `mode`) shows up in ≥3 action signatures, it's structural — restructure the data, don't add a 4th.
- `partialize` is a blacklist of ephemerals, not a whitelist of fields. Inverted = no maintenance.
- Schema change → real `migrate` function, or bump `version` and accept the reset. No `as` casts to silence types.
- Inconsistent choices need a comment with the *constraint that drove them*. If the why can't be articulated, the choice is wrong; make it consistent instead.
- Components import from `lib/store/hooks.ts`, never the store directly. The store's internal shape is implementation, not API.

---

## Part 4 — Honest feedback (from Claude)

What I did badly in this conversation:

1. **Asked too many implementation-detail questions early** (export color space, light/dark shape) when you wanted strategy. You called this out. Higher-altitude questions first; descend only when foundations are settled.

2. **Dismissed the other model's "platform thinking" response too quickly.** I graded it against "solo dev, no users, casual build" when your real target was "AI-collaborator-friendly + viral-resilient." That's a different bar. The response had bad parts — monorepo split now, 4-week deadlines on an unshipped tool, observability MVP without a backend to send events to — but the *artifacts* it asked for (architecture doc, decision records, CLAUDE.md) are correct under your actual target. I conflated "no users" with "low investment." Different things.

3. **Underestimated how much the codebase shapes my output.** Your final point cut to the heart of it. The fix is fixing the code, not adding rules. I should have led there instead of proposing CLAUDE.md as the primary lever.

What I did okay:

- The source/derived/sinks split is the right shape; would recommend again.
- The diagnosis of the store you pasted was specific and named real bugs (softBorders as derived-stored-as-source, mode-as-parameter spreading, partialize as whitelist, type-cast migration, undefined-vs-deleted in `removeRoleBinding`, no public/internal boundary). Use it as a template for diagnosing other foundation files next session.
- "Examples beat abstractions for guiding Claude" is a real, durable principle and worth pinning.

What I still don't know:

- Whether the existing project's drift looks like the store I diagnosed, or follows different patterns. Need to see foundation files.
- Which files are most-imitated in your project — those are the priority for refactor.
- Whether MCU's seed extraction is good enough on real-world multi-color logos to support the "upload → done" promise. Need empirical testing once anything ships.

---

## Part 5 — Next session plan

Bring foundation files from the existing project (not this empty folder). Start with the most-imitated ones — probably the central store, top-level types file, or most-imported utility.

Use the diagnosis approach from this session as a template:

1. **Derived state stored as source** — any boolean/field that's recomputable from other state? (Like `softBorders` in the example store.)
2. **Parameters that should be structural** — does the same parameter recur across many action signatures? (Like `mode` in the example store.)
3. **Implicit invariants at risk** — choices made without a recorded `why`. (Like `setPreset` clearing some fields but not others.)
4. **Boundary leaks** — components reaching into store internals. Should be gated by a hooks file.
5. **Silent persistence/migration bugs** — `partialize` whitelists, `as`-cast `migrate` functions, `undefined` vs deleted keys.

Goal of the session: rewrite **one** foundation file cleanly, with `// why:` comments at each non-obvious choice. That file becomes the reference shape for everything else. Subsequent files inherit by pattern matching, which is the actual durable intervention.

Don't try to fix everything at once. Lift the floor one file at a time.
