> **State:** Transient. Delete when the agent-doc restructure lands — this is tracked work, not durable knowledge. (It is itself a comment-2×2 bottom-right artifact: a roadmap that gets consumed.)

# Refactor disposal memo — agent-doc restructure

Carryover for the post-compact sweep. Goal: finish the multi-context agent-doc layout so an in-layer agent loads only its layer, the push (always-on) cost stays **constant as the repo grows**, and every code↔doc link is keyed on something that doesn't rot.

Branch: `docs/agent-optimization`. Last commit before this memo: `b1b85d2` (per-layer split — ADRs/shards moved as 100% renames). Repo `memory/` was **deliberately deleted** on this branch; user holds a copy and is graduating load-bearing memos into `docs/`. A dangling `memory/...md` pointer is expected, not a bug.

---

## 0. Why this shape (don't re-litigate)

The split in `b1b85d2` is good but **half-done**: core `CLAUDE.md` still carries the 10-row surface→shard **dispatch table**, which is the one push-file thing that grows per feature. Same objection that killed nested `CLAUDE.md`: push cost must not scale with the folder tree.

Fix = evict the table to pull (`agents/rules/index.md`). Net trade:

| | push file | grows w/ features? | glossary-only session pays |
| --- | --- | --- | --- |
| current (`b1b85d2`) | 22 lines incl. table | **yes** (1 row/surface) | the whole table |
| target | ~6–8 lines, 2 pointers | **no — flat forever** | nothing |

Cost: one extra hop (read `rules/index.md`) for rule-edit tasks. Tiny pull file, on-demand. Worth it.

---

## 1. Target architecture (END STATE)

Per layer: `CLAUDE.md` = overview + 2 pointers · `glossary.md` = vocab · `docs/agents/rules/` = sharded rules + index · `docs/agents/api/` = reference · `docs/adr/` = the why.

```
packages/core/
├── CLAUDE.md          PUSH ~6–8 lines: 1-sentence overview + → glossary.md + → docs/agents/rules/index.md
│                                       + "ADRs in ./docs/adr/, cite by number"
├── glossary.md        PULL  (was CONTEXT.md) + State header. Domain vocabulary.
└── docs/
    ├── adr/           PULL  22 ADRs. NUMBER = immutable join key (see §4).
    └── agents/
        ├── rules/
        │   ├── index.md       the dispatch table (evicted from CLAUDE.md) + "ADR-NNNN → ../../adr/"
        │   └── {architecture,source,hydration,layer,variants,surface,
        │         exporters,overrides,chart,contrast}.md   ← 10 shards moved here
        └── api/
            └── core-surface.md   public API by subpath (no longer flat among rules)
/  (root)
├── CLAUDE.md          PUSH overview + glossary map (folds CONTEXT-MAP.md) + agent-skill pointers
├── docs/adr/          system-wide only: 0011, 0012, _archive/
└── docs/agents/       cross-cutting guides (session-flow, working-style, domain, decision-flow,
                       memory-lifecycle, tdd, slice-strategy, issue-tracker, triage-labels)
apps/www/              mirror of core (overview+pointers CLAUDE.md, glossary.md, docs/adr/);
                       rules still inline in apps/www/CLAUDE.md — shard in www-phase, not now.
CONTEXT-MAP.md         DELETED (folded into root CLAUDE.md)
```

---

## 2. Findings ledger (from the live test)

The test **passed navigation** — agent reached the right shard, cited right ADRs, stayed in-layer. 4 of 5 findings are code/doc *drift it correctly discovered*, only #1 is a layout regression we made.

