# Eval T5 — Init value

Internal maintainer record. Operator: Grok Bot T5. Date: 2026-08-24. No git commit. Traces are **constructed**, not live host runs.

## What this tests

Does `.methodrail/PROJECT.md` improve later work that needs project knowledge?

Two conditions, same task:

| Condition | What the agent sees |
| --- | --- |
| baseline | Repository only |
| methodrail | Repository + `.methodrail/PROJECT.md` |

The task is **not** a Save→Create rename and **not** `methodrail-init`. It is later engineering work that is easy to get wrong if you only read the README: add a regression for hello-world example HTTP behavior, install the way CI does, and drive HTTP the way this repo already does.

## Fixture (invented library)

`evals/fixtures/init-value/`. Tiny fake CommonJS HTTP library named **helloframe**. Express was not copied into git. Durable facts are the Express dogfood pattern ([v0.6-init-dogfood.md](v0.6-init-dogfood.md)):

- Library vs service: `createApp()` returns a handler; `examples/hello.js` listens only when `!module.parent`
- `npm install`, not `npm ci` (`.npmrc` `package-lock=false`, no lockfile)
- Tests drive HTTP in-process; they must not call `app.listen`
- Published `files` are only `index.js` and `lib/`

Naive traps in the repo (README + example listen): `npm ci`, start the example / `app.listen` / curl localhost, treat the package as a long-running service, invent a verify-localhost skill.

`expected.yaml`: `id: fixture.init-value`, `required_skills: []`, forbidden `wayfinder` / `architect` / `arena` / `swarm` / `interrogate`, `max_expensive_skills: 0`.

Not added to `REQUIRED_COMPOSITION_FIXTURES` (parent will). `src/eval/load.ts` was not edited.

## What PROJECT.md changed

`.methodrail/PROJECT.md` is a 53-line pointer index (under 80; no code fences). It does not clone the README. Agents that load it avoid the three wrong assumptions:

| Wrong assumption (baseline, repo only) | What PROJECT.md states |
| --- | --- |
| CI installs with `npm ci` | No lockfile; `.npmrc` `package-lock=false` → `npm install` |
| Prove HTTP by `app.listen` / curl localhost | Drive HTTP in-process; tests must not `app.listen`; skip a verify-localhost skill |
| This is a long-running service | It is a **library**; examples are demos; published surface is `index.js` + `lib/` |

Unnecessary exploration: methodrail invoked 0 skills and 0 subagents vs baseline 0 skills and 1 explorer subagent. Methodrail did not invoke forbidden skills. The extra reference is PROJECT.md itself (`references` 0→1).

## Constructed traces

Notes on both JSON files say **constructed**. No `host`, `model`, or `latency_ms` (do not look like live Cursor/Codex runs).

- `evals/runners/examples/init-value.baseline.json` — repo only; `npm ci`, `app.listen`, treated as service; missing all expected behaviors
- `evals/runners/examples/init-value.methodrail.json` — `references_loaded` includes `.methodrail/PROJECT.md`; `npm install`, in-process drive, library classification

## Scores

`scoreRun` + `compareScores` against `evals/fixtures/init-value/expected.yaml`.

| Condition | passed | behavior hits | forbidden | expensive skills | subagents | references | verification steps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | **false** | 0/3 | none | 0 | 1 | 0 | 3 (wrong: `npm ci`, listen, curl) |
| methodrail | **true** | 3/3 | none | 0 | 0 | 1 (`PROJECT.md`) | 2 (`npm install`, `npm test`) |

Baseline failures: missing expected behaviors (`npm install` not `npm ci`; in-process HTTP without `app.listen`; library not service). Outcome / `failure_modes` record `npm-ci-without-lockfile`, `app-listen-in-tests`, `treated-as-service`.

`compareScores`:

- Verdict: **helped**
- Did Methodrail help? **yes**
- Where: Methodrail passed expected behavior that baseline missed; Methodrail observed more of the expected behaviors
- Cost: skills 0→0, references 0→1, subagents 1→0, verification steps 3→2
- Extra complexity: none scored

## Pass / fail

**PASS.**

Command: `npx tsx --test tests/eval-t5-init-value.test.ts`

```text
✔ T5 init-value: PROJECT.md helps later work; baseline fails, methodrail passes, verdict helped
✔ T5 PROJECT.md stays a short pointer index and names the durable facts
ℹ tests 2
ℹ pass 2
ℹ fail 0
```

T5 is green because a constructed baseline that only sees the repo fails the knowledge-sensitive behaviors, and a constructed methodrail run that loads PROJECT.md passes them without extra expensive process.

## Files written

- `evals/fixtures/init-value/task.md`
- `evals/fixtures/init-value/expected.yaml`
- `evals/fixtures/init-value/.methodrail/PROJECT.md`
- `evals/fixtures/init-value/repo/package.json`
- `evals/fixtures/init-value/repo/.npmrc`
- `evals/fixtures/init-value/repo/index.js`
- `evals/fixtures/init-value/repo/README.md`
- `evals/fixtures/init-value/repo/lib/app.js`
- `evals/fixtures/init-value/repo/test/hello.test.js`
- `evals/fixtures/init-value/repo/examples/hello.js`
- `evals/runners/examples/init-value.baseline.json`
- `evals/runners/examples/init-value.methodrail.json`
- `tests/eval-t5-init-value.test.ts`
- `docs/internal/eval-t5-init-value.md` (this report)
