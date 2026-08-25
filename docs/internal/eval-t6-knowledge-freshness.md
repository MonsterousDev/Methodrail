# Eval T6 — Knowledge freshness

Internal maintainer record. Operator: Grok Bot T6. Date: 2026-08-24. No git commit. Constructed traces; scoring only.

v0.6.1: this pair is a **specification** (`passed`). The grader scores the answer against current `src/auth.js`, not JWT notes.

## Purpose

Would Methodrail catch stale project knowledge instead of treating `.methodrail` notes as truth?

Scenario: stored knowledge still says auth uses JWT Bearer tokens. The repository migrated to sessions/cookies. **Bad:** trust the note and answer JWT. **Good:** detect the contradiction, prefer current code, and refresh or flag the JWT claim.

This is a Methodrail differentiator (family invariant: treat stored notes as current only after a freshness check). It is **not** `runtime-contradiction` (comment vs runtime landing path) and **not** `fresh-knowledge` (reuse still-valid tax notes). Those fixtures stay as they are. T6 uses a dedicated JWT→sessions pair.

## Fixture

`evals/fixtures/knowledge-freshness/` — new composition-style fixture, **not** added to `REQUIRED_COMPOSITION_FIXTURES`. `src/eval/load.ts` was not edited.

| File | Role |
| --- | --- |
| `task.md` | "Where is the session established for an authenticated API request? Name the mechanism from current code, not from memory." |
| `repo/src/auth.js` | `establishSession` sets an HttpOnly `sid` cookie; `sessionFromRequest` reads it. No `jwt.sign`. Leftover comment says JWT was retired. |
| `.methodrail/PROJECT.md` | Pointer index to auth knowledge (still labeled JWT). |
| `.methodrail/knowledge/auth.md` | Stale: JWT Bearer tokens, `jwt.sign`, no session cookies. Recorded revision `bbb000`. |
| `expected.yaml` | `id: fixture.knowledge-freshness` |

Expectation:

- `required_skills: []` — behaviors over forcing `how`
- `forbidden_skills: [arena, swarm]`
- `max_expensive_skills: 0`
- `expected_behaviors`:
  - `detect stale knowledge`
  - `prefer repository evidence over .methodrail knowledge`
  - `refresh or flag the JWT claim`

## Traces (constructed)

`notes` on both files is `constructed`. Not live host runs.

- `evals/runners/examples/knowledge-freshness.baseline.json` — reads PROJECT.md + auth.md, answers JWT, does not check `src/auth.js`. `failure_modes`: `["stale-knowledge-trusted"]`. FAIL.
- `evals/runners/examples/knowledge-freshness.methodrail.json` — reads knowledge **and** `src/auth.js`, detects the contradiction, answers sessions/cookies, flags the JWT claim. `behaviors_observed` matches `expected_behaviors` exactly. PASS.

**Refresh in the passing trace means flag, not rewrite.** Methodrail evidence records that the JWT claim is stale and that `knowledge/auth.md` was not rewritten. Flagging is enough for this eval.

## Scores

Scored 2026-08-24 with `scoreRun` + `compareScores`. Command: `npx tsx --test tests/eval-t6-knowledge-freshness.test.ts`.

| Condition | passed | behavior hits | verification steps | skills | references | expensive skills |
| --- | --- | --- | --- | --- | --- | --- |
| baseline | false | 0 / 3 | 0 | 0 | 2 | 0 |
| methodrail | true | 3 / 3 | 1 | 1 (`how`, not required) | 6 | 0 |

Baseline failure: `missing expected behaviors: detect stale knowledge, prefer repository evidence over .methodrail knowledge, refresh or flag the JWT claim`. `failure_modes` includes `stale-knowledge-trusted`.

Methodrail evidence mentions both JWT knowledge and session code.

`compareScores`:

- `verdict`: **helped**
- `methodrail_helped`: **true**
- Where: passed expected behavior baseline missed; observed more expected behaviors; collected more verification steps
- Cost: skills 0→1, references 2→6, subagents 0→0, verification steps 0→1
- Extra complexity: none scored

## Pass / fail

**PASS.**

```text
✔ T6 knowledge-freshness constructed pair: Methodrail detects stale JWT knowledge
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

## Files written

- `evals/fixtures/knowledge-freshness/task.md`
- `evals/fixtures/knowledge-freshness/expected.yaml`
- `evals/fixtures/knowledge-freshness/repo/src/auth.js`
- `evals/fixtures/knowledge-freshness/.methodrail/PROJECT.md`
- `evals/fixtures/knowledge-freshness/.methodrail/knowledge/auth.md`
- `evals/fixtures/knowledge-freshness/README.md`
- `evals/runners/examples/knowledge-freshness.baseline.json`
- `evals/runners/examples/knowledge-freshness.methodrail.json`
- `tests/eval-t6-knowledge-freshness.test.ts`
- `docs/internal/eval-t6-knowledge-freshness.md` (this report)
- `evals/fixtures/README.md` (index line only)

Not edited: `src/eval/load.ts`, `REQUIRED_COMPOSITION_FIXTURES`.
