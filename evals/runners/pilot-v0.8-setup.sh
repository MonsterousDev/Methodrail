#!/bin/bash
# Operator setup for the declared v0.8 C7 live battery.
# Does not modify fixture task.md, fixture repos, or graders.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PILOT="${METHODRAIL_PILOT_DIR:-/tmp/methodrail-pilot-20260831-v08}"
case "$(basename "$PILOT")" in
  methodrail-pilot-*) ;;
  *) echo "Refusing to replace a pilot directory without a methodrail-pilot-* basename" >&2; exit 2 ;;
esac
rm -rf "$PILOT"
mkdir -p "$PILOT"

copy_tree() {
  local fixture="$1"
  local dest="$2"
  mkdir -p "$dest"
  cp -R "$ROOT/evals/fixtures/$fixture/repo" "$dest/repo"
  cp "$ROOT/evals/fixtures/$fixture/task.md" "$dest/TASK.md"
  if [ -d "$ROOT/evals/fixtures/$fixture/.methodrail" ]; then
    cp -R "$ROOT/evals/fixtures/$fixture/.methodrail" "$dest/.methodrail"
  fi
}

add_methodrail_guidance() {
  local dest="$1"
  mkdir -p "$dest/rules" "$dest/references/knowledge"
  cp "$ROOT/rules/methodrail.mdc" "$dest/rules/methodrail.mdc"
  cp "$ROOT/references/knowledge/reuse.md" "$dest/references/knowledge/reuse.md"
  cp "$ROOT/references/knowledge/freshness.md" "$dest/references/knowledge/freshness.md"
  cp "$ROOT/references/knowledge/note-contract.md" "$dest/references/knowledge/note-contract.md"
}

write_operator() {
  local dest="$1"
  local condition="$2"
  if [ "$condition" = "methodrail" ]; then
    cat > "$dest/OPERATOR.md" <<'EOF'
Complete the task in TASK.md.

This directory includes Methodrail methodology:
- rules/methodrail.mdc
- references/knowledge/

Read rules/methodrail.mdc. If .methodrail/PROJECT.md exists, read it before substantive work and follow only the knowledge pointers that bear on this task. Use references/knowledge/reuse.md for how to treat project notes.

Stay inside this directory. Do not read parent directories, other worktrees, or any Methodrail plugin, evals, grader, expected.yaml, or README files outside this tree.

Write your final user-facing answer to ANSWER.md.
Write every shell command you ran to COMMANDS.json as a JSON array of objects: {"command":"...","exit_status":N}.

Do not modify TASK.md, RUN.json, or OPERATOR.md.
EOF
  else
    cat > "$dest/OPERATOR.md" <<'EOF'
Complete the task in TASK.md.

You are a baseline coding agent. Do not load or follow Methodrail skills, rules, or knowledge-reuse procedures even if they appear in your environment. Use only this worktree.

Stay inside this directory. Do not read parent directories, other worktrees, or any Methodrail plugin, evals, grader, expected.yaml, or README files outside this tree.

Write your final user-facing answer to ANSWER.md.
Write every shell command you ran to COMMANDS.json as a JSON array of objects: {"command":"...","exit_status":N}.

Do not modify TASK.md, RUN.json, or OPERATOR.md.
EOF
  fi
}

stamp() {
  local dest="$1"
  local fixture="$2"
  local host="$3"
  local repeat="$4"
  local condition="$5"
  cat > "$dest/RUN.json" <<EOF
{
  "fixture_id": "$fixture",
  "host": "$host",
  "repeat": $repeat,
  "condition": "$condition",
  "started_dir": "$dest"
}
EOF
}

setup_run() {
  local fixture="$1" host="$2" repeat="$3" condition="$4"
  local dest="$PILOT/$fixture/${host}-r${repeat}-${condition}"
  copy_tree "$fixture" "$dest"
  if [ "$condition" = "methodrail" ]; then
    add_methodrail_guidance "$dest"
  fi
  write_operator "$dest" "$condition"
  stamp "$dest" "$fixture" "$host" "$repeat" "$condition"
  cp -R "$dest" "${dest}.clean"
  echo "$dest"
}

for fixture in knowledge-applicability knowledge-dispute knowledge-retired; do
  for host_repeat in "cursor 1" "cursor 2" "codex 1"; do
    set -- $host_repeat
    host="$1"
    repeat="$2"
    setup_run "$fixture" "$host" "$repeat" baseline >/dev/null
    setup_run "$fixture" "$host" "$repeat" methodrail >/dev/null
  done
done

echo "Prepared $PILOT"
find "$PILOT" -name RUN.json | wc -l
echo "$PILOT" > "$PILOT/PILOT_ROOT"
git -C "$ROOT" rev-parse HEAD > "$PILOT/METHODRAIL_HEAD"
date -u +%Y-%m-%dT%H:%M:%SZ > "$PILOT/PREPARED_AT"
