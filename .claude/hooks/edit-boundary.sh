#!/bin/bash
# PostToolUse hook on Edit|Write — surfaces structural-drift reminders for
# files governed by frozen ADRs or sink-layer rules. Advisory (not blocking):
# emits additionalContext that Claude sees alongside the tool result.

set -e

input=$(cat)

# jq is the cleanest path; fall back to a sed-based pull if it's missing.
if command -v jq >/dev/null 2>&1; then
  file_path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
else
  file_path=$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
fi

[ -z "$file_path" ] && exit 0

emit() {
  local msg="$1"
  printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":%s}}\n' \
    "$(printf '%s' "$msg" | jq -Rs . 2>/dev/null || printf '"%s"' "$msg")"
}

case "$file_path" in
  */docs/adr/[0-9]*.md)
    emit "ADR boundary reminder: docs/adr/*.md is frozen (lifecycle header). New decisions get new ADRs; existing ADRs get amendment blocks appended at the bottom — never rewrite the body. If this edit changed body prose, undo and convert to an amendment block."
    ;;
  */theme/applyDom.ts|*/exporters/*.ts)
    emit "Sink boundary reminder (ADR-0017): applyDom and exporters/* must only format what deriveTheme returned — no color conversion, rounding, or role mapping. If this edit added such logic, push it into deriveTheme instead."
    ;;
  */docs/agents/*.md|*/CLAUDE.md|*/CONTEXT.md)
    emit "Living-doc reminder: this file declares lifecycle state in a header line at the top (\`> **State:** Living. ...\`). Preserve the header on edits — its absence is the signal that a doc predates the lifecycle policy."
    ;;
esac

exit 0
