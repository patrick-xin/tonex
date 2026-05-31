# Issue tracker: GitHub

Issues and PRDs live as GitHub Issues at [`patrick-xin/tonex`](https://github.com/patrick-xin/tonex/issues). The `/to-issues`, `/to-prd`, and `/triage` skills read from and write to it.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."` — valid strings live in [`triage-labels.md`](./triage-labels.md).
- **Close**: `gh issue close <number> --comment "..."`

`gh` infers the repo from `git remote -v` automatically when run inside this clone.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

_Avoid_: backlog manager. Use "ticket" only when quoting external systems that call them tickets.