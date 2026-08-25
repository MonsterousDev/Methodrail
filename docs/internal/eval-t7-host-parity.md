# Eval T7 — Host parity

Internal maintainer record. Same fixture, same expected behavior, different host traces.

Parity here is **Methodrail principles**, not identical output. Cursor and Codex may differ in `model`, `tools_used`, and `latency_ms`. They must still score against the same `expected.yaml`. Host extras stay extra: `isCanonicalExampleFile` only matches `<fixture>.(baseline|methodrail).json`, so `npm run eval` does not mix Codex copies into the canonical pair.

Do not block on Claude. Claude Code is not logged in; this report does not invent traces.

v0.6.1: simple-change is empirical `neutral` on both hosts. runtime-bug Cursor is empirical `helped`; Codex extras are empirical `neutral` on outcome (both trees fix expiry). Capture: operator_summary.

## What this tests

Would two honest live hosts, given the same fixture and the same expectation file, exhibit the same Methodrail principles?

- **simple-change:** proportional depth — inspect, edit, cheap verify. Both conditions pass on both hosts. Compare verdict is `neutral` (no scored gain; both already stayed cheap).
- **runtime-bug:** runtime evidence over source inference. Baseline fails; Methodrail passes; compare verdict is `helped`. Methodrail traces have nonempty `evidence` and `verification_steps`, and hit the required skill subset (`debug`, `diagnosing-bugs`, `verify-change`). Skill *lists* need not be identical.

`tests/eval-t7-host-parity.test.ts` scores recorded JSON only. It does not rewrite `src/eval/*` or live traces.

## Traces

Canonical (Cursor):

- `evals/runners/examples/simple-change.baseline.json`
- `evals/runners/examples/simple-change.methodrail.json`
- `evals/runners/examples/runtime-bug.baseline.json`
- `evals/runners/examples/runtime-bug.methodrail.json`

Host extras (Codex):

- `evals/runners/examples/simple-change.codex-baseline.json`
- `evals/runners/examples/simple-change.codex-methodrail.json`
- `evals/runners/examples/runtime-bug.codex-baseline.json`
- `evals/runners/examples/runtime-bug.codex-methodrail.json`

Claude: `readdir` of `evals/runners/examples` finds no `*claude*` files. Unavailable; no fake traces.

## Per-host verdicts

Scored with `scoreRun` / `compareScores` against `evals/fixtures/<fixture>/expected.yaml`.

### simple-change

Same expectation: inspect the current label, edit locally, run a cheap check; zero expensive operators; zero subagents.

| Host | baseline `passed` | methodrail `passed` | compare `verdict` |
| --- | --- | --- | --- |
| Cursor | true | true | `neutral` |
| Codex | true | true | `neutral` |

Both hosts stayed on the cheap path. Methodrail did not need to “help” because baseline already met the fixture. Latency, tools, and model differ across hosts and are not scored as parity failures.

### runtime-bug

Same expectation: required skills `debug`, `diagnosing-bugs`, `verify-change`; distinguish source inference from runtime evidence; reproduce, regress, verify.

| Host | baseline `passed` | methodrail `passed` | compare `verdict` |
| --- | --- | --- | --- |
| Cursor | false | true | `helped` |
| Codex | false | true | `helped` |

Cursor baseline inferred expiry from source and recorded empty `evidence` / `verification_steps`. Codex baseline collected some node assertions but still missed required skills and expected behaviors, so `passed === false`. Methodrail on both hosts named a red runtime capture, added regression evidence, and verified the fix. `skills_invoked` may include extras (e.g. `verify-project`); parity only requires the required subset.

## Hosts are not copied blobs

Each Cursor/Codex pair for the same fixture and condition differs in at least one of `model`, `tools_used`, or `latency_ms` (Cursor `grok-4.6` vs Codex `gpt-5.5`; different tool names and latencies). Codex extras are real host traces, not duplicated Cursor JSON.

## Claude status

**Unavailable.** Claude Code is not logged in. No `evals/runners/examples/*claude*` files exist. Do not treat any recorded JSON here as a Claude Code run.

## Principles

1. **Same `expected.yaml`.** Host identity is not a scoring input; Cursor and Codex traces for a fixture are scored against one expectation file.
2. **Proportional depth on simple-change.** Inspect / edit / cheapest honest check. Neutral compare is the correct live outcome when both conditions already stay cheap.
3. **Runtime evidence over source inference on runtime-bug.** Methodrail must produce nonempty `evidence` and `verification_steps`, not a source-only patch story.
4. **Host-specific traces allowed.** Different models, tools, and latency are expected. Canonical examples remain Cursor; Codex files are extras that `isCanonicalExampleFile` excludes.

## Files written

- `tests/eval-t7-host-parity.test.ts` — executable parity checks on recorded traces
- `docs/internal/eval-t7-host-parity.md` — this note
