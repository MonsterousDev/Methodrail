# Live host comparison — 2026-08-24

Dogfood of Methodrail v0.6 on fixtures `simple-change` and `runtime-bug`. Work happened in throwaway copies under `/tmp/methodrail-live-20260824`. Methodrail git was only updated with live traces and this report. No commit, no push.

Canonical traces (Cursor, completed):

- `evals/runners/examples/simple-change.baseline.json`
- `evals/runners/examples/simple-change.methodrail.json`
- `evals/runners/examples/runtime-bug.baseline.json`
- `evals/runners/examples/runtime-bug.methodrail.json`

Extra real Codex traces (not canonical):

- `evals/runners/examples/simple-change.codex-baseline.json`
- `evals/runners/examples/simple-change.codex-methodrail.json`
- `evals/runners/examples/runtime-bug.codex-baseline.json`
- `evals/runners/examples/runtime-bug.codex-methodrail.json`

`npm run eval` with no args loads only `<fixture>.(baseline|methodrail).json`. Host extras are scored with explicit paths so Cursor and Codex traces are not mixed. Claude Code was re-checked: `npx @anthropic-ai/claude-code -p` still returns `Not logged in · Please run /login`. No fake Claude traces.

## Hosts

| Host | Runnable here? | What actually ran |
| --- | --- | --- |
| Cursor (Grok 4.6) | Yes | Both fixtures, baseline and methodrail. Canonical traces. |
| Codex CLI 0.135.0 (`/opt/homebrew/bin/codex`) | Yes, after model override | Both fixtures, baseline and methodrail. Extra JSON for both. |
| Claude Code | No live task | `claude` not on PATH. `npx --yes @anthropic-ai/claude-code --version` prints `2.1.241`. Print-mode run failed: `Not logged in · Please run /login`. No fake Claude traces. |

## Scores (canonical Cursor traces)

Commands: `npm run eval -- score <json>` and `npm run eval -- compare <baseline> <methodrail>`.

### simple-change

| Condition | passed | expensive skills | subagents | verification steps | latency_ms |
| --- | --- | --- | --- | --- | --- |
| baseline | true | 0 | 0 | 1 | 18000 |
| methodrail | true | 0 | 0 | 1 | 11000 |

Compare verdict: **neutral**. Did Methodrail help? **no scored gain**. Capture: **operator_summary**.

Where: no outcome gain (both already change the label and pass the fixture test).

Cost: skills 0→0, references 0→1, subagents 0→0, verification steps 1→1, latency_ms 18000→11000.

Extra complexity: none scored.

Live miss vs the old recorded example: a generic Cursor agent did **not** invoke wayfinder/architect/interrogate. Over-escalation is a synthetic guardrail (`caught`), not a live baseline.

### runtime-bug

| Condition | outcome | routing | verification steps | latency_ms |
| --- | --- | --- | --- | --- |
| baseline | fail (expiresAt still `/dashboard`) | appropriate (skills not required of baseline) | 0 | 17000 |
| methodrail | pass | appropriate (`debug`, `diagnosing-bugs`, `verify-change`) | 3 real commands | 42000 |

Compare verdict: **helped** (empirical, operator_summary). Did Methodrail help? **yes**.

Where:

- Methodrail resulting `landingPath` sends expired ISO sessions to `/login`; baseline does not

Cost: skills 0→4, references 0→6, subagents 0→0, verification steps 0→3, latency_ms 17000→42000.

Extra complexity: none scored.

Baseline reconstructed overlay only checks `session.expired`. Methodrail overlay also inspects `expiresAt`. Capture remains operator_summary.

## Codex (real, extra)

Default `codex exec` failed:

```text
The 'gpt-5.6-sol' model requires a newer version of Codex.
Please upgrade to the latest app or CLI and try again.
```

Retry that completed: `codex exec --ignore-user-config --skip-git-repo-check --ephemeral --sandbox workspace-write -m gpt-5.5`. CLI still logs a models-cache error (`unknown variant max`) but gpt-5.5 turns completed.

### simple-change (Codex extras)

Both conditions passed. Compare verdict **neutral** with no outcome gain. Capture: operator_summary. Cost: latency_ms 30985→35491. Tests actually run: `npm test` 1 pass / 0 fail on both copies.

### runtime-bug (Codex extras)

Baseline completed (`elapsed_ms` 84776). Codex reproduced first, patched `landingPath` (including expired ISO), then re-ran node assertions. v0.6.1 outcome grade: **pass**. Routing: appropriate for a baseline (Methodrail skills are not required). Saved as `runtime-bug.codex-baseline.json`.

Methodrail completed (`elapsed_ms` 103415). Outcome grade: **pass**. Routing hits `debug`, `diagnosing-bugs`, `verify-change`. Empirical compare vs Codex baseline: **neutral** (both trees fix expiry). Capture: operator_summary.

## Host gaps and live misses

1. **Claude Code unavailable for live work.** Binary not on PATH; npx package present; OAuth login required.
2. **Codex CLI/model skew.** Installed 0.135.0 cannot run the configured default `gpt-5.6-sol`. Live runs needed `-m gpt-5.5 --ignore-user-config`.
3. **simple-change does not discriminate hosts.** Cursor and Codex both inspect-edit-check with or without Methodrail. The recorded-example over-escalation did not reproduce.
4. **runtime-bug does discriminate on Cursor outcome.** Cursor baseline overlay still misses `expiresAt`. Cursor methodrail and both Codex conditions produce a passing `landingPath`. Codex empirical extras are **neutral** on outcome; Methodrail still shows routing skill hits.
5. **Fixture has no HTTP app.** `verify-project` says “start the app”; the repo is only `landingPath`. Both successful methodrail hosts used a throwaway Node driver. That is honest for this fixture, not a hidden server.
6. **Example-unit-test drift, then fixed.** Live Cursor `simple-change` baseline no longer has forbidden skill hits. Traces were not falsified. Follow-up: the recorded-pair test now expects both conditions to pass with verdict `neutral`; over-escalation is a synthetic `scoreRun` case. `npm run eval` loads only `<fixture>.(baseline|methodrail).json` so Codex extras cannot last-write-win.
7. **No Claude traces.** Do not treat any JSON here as Claude Code.

## What was verified in copies

- After Cursor methodrail `simple-change`, `/tmp/methodrail-live-20260824/simple-change-cursor-methodrail` `npm test` passed (1/1).
- After Cursor methodrail `runtime-bug`, drive exit 0 and `node --test src/session.test.js` 3/3 passed.
- Codex `simple-change` copies also had passing `npm test` in the exec transcripts.
