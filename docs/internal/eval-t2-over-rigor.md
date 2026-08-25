# Eval T2 — Over-rigor (guardrail)

Internal maintainer record. Not a live host comparison.

v0.6.1: over-rigor is guardrail `caught` (routing `violation`) even when the button patch is correct.

## What this tests

Would the evaluator catch obvious over-engineering on a one-word label change?

It does **not** test whether every real agent will over-escalate. Live Cursor and Codex `simple-change` baselines did not: they inspected, edited, and ran the unit test. See `docs/internal/v0.6-reflect-miss.md`. Canonical example JSON stays those honest traces.

## Why a guardrail

The miss that motivated this check was unconstrained over-rigor: `wayfinder` to map a tiny repo, `architect` to treat a label as a domain term, `interrogate` as a product question, three subagents, empty `verification_steps`. The cheap path is inspect → edit → `node --test src/button.test.js`.

Live agents did not reproduce that path. A baseline-vs-Methodrail comparison on recorded JSON would pass for the wrong reason: both sides stayed cheap, so the comparison never exercises the refusal. The evaluator still needs a failing trace so `scoreRun` cannot silently stop catching forbidden operators.

Keep the synthetic trace. Do not rewrite `evals/runners/examples/simple-change.baseline.json` to invent over-escalation that did not happen.

## Expected scoring

`tests/eval-t2-over-rigor-guardrail.test.ts` builds a synthetic `EvalRun` (`parseRun`) for fixture `simple-change`:

| Field | Value |
| --- | --- |
| `skills_invoked` | `wayfinder`, `architect`, `interrogate` |
| `subagents_used` | 3 |
| `verification_steps` | `[]` |

`scoreRun` against `evals/fixtures/simple-change/expected.yaml` must return `passed: false` and `forbidden_hits` equal to those three skills.

The same operators remain forbidden in `evals/complexity/button-text.yaml` (`wayfinder`, `architect`, `prototype`, `arena`, `swarm`, `interrogate`). That YAML is a specification check, not a recorded-run comparison.

## Report

- **Guardrail:** mechanical refusal of a constructed over-escalation, independent of what live hosts actually did.
- **Live agents:** did not reproduce the miss; do not require `simple-change.baseline.json` to contain forbidden skills.
- **Evaluator:** still fails the synthetic trace, so over-rigor remains catchable even when real baselines stay cheap.
