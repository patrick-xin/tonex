#!/bin/bash
# SessionStart hook — prints repo state for the agent's opening context.
# Stdout is added to Claude's context (no JSON wrapper required).

set -e
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

echo "## Session context"
echo ""
echo "**Branch:** $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
echo ""
echo "**Recent commits:**"
git log --oneline -10 2>/dev/null || true
echo ""

status=$(git status --porcelain 2>/dev/null || true)
if [ -n "$status" ]; then
  echo "**Uncommitted changes:**"
  echo "$status"
else
  echo "**Working tree:** clean"
fi
echo ""
echo "Reading order for non-trivial work: \`docs/agents/session-flow.md\`."
exit 0