> **State:** Living. Edit when working norms in this codebase change.

# Working style for tonex agents

This codebase is built around an observation: AI agents are dominated by what they read at generation time, not by what they were told earlier. The conventions below are tuned for that constraint.

## Foundation files are templates

Whichever files agents read most often become the de-facto template for new files. The store, the schema, the most-imported utility — every new file pattern-matches against these. **Fix the foundations first; subsequent files inherit by pattern continuation.**

Pattern continuation isn't laziness; consistency is usually correct. The failure mode is when the pattern itself is wrong — then consistency *is* the bug. Invest in foundations before scaling work.

## In-file `// why:` comments are load-bearing

A comment in the file an agent is editing is read at the moment of generation. A rule in `CLAUDE.md` was read 200 lines ago and competes with surrounding code for influence. **Comments at non-obvious choices win over abstract rules.**

Use `// why:` to record:
- the constraint that drove a non-obvious choice
- the invariant a future edit must preserve
- the relevant ADR number when an architectural rule applies here

Do not use `// why:` for what code already says. If removing the comment wouldn't confuse a future reader, don't write it.

**An external-clock comment belongs in an ADR, not inline.** If a note will rot on launch, a dependency bump, or a policy change (e.g. a migration plan), record the reasoning in an ADR and let the comment cite the *number*. A bare `// for now …` is either load-bearing (→ ADR) or disposable (→ delete). This applies to app UI files too, not just the engine.

## `CLAUDE.md` is the static minimum

Constraints with no in-code home (e.g. "no backend ever") belong in `CLAUDE.md`. Anything that *does* have an in-code home belongs at that code site, not in `CLAUDE.md`. Keep `CLAUDE.md` under ~15 lines.

## Corrections must commit to the code

Within a session, explicit corrections work — "restructure that, don't add another mode parameter" is followed. The problem: corrections evaporate at session boundary. **The durable form of a correction is a code change** (refactor, `// why:`, fixture, ADR, working-style entry). A rule that lives only in conversation will not survive.

## Curator, not enforcer

The most effective correction is "model your code on file X," not "you violated rule 3." Concrete examples beat abstract rules every time, because the example is read at generation time and the rule is not.

## Worktrees: one per PR, sibling dirs, launched from inside

One branch per PR, one worktree per branch. Never reuse a worktree across PRs.

- **Cut fresh from `origin/master`:** `git worktree add -b feat/<slug> ../tonex-<slug> origin/master`.
- **Location is a sibling of the main repo** (`/Users/patrickxin/dev/tonex-<slug>`), *not* nested inside it. A worktree that lives under the main-repo path is a descendant of a tree checked out on `master`; any launcher or relative path that resolves to the repo root then silently lands on `master`. Siblings share no ancestor, so no path can cross over. (`.claude/worktrees/` is gitignored and was a false start — don't nest there.)
- **Launch the agent from inside the worktree** (`cd ../tonex-<slug> && claude`) so the agent's cwd *is* the worktree. Otherwise Bash defaults to the launch dir — if that's the main repo, edits/tests split-brain onto `master` while you think you're on the branch. If you ever find cwd is the main repo mid-session, target the worktree with absolute paths until you can relaunch.
- **`git worktree remove` after the PR merges.**

## Subagents start cold

Subagents spawned by a main agent cannot see machine-local memory or session history. Anything load-bearing for a subagent must live in repo files: code with `// why:` comments, ADRs, `CONTEXT.md`, this doc, or be embedded in the subagent's prompt.

When orchestrating, prefer pointing subagents at specific repo paths over restating rules in their prompt. Repo paths are durable; prompt content evaporates with the subagent.

## The planner writes the contract; the implementer makes it pass

Work splits into two roles. A **planner** produces only durable artifacts — ADRs (the why), a PRD on the tracker (the what), sliced issues, and **the failing test that fixes each slice's contract**. An **implementer** takes those plus the codebase, makes the test green, and refactors. The artifacts are the entire interface; the implementer needs nothing from the planner's session.

The Red test is load-bearing for the same reason `// why:` comments are — it's read at generation time and can't be misread. Prose specs get reconstructed and drift in the gaps; a failing test states exactly what passing means. `slice-strategy.md` already names the Red test the contract; this names its author — the planner, because pinning the contract is where planning pays off, and a contract the implementer writes is one no one checked against intent. So a planner producing "docs only" is not a degraded handoff: the contract travels as a test, the why as an ADR, the what as the PRD. Residual friction lives in the gap between those and the implementer's micro-decisions — keep slices small so a bad gap-fill dies in one Red-Green cycle.
