#!/bin/bash
set -euo pipefail
ROOT="/Users/odin/Odin/Odin/Projects/Methodrail"
PILOT="/tmp/methodrail-pilot-20260825"
rm -rf "$PILOT"
mkdir -p "$PILOT"

copy_repo() {
  local fixture="$1"
  local dest="$2"
  mkdir -p "$dest"
  cp -R "$ROOT/evals/fixtures/$fixture/repo" "$dest/repo"
  cp "$ROOT/evals/fixtures/$fixture/task.md" "$dest/TASK.md"
}

copy_methodrail_dot() {
  local fixture="$1"
  local dest="$2"
  if [ -d "$ROOT/evals/fixtures/$fixture/.methodrail" ]; then
    cp -R "$ROOT/evals/fixtures/$fixture/.methodrail" "$dest/.methodrail"
  fi
}

add_methodrail_skills() {
  local dest="$1"
  shift
  mkdir -p "$dest/skills" "$dest/rules" "$dest/references"
  cp "$ROOT/rules/methodrail.mdc" "$dest/rules/methodrail.mdc"
  for skill in "$@"; do
    mkdir -p "$dest/skills/$skill"
    cp -R "$ROOT/skills/$skill/." "$dest/skills/$skill/"
  done
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
  copy_repo "$fixture" "$dest"
  case "$fixture" in
    init-value)
      if [ "$condition" = "methodrail" ]; then
        copy_methodrail_dot "$fixture" "$dest"
        add_methodrail_skills "$dest"
      fi
      ;;
    knowledge-freshness)
      copy_methodrail_dot "$fixture" "$dest"
      if [ "$condition" = "methodrail" ]; then
        add_methodrail_skills "$dest" how
        mkdir -p "$dest/references/knowledge"
        cp "$ROOT/references/knowledge/freshness.md" "$dest/references/knowledge/freshness.md" 2>/dev/null || true
      fi
      ;;
    knowledge-accumulation)
      copy_methodrail_dot "$fixture" "$dest"
      if [ "$condition" = "baseline" ]; then
        rm -f "$dest/.methodrail/knowledge/webhooks.md"
      else
        add_methodrail_skills "$dest"
      fi
      ;;
    partial-knowledge)
      copy_methodrail_dot "$fixture" "$dest"
      if [ "$condition" = "methodrail" ]; then
        add_methodrail_skills "$dest" how
        mkdir -p "$dest/references/knowledge"
        cp "$ROOT/references/knowledge/freshness.md" "$dest/references/knowledge/freshness.md" 2>/dev/null || true
      fi
      ;;
    human-decision)
      if [ "$condition" = "methodrail" ]; then
        copy_methodrail_dot "$fixture" "$dest"
        add_methodrail_skills "$dest"
        mkdir -p "$dest/references"
        cp "$ROOT/references/decision-frontier.md" "$dest/references/decision-frontier.md"
      fi
      ;;
  esac
  stamp "$dest" "$fixture" "$host" "$repeat" "$condition"
  echo "$dest"
}

FIXTURES="init-value knowledge-freshness knowledge-accumulation partial-knowledge human-decision"
for fixture in $FIXTURES; do
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
