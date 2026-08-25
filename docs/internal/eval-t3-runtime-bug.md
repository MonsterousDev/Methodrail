# Eval T3 — Runtime-bug discrimination

Internal maintainer record. Not a public architecture document.

v0.6.1: outcome is the resulting `landingPath` (expired ISO → `/login`). Required skills are routing for Methodrail only. Cursor empirical result is `helped` (`operator_summary`). Codex extras both outcome-pass → empirical `neutral`.

## What this tests

Does Methodrail make a runtime/source mismatch produce composed diagnosis instead of a source-only patch?

The fixture stays `evals/fixtures/runtime-bug`. The prompt is still: expired sessions open the dashboard; send them to login; fix with evidence, not source inference alone. `expected.yaml` behavior strings are locked because the live traces already match them. Do not rename:

- use project verification for reproduction
- distinguish source inference from runtime evidence
- add regression evidence
- verify the fix

Required skills stay `debug`, `diagnosing-bugs`, `verify-change`. `verify-project` is the project-local drive; it is allowed and useful, but not required by the scorer.

## Why this fixture discriminates

`landingPath` in `repo/src/session.js` returns `/dashboard` whenever `session.token` is present. Expiry is a runtime fact. Reading the source can guess that; it cannot observe it.

The repo has no HTTP app. `verify-project` says “start the app”; honest methodrail runs adapted that to a throwaway `landingPath` driver. That is correct for this fixture, not a hidden server.

## Canonical traces (Cursor)

Files:

- `evals/runners/examples/runtime-bug.baseline.json`
- `evals/runners/examples/runtime-bug.methodrail.json`

Baseline inferred expiry from source shape, edited, and stopped. `verification_steps` and `evidence` are empty. `failure_modes` includes `source-as-runtime`. `behaviors_observed` is `inferred runtime from source`. `scoreRun` fails (missing required skills and expected behaviors).

Methodrail followed debug → diagnosing-bugs → verify-project → red regression → minimal fix → verify-change. Evidence includes observed `/dashboard` then `/login`, `REPRO`, and `DRIVE_EXIT`. Verification steps include pre-fix drive, red `node --test`, green `node --test`, and post-fix drive. `scoreRun` passes.

`compareScores` on this pair only. Verdict: **helped**.

## Stronger assertions

`tests/eval-t3-runtime-bug.test.ts` scores those canonical files against `expected.yaml`.

Baseline must:

- `passed === false`
- `verification_steps.length === 0`
- `evidence.length === 0`
- `failure_modes` includes `source-as-runtime`, or `behaviors_observed` records inferring from source

Methodrail must:

- `passed === true`
- some `evidence` string matches `/observ|drive|\/dashboard|\/login|REPRO|runtime/i`
- some `verification_steps` or `evidence` matches `/regression|node --test|red|green/i`
- some `verification_steps` matches `/post-fix|verify|green|DRIVE_EXIT|pass/i`
- skill hits include `debug`, `diagnosing-bugs`, `verify-change`
- `compareScores` verdict `helped`

The weaker pair check in `tests/eval-runner.test.ts` remains. This file is the discrimination gate.

## Codex extras (secondary, not canonical)

If present:

- `evals/runners/examples/runtime-bug.codex-baseline.json`
- `evals/runners/examples/runtime-bug.codex-methodrail.json`

Score each against the same `expected.yaml`. Do **not** pass them to the canonical `compareScores` call, and do not mix Cursor and Codex into one report. `npm run eval` already ignores `*.codex-*.json`.

Expected secondary check: Codex methodrail `passed === true`; Codex baseline misses the required skills (it reproduced with ad-hoc node assertions but never loaded Methodrail skills). Codex baseline is stronger than Cursor baseline on evidence, and still fails composition.

## Report

- **Discrimination:** live Cursor baseline inferred from source with no runtime evidence; live Cursor methodrail observed, regressed, and verified.
- **Fixture:** keep as-is. No HTTP app; a throwaway driver is honest.
- **Behaviors:** do not rename `expected.yaml` strings; traces already match.
- **Canonical compare:** Cursor pair only, verdict `helped`.
- **Codex:** optional extra scores, never last-write-win into the canonical pair.
