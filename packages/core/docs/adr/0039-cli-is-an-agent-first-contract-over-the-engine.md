# The `tonex` CLI is an agent-first, stateless contract over the engine

The CLI's primary caller is an **agent**, not a human at a keyboard. A human speaks to the agent in perceptual language ("the secondary's too bright"); the agent translates that into precise invocations and reads the results back. Every CLI decision follows from that one fact: the surface is built for a machine in a loop — discoverable, deterministic, composable — not for human ergonomics.

This ADR records the load-bearing posture **every** CLI feature inherits. Specific commands, flags, and their wiring are spec — they live in code and `packages/cli/CLAUDE.md` (ADR-0034 c.6) and are deliberately absent here, as are open questions.

**Decision:**

## 1. Agent-first; the human is upstream of the agent, not of the CLI

The CLI is designed for an agent caller: machine-readable output, a stable contract, no reliance on a TTY, no interactive prompts or REPL. The human's perceptual intent is the *agent's* input, not the CLI's. We do not build human-ergonomic affordances (wizards, session shells, prompts) — they target the wrong consumer and add surface an agent must work around.

*Road not taken:* a human-first CLI. Rejected because the human never types the CLI; the agent does. Optimizing for human hand-use trades away the machine contract the actual caller depends on.

## 2. A thin consumer of `@tonex/core` — zero color logic

All derivation, color encoding, and the WCAG verdict live in core (ADR-0016, ADR-0017, ADR-0025). The CLI projects core's values into invocations and output; it never re-derives, re-encodes, or re-scores. When a capability is missing, it is added to **core first** and then surfaced — never inlined in the CLI.

*Road not taken:* inlining color math in the CLI for convenience or speed. Rejected — it forks the single color-logic site, bypasses the `@tonex/color-utils` firewall, and lets the CLI and the app disagree. The CLI is core's second consumer, the seam ADR-0037 anticipated (issue #178); keeping it thin is what makes that seam real rather than a re-implementation.

## 3. Stateless one-shot — the agent is the memory

Each invocation is a pure function of its inputs: a `run(argv, io) → exitCode` seam, no daemon, no session, no theme document held by the CLI process. Durable state, when wanted, is a **file the agent writes**, not process state.

*Road not taken:* a stateful session / REPL / daemon holding the working theme — the "set X, then set Y" model a designer *feels*. Rejected: the agent already holds that context (seed, variant, prior nudges); a stateful CLI would duplicate and fight the agent's memory. Statelessness makes every call reproducible, composable in a loop, and exercised at a single seam.

## 4. Deterministic primitives + facts; the agent owns open-ended judgment

The engine exposes small, deterministic operations and emits facts. Open-ended judgment — which tokens an intent selects, how perceptual language becomes a number, how canonical values project into a foreign tool's vocabulary — is the **agent's** job. The CLI surface stays small and total; it never grows a knob per phrasing of a request.

*Road not taken:* a CLI that accretes a flag for every request shape ("only chips darker, keep text," "containers not buttons"). Rejected as a combinatorial infinity — unbounded and still incomplete. The infinity belongs in the agent, the component capable of it; the engine stays finite.

## 5. The interface is facts + a typed exit code — no loop machinery in the CLI

The CLI returns machine-readable facts and a small **fixed** exit taxonomy whose categories demand *opposite* agent responses: success; a policy failure the agent fixes by changing the **artifact** (apply a color remedy); and a usage error the agent fixes by changing the **call** (correct the inputs). These categories are an API the agent's control flow branches on — they never collapse. The CLI does **not** orchestrate its own remediation loop.

*Road not taken:* a CLI that runs the generate→audit→remediate→re-check loop itself (auto-fixing, retrying, holding a workflow state machine). Rejected — the loop has the human and the judgment in it, so it is the agent's; a loop inside the tool duplicates and fights the agent's control flow. The CLI's job is to make each step a clean fact and a clean signal.

## 6. The contract is self-describing; cross-tool projection lives in the skill, not the CLI

The CLI describes its own contract in machine-readable form, so an agent learns it without an external doc. Projecting core's canonical colors into the open set of foreign tools lives in a distributed **skill** (plus per-tool references) — agent-side, separately versioned — not in CLI flags. The CLI stays a colors-and-facts engine.

*Road not taken:* (a) a CLI that needs an external skill doc to be usable — un-introspectable, contract drifts from prose; (b) a CLI that bakes per-target adapters into the binary — coupling a stable engine to an unbounded, fast-moving set of foreign vocabularies. Self-description keeps the contract honest at generation time; skill-side projection keeps the CLI stable while the agent's foreign-tool knowledge evolves independently: the CLI emits canonical values, the agent + skill project them into each foreign vocabulary.

## 7. The durable artifact is recipe-canonical and value-disposable, and defers to a foreign source of truth

Decision 3 makes durable state a file the agent writes; this fixes what that file *is*. It is **canonical in format, disposable in content**: its header is the **recipe** — the seed plus the few derivation knobs — the irreplaceable input, while its values are a deterministic, re-derivable cache of that recipe, re-encoded by core on demand (Decision 2). So while it exists the file is a real, spec'd artifact other tools consume; the moment the recipe changes it is throwaway and regenerated — a *derived* artifact, never a *source* one. Two scope limits follow. The file is the **color layer only** — it never accretes prose, components, typography, or spacing; those belong to the app or to a format above us. And when the project already carries a foreign **source-of-truth** artifact that holds intent (a DESIGN.md, say), tonex **serves** it — fills its color block — rather than reconciling against it or standing up a competing source; tonex is authoritative for the color *values*, never for the intent above them.

*Road not taken:* a stateful artifact tonex owns and reconciles against a foreign file — pulling hand-edits back into it, holding a binding manifest, arbitrating whose value wins on a regenerate. Rejected: it rebuilds the foreign tool's job inside ours, re-introduces exactly the reverse/reconcile state Decision 3 exists to delete, and makes tonex a second source of truth for intent it doesn't own. A forward-only derived artifact that defers upward keeps the engine a colors-and-facts producer (Decision 6) and keeps every value reproducible from its recipe.

**Why this posture, in one line:** the scarce resource is the agent's generation-time attention and a contract it can trust across a loop; every decision above spends the engine's simplicity to buy the agent a small, deterministic, self-describing surface, and puts every open-ended choice on the side that can actually make it.

**Consequence:**

- This ADR is the parent of every CLI feature: a new command earns its place by exposing a deterministic primitive or a fact, never by encoding a judgment the agent should make. A feature disagreement is resolved here, against the posture, before flags are drawn.
- The exit taxonomy's *stability* is a hard contract: adding a category is a deliberate, breaking change to agent control flow, not a casual addition.
- Structurally the CLI is core's second consumer in the package graph (ADR-0011's split-trigger, realized by ADR-0037); it folds core, imports only public subpaths, and never reaches into core's `src`.
- Human-facing niceties (colored output for human eyes, spinners, interactive prompts) are out of scope by Decision 1 — if a human ergonomic is ever wanted, it is a separate surface, not bolted onto the agent contract.
- The durable artifact (Decision 7) is derived, not source: always reproducible from its recipe, so it is regenerated or discarded freely and never hand-curated into a second source of truth. A foreign intent-bearing file, when present, outranks it; tonex fills that file's color block and does not reconcile back from it.

**Code anchors:** none — a package-wide posture ADR governing every file in `@tonex/cli`; it has no single code home. The contracts it justifies are stated imperatively in packages/cli/CLAUDE.md ("Keep exactly") and embodied at the run(argv, io) seam. Numbered per ADR-0011 §5; never renumber.
