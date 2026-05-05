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

## `CLAUDE.md` is the static minimum

Constraints with no in-code home (e.g. "no backend ever") belong in `CLAUDE.md`. Anything that *does* have an in-code home belongs at that code site, not in `CLAUDE.md`. Keep `CLAUDE.md` under ~15 lines.

## Corrections must commit to the code

Within a session, explicit corrections work — "restructure that, don't add another mode parameter" is followed. The problem: corrections evaporate at session boundary. **The durable form of a correction is a code change** (refactor, `// why:`, fixture, ADR, working-style entry). A rule that lives only in conversation will not survive.

## Curator, not enforcer

The most effective correction is "model your code on file X," not "you violated rule 3." Concrete examples beat abstract rules every time, because the example is read at generation time and the rule is not.

## Subagents start cold

Subagents spawned by a main agent cannot see machine-local memory or session history. Anything load-bearing for a subagent must live in repo files: code with `// why:` comments, ADRs, `CONTEXT.md`, this doc, or be embedded in the subagent's prompt.

When orchestrating, prefer pointing subagents at specific repo paths over restating rules in their prompt. Repo paths are durable; prompt content evaporates with the subagent.
