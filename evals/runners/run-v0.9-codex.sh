#!/bin/bash
# One Codex live run for the v0.9 battery. Preserve stdout/stderr even on failure.
set -u
DEST="${1:?dest worktree}"
MODEL="${CODEX_MODEL:-gpt-5.5}"
if [ ! -f "$DEST/TASK.md" ] || [ ! -f "$DEST/OPERATOR.md" ]; then
  echo "missing TASK.md or OPERATOR.md in $DEST" >&2
  exit 2
fi
PROMPT="Read OPERATOR.md and TASK.md in the current directory. Follow OPERATOR.md. Complete TASK.md."
date -u +%Y-%m-%dT%H:%M:%SZ > "$DEST/STARTED_AT"
set +e
codex exec \
  --ignore-user-config \
  --skip-git-repo-check \
  --sandbox workspace-write \
  --ignore-rules \
  --color never \
  --json \
  -m "$MODEL" \
  --cd "$DEST" \
  --output-last-message "$DEST/CODEX_LAST_MESSAGE.md" \
  "$PROMPT" \
  > "$DEST/TRANSCRIPT.jsonl" \
  2> "$DEST/TRANSCRIPT.err"
status=$?
set -e
echo "$status" > "$DEST/CODEX_EXIT"
date -u +%Y-%m-%dT%H:%M:%SZ > "$DEST/ENDED_AT"
if [ ! -f "$DEST/ANSWER.md" ] && [ -f "$DEST/CODEX_LAST_MESSAGE.md" ]; then
  cp "$DEST/CODEX_LAST_MESSAGE.md" "$DEST/ANSWER.md"
fi
exit "$status"