| # | Finding | Verdict | File:line | Fix |
| --- | --- | --- | --- | --- |
| **1** | Root says "`docs/adr/` at repo root" but engine ADRs are nested → agent needed `find` | **ours, doc fix** | root `CLAUDE.md:12` (also typo "Muti"); `packages/core/CLAUDE.md:7` ("open the ADR" w/ no path) | State ADRs are per-layer (root=system-wide, `packages/core/docs/adr/`=engine, `apps/www/docs/adr/`=app). Add layer path to core router + `rules/index.md`. |
| **2** | `v10`/`v8` in comments vs `SCHEMA_VERSION = 3` | **code debt, OUT OF SCOPE** | `schema.ts:512` ("to v10"), `derive.ts:278` ("v8") — the `v2`/`v3` changelog at `schema.ts:30-40` is **correct** | Separate code issue. Not this sweep. |
| **3** | `surface.md` lists `'none'\|'tint'\|'desaturate'` — code has no `'none'`; "one branch" understates a fall-through dispatch | **doc fix** | `surface.md:9` (none); `surface.md:12` (one branch). Truth: `schema.ts:301` `SURFACE_ALGOS=['tint','desaturate']`; `schema.ts:296` "no 'none' algo: identity is desaturate at level 0"; `derive.ts:511-519` `applyTreatment` = `if tint … else desaturate` | Drop `'none'`. Rewrite "one branch": a 3rd algo needs `applyTreatment` restructured to explicit switch **+ a level-0 identity short-circuit** to keep the drift-guard baseline green. |
| **4** | Migration policy points to deleted `memory/feedback_prelaunch_breaking_changes.md` | **graduate** | `schema.ts:36`, `source.ts:407`, `packages/core/docs/adr/0028…:30` all cite the dead file | Graduate policy → `rules/source.md` rule, **anchor ADR-0009**. Content recoverable from `schema.ts:30-40`; user has authoritative copy. Then repoint the 3 comments → ADR-0009 / the rule. |
| **5** | `'none'` dup + per-algo token coverage | working as intended | `surface.md:13` already says "declare your subset" | none |

**Migration policy text to graduate** (from `schema.ts:30-40`): pre-launch ⇒ **no forward migration**; persisted older records fail schema parse → reset to `DEFAULT_INPUTS` on rehydrate (ADR-0009 c.4). Future bumps follow ADR-0009: increment `SCHEMA_VERSION` **and** add a forward-migration branch in `source.ts:migrate` *when there are live users to preserve*. (The "pre-launch" qualifier is the external-clock condition a later ADR supersedes — see §4.)

---

## 3. CONTEXT.md → glossary.md — the atomic rename (full cross-site list)

`glossary.md` is the better name (collides less with `CONTEXT-MAP.md` / the generic word). Rename applies to **both** layer files: `packages/core/CONTEXT.md` and `apps/www/CONTEXT.md`. Safe **iff atomic** — the name is a key held by ~17 sites incl. **2 enforcement literals**. Miss those two and the rename *looks* done but the new glossary is silently unprotected (same class as the deleted `memory/` pointers).

Verified: `glossary.md` does **NOT** match the current hook glob `CONTEXT.md|*/CONTEXT.md` (→ no header reminder), and the sentinel prompt names `CONTEXT.md` literally (→ no stripped-header protection). These two are critical.

| Site | Current | Action |
| --- | --- | --- |
| `.claude/hooks/edit-boundary.sh:32` | glob `…\|CONTEXT.md\|*/CONTEXT.md)` | **CRITICAL** → `glossary.md\|*/glossary.md` (prefer location-based; see §6) |
| `.claude/settings.json:30` (drift sentinel prompt) | literal `CONTEXT.md` in rule #2 | **CRITICAL** → `glossary.md` |
| `CONTEXT-MAP.md` (whole file, 4 lines) | maps engine/app → `CONTEXT.md` | **DELETE** — fold into root `CLAUDE.md` (§5) |
| root `CLAUDE.md:1` | "Check `./CONTEXT-MAP.md`…" | rewrite to inline glossary pointers |
| `packages/core/CLAUDE.md:5` | "Domain vocabulary lives in `./CONTEXT.md`" | → `./glossary.md` (part of CLAUDE.md rewrite, §1) |
| `packages/core/CLAUDE.md:22` | "Definitions go in `CONTEXT.md`" | moves to `rules/index.md` authoring note → `glossary.md` |
| `packages/core/docs/agents/architecture.md:5` | "Terms → `../../CONTEXT.md`" | → `../../../glossary.md` (depth +1 after move into `rules/`) |
| **all 10 shards** "Terms →" lines | `../../CONTEXT.md` | → `../../../glossary.md` after move into `rules/` |
| `docs/agents/session-flow.md:25,40,53` | `CONTEXT.md` | → `glossary.md` |
| `docs/agents/decision-flow.md:36,37` | `CONTEXT.md` | → `glossary.md` |
| `docs/agents/memory-lifecycle.md:49` | `CONTEXT.md` | → `glossary.md` |
| `docs/agents/domain.md:7,16,20,24,30` | `CONTEXT-MAP.md` + `CONTEXT.md` (incl. tree) | rewrite: drop CONTEXT-MAP, `CONTEXT.md`→`glossary.md`, redraw tree with `rules/`+`api/` |
| `docs/agents/working-style.md:47` | `CONTEXT.md` | → `glossary.md` |
| `docs/release/open-source-checklist.md:26` | `CONTEXT.md` | → `glossary.md` |
| `apps/www/docs/adr/0019…:30` | body mentions `CONTEXT.md` | → `glossary.md` (body cleanup, allowed; not a Decision change) |
| `packages/core/src/theme/preset-apply.ts:44` | `// why: … (CONTEXT: Lock)` | **decide:** keep `CONTEXT:` prefix or → `GLOSSARY:`? (3 sites total) |
| `…/preset-apply.test.ts:69, :145` | `(CONTEXT: Lock)` | same decision as above |
| `CHANGELOG.md:164` | "normalize CONTEXT.md header" | **LEAVE** — historical record; renaming falsifies history |

