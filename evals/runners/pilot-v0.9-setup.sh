#!/bin/bash
# Operator setup for the declared v0.9 live battery.
# Does not modify fixture task.md, fixture repos, or graders.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PILOT="${METHODRAIL_PILOT_DIR:-/tmp/methodrail-pilot-20260901-v09}"
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
  local src="$ROOT/evals/fixtures/$fixture"
  local name
  for name in $(ls -A "$src"); do
    case "$name" in
      expected.yaml|README.md|task.md|task-a.md) continue ;;
    esac
    cp -R "$src/$name" "$dest/$name"
  done
  cp "$src/task.md" "$dest/TASK.md"
}

add_methodrail_guidance() {
  local dest="$1"
  local fixture="$2"
  mkdir -p "$dest/rules" "$dest/references/knowledge" "$dest/references/protocols" "$dest/skills"
  cp "$ROOT/rules/methodrail.mdc" "$dest/rules/methodrail.mdc"
  case "$fixture" in
    decision-ladder)
      cp "$ROOT/references/decision-frontier.md" "$dest/references/decision-frontier.md"
      cp "$ROOT/references/protocols/decision-record.md" "$dest/references/protocols/decision-record.md"
      cp -R "$ROOT/skills/show-me-your-work" "$dest/skills/show-me-your-work"
      ;;
    knowledge-reconciliation-v0.9)
      cp "$ROOT/references/knowledge/reuse.md" "$dest/references/knowledge/reuse.md"
      cp "$ROOT/references/knowledge/freshness.md" "$dest/references/knowledge/freshness.md"
      cp "$ROOT/references/knowledge/note-contract.md" "$dest/references/knowledge/note-contract.md"
      cp "$ROOT/references/knowledge.md" "$dest/references/knowledge.md"
      cp -R "$ROOT/skills/reflect" "$dest/skills/reflect"
      ;;
    architecture-deepening)
      cp -R "$ROOT/skills/improve-codebase-architecture" "$dest/skills/improve-codebase-architecture"
      cp -R "$ROOT/skills/codebase-design" "$dest/skills/codebase-design"
      ;;
  esac
}

write_operator() {
  local dest="$1"
  local condition="$2"
  local fixture="$3"
  if [ "$condition" = "methodrail" ]; then
    local extra=""
    if [ "$fixture" = "decision-ladder" ]; then
      extra="Unattended-operator note: if a procedure requires explicit human approval before writing a durable ADR, this battery operator grants that approval only for a qualifying hard-to-reverse store choice after you classify it. Reversible log-format choices are not approved as ADRs."
    elif [ "$fixture" = "knowledge-reconciliation-v0.9" ]; then
      extra="Unattended-operator note: this operator does not grant approval to rewrite typed knowledge notes."
    fi
    cat > "$dest/OPERATOR.md" <<EOF
Complete the task in TASK.md.

This directory includes Methodrail methodology under rules/, references/, and skills/.
Read rules/methodrail.mdc. If .methodrail/PROJECT.md exists, read it before substantive work and follow only the pointers that bear on this task.

Stay inside this directory. Do not read parent directories, other worktrees, or any Methodrail plugin, evals, grader, expected.yaml, or README files outside this tree.

${extra}

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
    add_methodrail_guidance "$dest" "$fixture"
  fi
  write_operator "$dest" "$condition" "$fixture"
  stamp "$dest" "$fixture" "$host" "$repeat" "$condition"
  cp -R "$dest" "${dest}.clean"
  echo "$dest"
}

for fixture in decision-ladder knowledge-reconciliation-v0.9 architecture-deepening; do
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
printf '%s\n' "uncommitted-v0.9-working-tree" > "$PILOT/METHODRAIL_FREEZE_NOTE"
date -u +%Y-%m-%dT%H:%M:%SZ > "$PILOT/PREPARED_AT"
shasum -a 256 \
  "$ROOT/src/eval/grade-outcome.ts" \
  "$ROOT/evals/release-policy.yaml" \
  "$ROOT/evals/pilot-v0.9-project-artifact-interoperability.yaml" \
  "$ROOT/evals/fixtures/decision-ladder/task.md" \
  "$ROOT/evals/fixtures/knowledge-reconciliation-v0.9/task.md" \
  "$ROOT/evals/fixtures/architecture-deepening/task.md" \
  > "$PILOT/FREEZE.sha256"
