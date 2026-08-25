#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PILOT="${METHODRAIL_PILOT_DIR:-/tmp/methodrail-pilot-20260825-v07}"
case "$(basename "$PILOT")" in
  methodrail-pilot-*) ;;
  *) echo "Refusing to replace a pilot directory without a methodrail-pilot-* basename" >&2; exit 2 ;;
esac
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

add_methodrail_guidance() {
  local dest="$1"
  mkdir -p "$dest/rules" "$dest/references/knowledge"
  cp "$ROOT/rules/methodrail.mdc" "$dest/rules/methodrail.mdc"
  cp "$ROOT/references/knowledge/reuse.md" "$dest/references/knowledge/reuse.md"
  cp "$ROOT/references/knowledge/freshness.md" "$dest/references/knowledge/freshness.md"
  cp "$ROOT/references/knowledge/note-contract.md" "$dest/references/knowledge/note-contract.md"
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
  copy_methodrail_dot "$fixture" "$dest"
  if [ "$fixture" = "knowledge-refresh" ]; then
    node --import tsx "$ROOT/evals/runners/prepare-v0.7-fixture.ts" "$ROOT/evals/fixtures/$fixture" "$dest"
  fi
  case "$fixture" in
    knowledge-reuse)
      if [ "$condition" = "baseline" ]; then
        rm -f "$dest/.methodrail/knowledge/notifications.md"
      else
        add_methodrail_guidance "$dest"
      fi
      ;;
    knowledge-refresh)
      if [ "$condition" = "baseline" ]; then
        rm -f "$dest/.methodrail/knowledge/mail.md"
      else
        add_methodrail_guidance "$dest"
      fi
      ;;
  esac
  stamp "$dest" "$fixture" "$host" "$repeat" "$condition"
  cp -R "$dest" "${dest}.clean"
  echo "$dest"
}

for fixture in knowledge-reuse knowledge-refresh; do
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
