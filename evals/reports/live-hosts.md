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

Compare verdict: **helped**. Did Methodrail help? **yes**.

Where: no scored behavioral gain (both already did inspect / edit / cheap check).

Cost: skills 0→0, references 0→1, subagents 0→0, verification steps 1→1, latency_ms 18000→11000.

Extra complexity: none scored.

Live miss vs the old recorded example: a generic Cursor agent did **not** invoke wayfinder/architect/interrogate. `tests/eval-runner.test.ts` still asserts `baselineScore.forbidden_hits.length > 0` on the example baseline, so that unit test now fails against honest live traces. The scorer also labels a both-passed pair as `helped` even when Where is empty.

### runtime-bug

| Condition | passed | skill misses | verification steps | latency_ms |
| --- | --- | --- | --- | --- |
| baseline | false | debug, diagnosing-bugs, verify-change | 0 | 17000 |
| methodrail | true | none | 4 | 42000 |

Compare verdict: **helped**. Did Methodrail help? **yes**.

Where:

- Methodrail passed expected behavior that baseline missed
- Methodrail observed more of the expected behaviors
- Methodrail collected more verification steps

Cost: skills 0→4, references 0→6, subagents 0→0, verification steps 0→4, latency_ms 17000→42000.

Extra complexity: none scored.

Baseline failure modes: `source-as-runtime`. Methodrail used debug → diagnosing-bugs → project `verify-project` → failing regression → minimal fix → verify-change. Pre-fix drive: expired session landed on `/dashboard`. Post-fix drive and `node --test src/session.test.js`: 3 pass, 0 fail.

## Codex (real, extra)

Default `codex exec` failed:

```text
The 'gpt-5.6-sol' model requires a newer version of Codex.
Please upgrade to the latest app or CLI and try again.
```

Retry that completed: `codex exec --ignore-user-config --skip-git-repo-check --ephemeral --sandbox workspace-write -m gpt-5.5`. CLI still logs a models-cache error (`unknown variant max`) but gpt-5.5 turns completed.

### simple-change (Codex extras)

Both conditions passed. Compare verdict **helped** with no scored behavioral gain. Cost: latency_ms 30985→35491. Tests actually run: `npm test` 1 pass / 0 fail on both copies.

### runtime-bug (Codex extras)

Baseline completed (`elapsed_ms` 84776). Codex reproduced first (`expiresAt: "2000-01-01T00:00:00.000Z"` → `/dashboard`), then patched, then re-ran node assertions. Stronger than the Cursor baseline, because the fixture prompt already asked for evidence and Codex followed it. Saved as `runtime-bug.codex-baseline.json`.

Methodrail completed (`elapsed_ms` 103415). Codex read `debug`, `diagnosing-bugs`, `.methodrail/PROJECT.md`, `verify-project`, then `verify-change`. Red loop, red `node --test test/session.test.mjs`, minimal expiry check, green tests (2 pass), post-fix landingPath capture `/login`. Saved as `runtime-bug.codex-methodrail.json`.

## Host gaps and live misses

1. **Claude Code unavailable for live work.** Binary not on PATH; npx package present; OAuth login required.
2. **Codex CLI/model skew.** Installed 0.135.0 cannot run the configured default `gpt-5.6-sol`. Live runs needed `-m gpt-5.5 --ignore-user-config`.
3. **simple-change does not discriminate hosts.** Cursor and Codex both inspect-edit-check with or without Methodrail. The recorded-example over-escalation did not reproduce.
4. **runtime-bug does discriminate.** Cursor baseline inferred from source and skipped verification. Cursor methodrail and both Codex conditions collected runtime evidence. Methodrail added required skills, a project-verify drive, and a red/green regression.
5. **Fixture has no HTTP app.** `verify-project` says “start the app”; the repo is only `landingPath`. Both successful methodrail hosts used a throwaway Node driver. That is honest for this fixture, not a hidden server.
6. **Example-unit-test drift, then fixed.** Live Cursor `simple-change` baseline no longer has forbidden skill hits. Traces were not falsified. Follow-up: the recorded-pair test now expects both conditions to pass with verdict `neutral`; over-escalation is a synthetic `scoreRun` case. `npm run eval` loads only `<fixture>.(baseline|methodrail).json` so Codex extras cannot last-write-win.
7. **No Claude traces.** Do not treat any JSON here as Claude Code.

## What was verified in copies

- After Cursor methodrail `simple-change`, `/tmp/methodrail-live-20260824/simple-change-cursor-methodrail` `npm test` passed (1/1).
- After Cursor methodrail `runtime-bug`, drive exit 0 and `node --test src/session.test.js` 3/3 passed.
- Codex `simple-change` copies also had passing `npm test` in the exec transcripts.
