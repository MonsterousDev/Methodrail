# Eval T1 — Simple task neutrality

Internal maintainer record. Operator: Grok Bot T1. Date: 2026-08-24. No git commit. No Methodrail runtime. Scoring only.

v0.6.1: empirical result is `neutral` (`operator_summary`). Graders inspect the resulting `button.js` and run the fixture test.

## Purpose

Ensure Methodrail does not add unnecessary process on a tiny copy change. Fixture: `evals/fixtures/simple-change`. Task: change button label Save → Create. Do not change behavior.

Expected path for **both** baseline and Methodrail: inspect → edit → verify (cheap check). Methodrail succeeding is acceptable when it is at least as cheap as baseline. Methodrail is not required to use more skills.

## Old assumption vs new

| | Old | New (this test) |
| --- | --- | --- |
| What “success” meant | Baseline must fail (over-escalate with wayfinder / architect / interrogate, skip the cheap check). Methodrail must then look better. | Both may succeed. Neutrality is the pass: no scored behavioral gain **and** no extra expensive operators → `compareScores` verdict `neutral`. |
| What the live traces showed | An imagined unconstrained miss that did not reproduce on Cursor. | Honest inspect → edit → cheap check on both conditions. |
| What would fail T1 | Baseline passing. | Methodrail failing, Methodrail adding expensive skills or subagents, missing expected behaviors, or `compareScores` labeling a both-passed no-gain pair as `helped`. |

The old recorded-example story required a baseline failure so Methodrail could be scored as “helped.” Live Cursor work replaced that: a generic agent already took the cheap path. T1 now requires **no regression** and **no extra expensive process**, not a baseline miss.

## Fixture and traces

- Task: `evals/fixtures/simple-change/task.md`
- Expectation: `evals/fixtures/simple-change/expected.yaml` (behavior strings not renamed; traces already match)
- Forbidden: wayfinder, architect, arena, swarm, interrogate
- Caps: `max_subagents: 0`, `max_expensive_skills: 0`
- Live Cursor pair (canonical, already recorded):
  - `evals/runners/examples/simple-change.baseline.json`
  - `evals/runners/examples/simple-change.methodrail.json`

Expected behaviors (exact strings):

- `inspect the current label`
- `edit locally`
- `run a cheap check if one exists`

Executable check: `tests/eval-t1-neutrality.test.ts`. It does **not** assert that baseline failed.

## Live result

Scored 2026-08-24 with `scoreRun` + `compareScores` against `expected.yaml`. Host: Cursor (`grok-4.6`).

| Condition | passed | forbidden_hits | expensive skills | subagents | verification steps | latency_ms |
| --- | --- | --- | --- | --- | --- | --- |
| baseline | true | empty | 0 | 0 | 1 (`node --test src/button.test.js`) | 18000 |
| methodrail | true | empty | 0 | 0 | 1 (`npm test`) | 11000 |

Both traces observed all three expected behaviors. Methodrail loaded `rules/methodrail.mdc` only; it did not invoke forbidden or expensive skills.

`compareScores`:

- `verdict`: **neutral**
- `methodrail_helped`: **null**
- `where.length`: **0**
- extra expensive process: none (`expensive_skill_count` 0→0, `subagents_used` 0→0)

Cost line (not a fail): skills 0→0, references 0→1, subagents 0→0, verification steps 1→1, latency_ms 18000→11000. The extra reference is the family invariant, not an expensive operator.

## Pass / fail

**PASS.**

Command: `npx tsx --test tests/eval-t1-neutrality.test.ts`

```text
✔ T1 simple-change live Cursor pair is behavior-neutral and stays cheap
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

T1 is green because both conditions succeeded on the cheap path and Methodrail did not add scored expensive process. That is the intended outcome for a one-word label change.

## Files written

- `tests/eval-t1-neutrality.test.ts`
- `docs/internal/eval-t1-neutrality.md` (this report)

Not edited: `tests/eval-runner.test.ts`, `src/eval/*`, `expected.yaml`, live JSON.
