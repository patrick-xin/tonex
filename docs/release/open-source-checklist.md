# Open-source release checklist

Run before flipping the repo public OR before publishing any package to npm. The cost of an extra audit pass is small; the cost of leaking a personal identifier or a strategic positioning note is high.

## Pre-publish audit (~30 minutes)

### Personal data

- [ ] `git log --all --grep="alpesdream\|patrickxin"` — any commits mentioning the user's email or handle?
- [ ] `grep -rI "alpesdream\|patrickxin" . --include="*.md" --include="*.ts" --include="*.tsx" --include="*.json" --exclude-dir=node_modules` — any tracked files mentioning personal identifiers?
- [ ] `grep -rI "/Users/patrickxin" . --exclude-dir=node_modules` — no absolute paths leaked into tracked files.
- [ ] `.env*`, `.vscode/`, `.scratch/`, `notes/`, `NOTES.md`, `docs/private/` all confirmed in `.gitignore`.

### Strategic content

- [ ] No competitor names in tracked docs. `docs/vision.md` is the public-safe version; `docs/private/vision.md` carries the strategic-rich version (gitignored).
- [ ] No sibling-product names (Lumi, etc.) in tracked content.
- [ ] No upstream/downstream pipeline names that aren't yet public (e.g. spec-source product names).
- [ ] `docs/private/` directory present locally but not tracked: `git ls-files docs/private/` returns empty.
- [ ] All ADR bodies reviewed for verbatim quotes from private grilling sessions.

### Voice

- [ ] `glossary.md` and `docs/agents/*` reviewed — second-person ("you", "the user") replaced with third-person ("contributors", "agents") where the doc will be read by external readers.
- [ ] No "user told me…" style notes in tracked files.

### Repo hygiene

- [x] `README.md` exists and is public-facing.
- [x] `CONTRIBUTING.md` exists with: dev setup, how to run tests, lifecycle policy reference, ADR/issue conventions.
- [x] `SECURITY.md` exists with reporting instructions (image upload + clipboard handling are the surfaces to call out). Uses GitHub's private vulnerability reporting — no email address tracked.
- [x] `LICENSE` file present (MIT).
- [ ] `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md` exist.
- [ ] CI badge in README; CI green on `master`.

### Memory and machine-local state

- [ ] Sweep run (the `sweep` skill; policy in `docs/agents/memory-lifecycle.md`) — strategically sensitive content moved to `docs/private/`, graduated content absorbed into ADRs / `docs/agents/` / CHANGELOG.
- [ ] `~/.claude/projects/<repo>/memory/` reviewed for accidental commits (memory should never have been tracked, but verify).

### Open issues / labels

- [ ] All open GH issues reviewed for verbatim grilling quotes or competitor names. Re-body where needed.
- [ ] Triage labels exist (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`) per `docs/agents/triage-labels.md`.

## When publishing a single package to npm

If only `@tonex/core` is going to npm (not the whole repo):

- [ ] `package.json` — `private: false`, version, description, repo URL, license, author set.
- [ ] Subpath exports (`/schema`, `/oklch`, `/data`, `/variants`) declared in the `exports` field per ADR-0016.
- [ ] `files` field whitelists what publishes — no test files, no fixtures, no internal-only files.
- [ ] `@tonex/mcu` migration story decided per ADR-0012: bundle, vendor as dep, or replace with npm-mcu.
- [ ] `npm pack --dry-run` reviewed — confirm the payload contents match expectations.

## After publishing

- [ ] CHANGELOG.md — bump from `[Unreleased]` to a versioned heading.
- [ ] Tag the release: `git tag v0.1.0 && git push --tags`.
- [ ] If npm: announce in CHANGELOG and link from README.

## Why this checklist exists

Memory files and grilling sessions accumulate language — competitor names, sibling-product framings, verbatim user quotes, "we evaluated X and rejected Y" — that's safe in a personal scratchpad and damaging in a public repo. Most leaks are mechanical to find but easy to miss without a list. This is the list.
