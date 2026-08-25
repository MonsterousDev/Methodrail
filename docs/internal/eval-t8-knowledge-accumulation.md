# Eval T8 — Knowledge accumulation / learning loop

Internal maintainer record. Operator: Grok Bot T8. Date: 2026-08-25. No git commit. Constructed traces; scoring only. No Methodrail runtime.

## Purpose

Prove **reflect → knowledge candidate → future leverage**, not merely that knowledge exists or can go stale. T6 already covers stale JWT notes vs current session code. T8 is the other half of the loop: a non-obvious invariant is discovered, proposed as a candidate (not silently auto-applied), then reused on a later task so the agent does not pay rediscovery cost.

Scenario (two tasks, one fixture):

| Task | Prompt | Role |
| --- | --- | --- |
| A | Duplicate `invoice.paid` webhooks credited the wallet twice. Find the root cause. | Debug; propose `.methodrail/knowledge/webhooks.md` **candidate**. Not scored as the composition pair. |
| B | Add handling for `invoice.paid` webhooks. Do not double-credit on Stripe retries. | Scored later work. Baseline has no promoted note. Methodrail loads it. |

## Invariant

Fake product **tillbox** (not a copy of a real processor). Payment webhook retries must be idempotent by `eventId`. Duplicate deliveries no-op. Corrections are new events; never mutate a posted ledger row.

Encoded in code without a one-line comment that makes rediscovery free: `repo/src/ledger.js` keeps append-only frozen rows and a `byKey` Map; `handle()` passes `event.id` into `post()`. `invoice.paid` is not routed yet.

## Fixture

`evals/fixtures/knowledge-accumulation/` — composition fixture. Added to `REQUIRED_COMPOSITION_FIXTURES` in wrap-up. Task A example `knowledge-accumulation-discover.methodrail.json` is excluded from `npm run eval` (not a canonical `<id>.(baseline|methodrail).json` name).

| File | Role |
| --- | --- |
| `task.md` | Task B (scored): add `invoice.paid`; do not double-credit on Stripe retries |
| `task-a.md` | Task A: duplicate `invoice.paid` credited twice; find the root cause |
| `repo/src/ledger.js` | Append-only `post()` / `byKey` Map (Task A fix already in place) |
| `repo/src/webhooks.js` | Routes `charge.succeeded` through `post(..., event.id)`; `invoice.paid` returns `null` |
| `.methodrail/PROJECT.md` | Pointer index to webhook knowledge |
| `.methodrail/knowledge/webhooks.md` | **Promoted** candidate, used only by the methodrail Task B condition |
| `expected.yaml` | `id: fixture.knowledge-accumulation` |

Expectation:

- `required_skills: []`
- `forbidden_skills: [arena, swarm, interrogate]`
- `max_expensive_skills: 0`
- `expected_behaviors`:
  - `apply the eventId idempotency invariant`
  - `skip rediscovery of the already-learned webhook rule`
  - `verify credits are not doubled`

## What was promoted

After Task A, reflect proposed a **knowledge candidate** (not a silent standing rule):

> Ledger credits are idempotent on eventId. Duplicate webhook deliveries no-op. Corrections are new events; never mutate a posted ledger row.

The fixture tree contains the file because the story is **user approved between A and B**. The discover trace does not claim auto-promotion.

## Task B used it

Methodrail Task B `references_loaded` includes `.methodrail/knowledge/webhooks.md`. It routed `invoice.paid` through `post(..., event.id)` and verified a retry did not double-credit. Baseline did not list that file; it grepped/how'd the handler and missed idempotency (`failure_modes`: `rediscovery`, `missed-idempotency`).

## Traces (constructed)

`notes` on all three files contain `constructed`. Not live host runs. Discover is **not** the compare baseline.

- `evals/runners/examples/knowledge-accumulation-discover.methodrail.json` — Task A. `diagnosing-bugs` + `reflect`. Evidence names `eventId`. Outcome: candidate proposed, waiting for approval; standing knowledge not written. `failure_modes` empty.
- `evals/runners/examples/knowledge-accumulation.baseline.json` — Task B without knowledge. `how` + grep. Rediscovered (or missed) the invariant. FAIL.
- `evals/runners/examples/knowledge-accumulation.methodrail.json` — Task B with knowledge. Loads `webhooks.md`. `behaviors_observed` matches `expected_behaviors` exactly. PASS. Skills 0 (no wayfinder).

## Scores

Scored 2026-08-25 with `scoreRun` + `compareScores`. Command: `npx tsx --test tests/eval-t8-knowledge-accumulation.test.ts`.

| Condition | passed | behavior hits | verification steps | skills | references | expensive skills |
| --- | --- | --- | --- | --- | --- | --- |
| baseline (Task B) | false | 0 / 3 | 0 | 1 (`how`) | 2 | 0 |
| methodrail (Task B) | true | 3 / 3 | 1 | 0 | 4 (includes `webhooks.md`) | 0 |

Baseline failure: `missing expected behaviors: apply the eventId idempotency invariant, skip rediscovery of the already-learned webhook rule, verify credits are not doubled`. `failure_modes` include `rediscovery` and `missed-idempotency`.

Rediscovery cost: methodrail `skill_count` 1→0; baseline used `how` and grep; methodrail loaded knowledge and did not invoke wayfinder.

`compareScores`:

- `verdict`: **helped**
- `methodrail_helped`: **true**
- Where: passed expected behavior baseline missed; observed more expected behaviors; collected more verification steps
- Cost: skills 1→0, references 2→4, subagents 0→0, verification steps 0→1
- Extra complexity: none scored

Discover scored against Task B `expected.yaml` is not a pass (wrong task). It is not the composition pair.

## Pass / fail

**PASS.**

```text
✔ T8 discover trace proposes a knowledge candidate without auto-promoting
✔ T8 knowledge-accumulation Task B pair: baseline fails, methodrail reuses promoted knowledge
ℹ tests 2
ℹ pass 2
ℹ fail 0
```

## Files written

- `evals/fixtures/knowledge-accumulation/task.md`
- `evals/fixtures/knowledge-accumulation/task-a.md`
- `evals/fixtures/knowledge-accumulation/expected.yaml`
- `evals/fixtures/knowledge-accumulation/README.md`
- `evals/fixtures/knowledge-accumulation/.methodrail/PROJECT.md`
- `evals/fixtures/knowledge-accumulation/.methodrail/knowledge/webhooks.md`
- `evals/fixtures/knowledge-accumulation/repo/package.json`
- `evals/fixtures/knowledge-accumulation/repo/index.js`
- `evals/fixtures/knowledge-accumulation/repo/src/ledger.js`
- `evals/fixtures/knowledge-accumulation/repo/src/webhooks.js`
- `evals/fixtures/knowledge-accumulation/repo/src/webhooks.test.js`
- `evals/runners/examples/knowledge-accumulation-discover.methodrail.json`
- `evals/runners/examples/knowledge-accumulation.baseline.json`
- `evals/runners/examples/knowledge-accumulation.methodrail.json`
- `tests/eval-t8-knowledge-accumulation.test.ts`
- `docs/internal/eval-t8-knowledge-accumulation.md` (this report)
- `evals/fixtures/README.md` (index line only)

Wrap-up later: `src/eval/load.ts` `REQUIRED_COMPOSITION_FIXTURES` includes this fixture. Task A discover JSON is excluded from canonical `npm run eval` loading. Live `simple-change` / `runtime-bug` JSON unchanged.
