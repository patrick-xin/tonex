# Working style for tonex agents

- **Model new files on the most-read ones.** The store, the schema, the top utility are the de-facto templates — new files inherit by pattern continuation, so a wrong foundation propagates. Fix a bad pattern at its source, not at the leaf. Correct by pointing at the canonical file ("model this on X"), not by citing a rule.

- **`// why:` only at non-obvious choices.** Record the constraint or invariant that drove the choice, or the ADR number when an architectural rule applies here. Never restate what the code already says. An external-clock reason (launch, dependency bump, policy) goes in an ADR and the comment cites the number; a bare `// for now` is either load-bearing (→ ADR) or disposable (→ delete). Applies to app UI files, not just the engine.

- **`AGENTS.md` is the static minimum.** Put a constraint there only if it has no in-code home (e.g. "no backend ever"); anything with a code site lives at that site. Keep each `AGENTS.md` under ~15 lines. (`CLAUDE.md` is just `@AGENTS.md` — a re-export shim, not a place for rules.)

- **Corrections commit to code.** A correction survives only as a refactor, `// why:`, fixture, ADR, or an entry in this doc — one left in conversation evaporates at the session boundary.

- **Name domain concepts with the glossary's term.** In any output that names a concept — issue title, refactor proposal, hypothesis, test name — use the per-layer glossary's term (`packages/core/docs/glossary.md`, `apps/www/docs/glossary.md`); don't drift to synonyms it avoids. A concept missing from the glossary is a signal: either you're inventing language the project doesn't use (reconsider), or it's a real gap (note it).

- **Capture a changed decision as an issue, not an in-place doc edit.** When a decision refines or contradicts a rule a *living* doc already states, file an issue via `/to-issues` first — it's the dated record of what changed and why; the doc edit follows. A net-new rule with no prior conflict is written straight to its home (a `rules/` shard, a feature `AGENTS.md`, or here); a decision big enough for an ADR is written as an ADR directly (an append-amendment if it refines one) — ADRs have no in-place-overwrite failure mode. When unsure, file the issue.

- **Surface skill moments; don't auto-run them.** `/to-prd`, `/to-issues`, `/triage`, and the `sweep` skill are user-invoked. When a moment calls for one, offer it ("this looks like a `/to-issues` moment — want me to draft the body?"). PRDs publish to the tracker as issues (problem / solution / user-stories / implementation-decisions), not as `docs/prd/` files.

- **ADRs carry rationale, not implementation.** When writing or amending an ADR, strip file paths, signatures, schema versions, test references, and forward slice-plans — code is the truth-source and the ADR rots against it. Keep a code block only when it names the exact contract surface the decision changes (a relaxed tsconfig flag, an added union case). Folder and feature names are convention (→ `structure.md` / the glossary), not ADR content: keep the principle, drop the roster.

- **Worktrees: one per PR, sibling dir, launched from inside.**
  - Cut fresh from `origin/master`: `git worktree add -b feat/<slug> ../tonex-<slug> origin/master`.
  - Location is a *sibling* of the main repo (`/Users/patrickxin/dev/tonex-<slug>`), never nested inside it — a worktree under the main-repo path is a descendant of a `master` checkout, so any launcher or relative path that resolves to the repo root silently lands on `master`. Siblings share no ancestor. (`.claude/worktrees/` is gitignored and was a false start — don't nest there.)
  - Launch the agent from inside the worktree (`cd ../tonex-<slug> && claude`) so its cwd *is* the worktree; otherwise Bash defaults to the launch dir and edits/tests split-brain onto `master`. If cwd is ever the main repo mid-session, target the worktree with absolute paths until you relaunch.
  - `git worktree remove` after the PR merges.

- **Subagents start cold.** They can't see machine-local memory or session history — anything load-bearing must live in repo files. Point them at specific paths (code with `// why:`, ADRs, `glossary.md`, this doc), don't restate rules in the prompt; repo paths are durable, prompt content evaporates with the subagent.

- **Planner writes the contract; implementer makes it pass.** The planner produces only durable artifacts — ADR (the why), PRD (the what), sliced issues, and the failing test that pins each slice's contract; the implementer takes those plus the code and makes the test green. See `slice-strategy.md`, `tdd.md`.

- **Enforcement & before-done.** husky/lint-staged runs Biome + `check-conventions.mjs` on staged `.ts/.tsx` — the culori firewall (ADR-0025), the `next-themes` allowlist (ADR-0015), inline Mode-union literals (ADR-0016) — plus `check-adr-citations.mjs` on staged `.ts/.tsx/.md`, which fails any `ADR-N c.M` / `amendment <date>` citation that no longer resolves to a live anchor (ADR-0034 c.8); CI runs it whole-tree. A Stop drift sentinel flags ADR-decision rewrites, sink-side color logic, and narrative comments. Touched files must pass — run `pnpm biome check <files>`, `pnpm check:conventions`, and `pnpm check:adr` before reporting done. If you fold or reshape an ADR, the `adr` skill owns the procedure and `pnpm check:adr` is the proof you didn't orphan a citation.
