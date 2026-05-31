# Triage labels

The triage skills (`/triage`, `/to-issues`, `/to-prd`) speak in five canonical roles. In this repo the GitHub label strings **are** those role names verbatim — the mapping is identity, so there is nothing to translate.

| Label             | When to apply                                          |
| ----------------- | ------------------------------------------------------ |
| `needs-triage`    | Maintainer still needs to evaluate the issue           |
| `needs-info`      | Blocked on the reporter for more information           |
| `ready-for-agent` | Fully specified — an AFK agent can take it unattended  |
| `ready-for-human` | Needs human implementation judgment                    |
| `wontfix`         | Will not be actioned                                   |

`gh label list` is the source of truth for what exists; this table only carries the *when-to-apply* a command can't tell you. Area labels (`core`, `www`) and status labels (`deferred`) are orthogonal to triage and may co-apply.

When a skill names a role ("apply the AFK-ready label"), use the matching string above.
