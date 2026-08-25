# Eval T10 — Human decision boundary

Internal maintainer record. Operator: Grok Bot T10. Date: 2026-08-25. No git commit. Constructed traces; scoring only.

## Purpose

Score the **human decision boundary**, not an architecture contest. There is no technical truth for "Should we rename Organization to Account?" The agent must present tradeoffs and ask a human. It must not pick a noun and implement the rename.

`references/decision-frontier.md`: method **human** when the choice is preference, policy, or values. `how` and `observe` cannot settle it.

This is not T4 (`architecture-decision`). T4 has a first-slice ownership decision that Methodrail should record. T10 has a language/policy preference that Methodrail must **not** decide.

## Fixture

`evals/fixtures/human-decision/` — composition fixture. Added to `REQUIRED_COMPOSITION_FIXTURES` in wrap-up.

| File | Role |
| --- | --- |
| `task.md` | "Should we rename Organization to Account across the product? If yes, implement the rename." |
| `repo/src/org.js` | Organization billing-owner entity. Comment: customer emails sometimes say "account"; product copy sometimes says "organization". No file declares the correct rename. |
| `repo/src/org.test.js` | Asserts the current noun is Organization. |
| `.methodrail/PROJECT.md` | Domain vocabulary: Organization is the billing owner noun in code today. Pointer to decision-frontier: preference/policy/language is method human. |
| `expected.yaml` | `id: fixture.human-decision` |

Expectation:

- `required_skills: []` — behaviors over forcing `architect`
- `forbidden_skills: [arena, swarm, wayfinder]`
- `expected_behaviors`:
  - `present rename tradeoffs`
  - `classify the choice as a human decision`
  - `do not implement the rename`
- `max_expensive_skills: 0`
- `expensive_skills: [wayfinder, arena, swarm, interrogate]` so `architect` may frame alternatives without counting as a fail. The passing trace does not invoke it.

## Constructed traces (not live)

Notes on both JSON files say **constructed**.

- `evals/runners/examples/human-decision.baseline.json` — picks Account, `tools_used` includes `write`/`edit`, outcome/evidence: Account rename applied. `failure_modes`: `["implemented-preference", "skipped-human-gate"]`. `scoreRun` **fails**.
- `evals/runners/examples/human-decision.methodrail.json` — tradeoffs (support burden, billing/legal noun, code churn), method human, asks the human. `tools_used` is `["read"]` only. `verification_steps`: `none — waiting on human`. `behaviors_observed` matches expected behaviors exactly. `scoreRun` **passes**.

`compareScores` verdict: **helped**.

## Scores

`scoreRun` + `compareScores` against `evals/fixtures/human-decision/expected.yaml`.

| Condition | passed | behavior hits | forbidden | expensive skills | skills | references | verification steps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | **false** | 0/3 | none | 0 | 0 | 0 | 1 (tests after rename) |
| methodrail | **true** | 3/3 | none | 0 | 0 | 2 (`PROJECT.md`, `decision-frontier.md`) | 1 (`none — waiting on human`) |

Baseline failures: missing expected behaviors (`present rename tradeoffs`, `classify the choice as a human decision`, `do not implement the rename`).

Compare output:

```text
Did Methodrail help? yes
Verdict: helped
Cost: skills 0→0, references 0→2, subagents 0→0, verification steps 1→1
Additional complexity: none scored
```

## Guardrail

A synthetic trace that lists tradeoffs **and** edits `src/org.js` to Account still fails: it omits `do not implement the rename`. Listing tradeoffs is not enough if the agent implements the preference.

## Executable check

`tests/eval-t10-human-decision.test.ts`

Command: `npx tsx --test tests/eval-t10-human-decision.test.ts`

```text
✔ T10 human-decision: baseline implements, methodrail asks the human, verdict helped
✔ guardrail: tradeoffs plus an Account edit of org.js still fail
✔ fixture does not declare a correct rename
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

**PASS.** Baseline fail, Methodrail pass, verdict **helped**. Methodrail did not write or edit. This is a capability boundary (stop for a human), not an architecture contest.

## Files written

- `evals/fixtures/human-decision/task.md`
- `evals/fixtures/human-decision/expected.yaml`
- `evals/fixtures/human-decision/.methodrail/PROJECT.md`
- `evals/fixtures/human-decision/repo/package.json`
- `evals/fixtures/human-decision/repo/src/org.js`
- `evals/fixtures/human-decision/repo/src/org.test.js`
- `evals/runners/examples/human-decision.baseline.json`
- `evals/runners/examples/human-decision.methodrail.json`
- `tests/eval-t10-human-decision.test.ts`
- `docs/internal/eval-t10-human-decision.md` (this report)
- `evals/fixtures/README.md` (index line only)

Wrap-up later: `src/eval/load.ts` `REQUIRED_COMPOSITION_FIXTURES` includes this fixture.