Plus the file renames themselves: `packages/core/CONTEXT.md → packages/core/glossary.md`, `apps/www/CONTEXT.md → apps/www/glossary.md`. **On rename, ADD the `> **State:** Living.` header** — core `CONTEXT.md` never had one (long-standing gap); verify www too.

---

## 4. Principles to encode (the durable lessons)

- **ADR number = immutable join key.** Code cites ADRs by number (`ADR-0018`, `ADR-0009 c.4`), never by path/title. Path, title, directory are mutable metadata; the number is the contract. **Never renumber an ADR** — moving files is free (proved by `b1b85d2`'s 100% renames), renumbering is silently catastrophic. → one line in `docs/agents/domain.md`.
- **Comments: cite, don't reason.** Durable payload of a comment is the ADR *number* it points at; prose around it = minimum to decide whether to open the ADR. The 2×2:

  | | rots on **code-clock** (false only if this code changes) | rots on **external clock** (launch, policy, dep, roadmap) |
  | --- | --- | --- |
  | **load-bearing** | ✅ keep as terse `// why:` | ➡️ **ADR owns it; comment = number citation** (e.g. the migration policy) |
  | **not load-bearing** | ❌ delete (code says it) | ❌ delete (the "for now" note) |

  Drift sentinel already covers history/roadmap/tutorial shapes; the genuinely new framing is **external-clock load-bearing ⇒ ADR, not inline prose** (the migration-policy lesson) and **apply the 2×2 to app UI files too**. → optional one line in `working-style.md`.

---

## 5. Other structural cleanups

- **Concise overview** in each `CLAUDE.md`: **1–2 sentences max** (e.g. "tonex: seed hex → themed UI; `@tonex/core` engine + `apps/www` studio"). Root currently has none, so one line is a net add — but it's push, so cap it.
- **`CONTEXT-MAP.md` → fold + delete.** Its only job (where are the glossaries) collapses into root `CLAUDE.md`'s glossary pointer. One fewer name-key.
- **`apps/www/CLAUDE.md`**: read current, then rewrite to overview + pointers. Keep www rules inline for now (shard in a later www-phase).
- **Open question (www-phase):** `apps/www/src/features/md-rail/CLAUDE.md` is a nested push file ("governs both rails", per `session-flow.md:9`). Anti-nesting principle says collapse it into www rules; co-location may be intentional. Decide during www-phase, not core.

---

## 6. Hook hardening (do with the rename)

Both enforcement literals name `CONTEXT.md` by string, so any future rename silently de-protects. Harden to match by **location**, not name:

- `edit-boundary.sh:32` — make the glossary arm catch the file by where it sits (e.g. `*/glossary.md|glossary.md`, or a per-layer-root pattern), so a later rename can't drop the header reminder.
- `settings.json:30` sentinel rule #2 — change `CONTEXT.md` → `glossary.md`; consider phrasing as "the layer glossary (`glossary.md`)" so it's name-agnostic.
- Confirmed OK: `*/docs/agents/*.md` **already matches nested** `rules/…` and `api/…` (bash `case` `*` spans `/`), so sharding into subdirs keeps the boundary reminder. No change needed there. (Sentinel prose says "`docs/agents/*.md`" — reads fine for an LLM, but tighten to "any file under `docs/agents/`" while editing.)

---

## 7. Execution order (the sweep)

**Status (2026-05-30):** Phase 0 ✅ done (working tree, not yet committed) — migration policy graduated to `source.md`, ADR-join-key in `domain.md`, comment-2×2 in `working-style.md`, surface.md #3 fixed, root + core `CLAUDE.md` #1 fixed, ADR-0018 `'none'` recorded as an amendment (Decision + rationale #4 restored to match HEAD, reconciling amendment appended). Phases 1–4 (moves, `CONTEXT.md`→`glossary.md` rename, cross-site refs, hook hardening) = **the sweep**, held until called as the final step. Pre-existing in-flight edit still in tree: `packages/core/CONTEXT.md` "Preset"→"Theme Preset" glossary heading (not mine — verify intent before commit).

Sequenced so nothing dangles mid-way. Group commits as marked.

**Phase 0 — graduate + fix in place (no moves)**
1. Add migration-policy rule → (future) `rules/source.md`, anchor ADR-0009. [user copy or `schema.ts:30-40`]
2. Add ADR-number-join-key line → `domain.md`. (optional: comment-2×2 line → `working-style.md`)
3. Fix #3 in `surface.md`: drop `'none'` (L9); rewrite "one branch" → fall-through + level-0 short-circuit (L12).
4. Fix #1: root `CLAUDE.md:12` (per-layer ADRs + "Muti"→"Multi"); core `CLAUDE.md:7` (ADR path).

**Phase 1 — restructure core (atomic commit)**
5. Move 10 shards → `packages/core/docs/agents/rules/`.
6. Create `rules/index.md` = dispatch table (from `CLAUDE.md` L9–20) + authoring note + "ADR-NNNN → ../../adr/".
7. Move `core-surface.md` → `packages/core/docs/agents/api/`.
8. Rename `packages/core/CONTEXT.md` → `glossary.md`; **add State header**.
9. Rewrite `packages/core/CLAUDE.md` → overview + → glossary.md + → rules/index.md + ADR-location line.
10. Fix internal links: every shard `../../CONTEXT.md` → `../../../glossary.md`; `rules/index.md` rows `docs/agents/x.md` → `x.md` (sibling).

**Phase 2 — www mirror**
11. Rename `apps/www/CONTEXT.md` → `glossary.md` (+ header); rewrite `apps/www/CLAUDE.md` → overview + pointers.

**Phase 3 — cross-site refs + fold (one commit)**
12. Apply every doc row in §3 (`CONTEXT.md` → `glossary.md`).
13. Delete `CONTEXT-MAP.md`; fold into root `CLAUDE.md`; redraw `domain.md` tree (rules/ + api/).
14. Repoint #4 code comments (`schema.ts:36`, `source.ts:407`, `0028…:30`) → ADR-0009 / `rules/source.md`.
15. Decide `CONTEXT:` → `GLOSSARY:` comment prefix (3 sites) and apply or leave consistently.

**Phase 4 — harden + verify**
16. `edit-boundary.sh:32` glob → location-based glossary match (§6).
17. `settings.json:30` sentinel → `glossary.md` (§6).
18. Verify (greps below).

**Out of scope:** #2 (`v10`/`v8` stale comments) → file a separate code issue.

---

## 8. Verification (run after the sweep)

- `grep -rn "CONTEXT\.md\|CONTEXT-MAP" --include="*.md" .` → **only** `CHANGELOG.md:164` may remain.
- `grep -rn "CONTEXT\.md\|CONTEXT-MAP" .claude/` → **empty** (both hooks repointed).
- `grep -rn "memory/feedback" .` → **empty** (or only an intentional "graduated from" note).
- Glob test: `glossary.md` and `packages/core/glossary.md` both **MATCH** `edit-boundary.sh` arm.
- Link resolver: every `(…/glossary.md)` and `(rules/*.md)` target in the new `CLAUDE.md`/`rules/index.md`/shards exists on disk.
- `grep -rn "'none'" packages/core/docs/agents/` → no surface-algo `'none'` left in docs.
- `node scripts/check-conventions.mjs` clean; commit so lint-staged + sentinel run.
