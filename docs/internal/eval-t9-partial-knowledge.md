# Eval T9 — Partial knowledge reconciliation

Internal maintainer record. Operator: Grok Bot T9. Date: 2026-08-25. No git commit. Constructed traces; scoring only.

## Purpose

Would Methodrail reconcile **partially true** project knowledge instead of discarding it wholesale or trusting it wholesale?

Scenario: stored knowledge still says “all customer payments go through Stripe.” Current code still uses Stripe for subscriptions, but one-time / invoice charges go through Adyen. **Bad:** discard the note and forget Stripe still owns subscriptions, or trust the note and route one-time payments through Stripe too. **Good:** keep the true Stripe-subscriptions fact, detect the Adyen one-time gap, and reconcile the overgeneral “all payments” claim.

This is harder than T6. T6 is a **total contradiction** (JWT vs sessions): the stored claim is false, so preferring repository evidence and flagging JWT is enough. T9 is **partially true**: Stripe is still right for subscriptions. The failure is binary thinking — all-keep or all-drop — not “did you notice the note was stale?”

Not `knowledge-freshness` (T6 JWT→sessions). Dedicated fixture; T6 files were not edited.

## Fixture

`evals/fixtures/partial-knowledge/` — composition fixture. Added to `REQUIRED_COMPOSITION_FIXTURES` in wrap-up.

| File | Role |
| --- | --- |
| `task.md` | “Which processor charges a one-time invoice payment versus a monthly subscription? Answer from current code, using project knowledge only after a freshness check.” |
| `repo/src/payments.js` | `subscribe()` → Stripe client; `chargeInvoice()` → Adyen client. Split helpers in `stripe.js` / `adyen.js`. No comment that restates the answer. |
| `.methodrail/PROJECT.md` | Pointer index to payments knowledge (still labeled Stripe). |
| `.methodrail/knowledge/payments.md` | Stale-partial: “All customer payments go through Stripe.” Recorded revision `ccc111`. |
| `expected.yaml` | `id: fixture.partial-knowledge` |

Expectation:

- `required_skills: []` — behaviors over forcing `how`
- `forbidden_skills: [arena, swarm]`
- `max_expensive_skills: 0`
- `expected_behaviors`:
  - `retain the true Stripe subscriptions fact`
  - `detect Adyen for one-time payments`
  - `reconcile partial knowledge rather than discard or fully trust it`

## How reconcile differs from T6

| | T6 knowledge-freshness | T9 partial-knowledge |
| --- | --- | --- |
| Stored claim | Auth uses JWT Bearer tokens | All customer payments go through Stripe |
| Code | Sessions / HttpOnly `sid` cookie | Stripe `subscribe()`, Adyen `chargeInvoice()` |
| Truth of the note | **Wholly false** | **Partly true** (Stripe still owns subscriptions) |
| Bad baseline | Trust JWT (`stale-knowledge-trusted`) | Trust “all Stripe” (`knowledge-overtrusted`) **or** throw the note away and merge wrong (`knowledge-discarded`) |
| Good methodrail | Prefer repo; flag/refresh the JWT claim | Keep Stripe-for-subscriptions; name Adyen for one-time; **reconcile** the “all payments” overgeneralization |
| What “freshness” is not | Not “ignore `.methodrail` and rediscover from zero” | Same — discard-all is a scored failure here even if code is read |

T6 passing behavior can look like “knowledge was wrong, use code.” Applied to T9 that becomes `knowledge-discarded`: the agent forgets the still-true Stripe subscriptions fact. T9 requires a three-way outcome: keep what still matches, detect the gap, update the claim’s scope.

## Traces (constructed)

`notes` on both canonical files is `constructed`. Not live host runs.

Canonical pair:

- `evals/runners/examples/partial-knowledge.baseline.json` — reads PROJECT.md + payments.md, answers Stripe for both processors, does not check `src/payments.js`. `failure_modes`: `["knowledge-overtrusted"]`. FAIL.
- `evals/runners/examples/partial-knowledge.methodrail.json` — reads knowledge **and** `subscribe()` / `chargeInvoice()`, keeps Stripe for subscriptions, names Adyen for one-time, flags/reconciles the “all payments” claim. `behaviors_observed` matches `expected_behaviors` exactly. `failure_modes` does not include `knowledge-discarded`. PASS.

**Reconcile in the passing trace means flag the overgeneralization, not rewrite.** Methodrail evidence records that “all payments go through Stripe” is only partially true. Flagging the stale scope is enough for this eval.

Guardrail traces live **in the test file** via `parseRun` (no extra JSON files):

1. **discard-all** — `skills_invoked: []`; observes Adyen but misses retain-Stripe; `failure_modes: ["knowledge-discarded"]`. `scoreRun` fails.
2. **trust-all** — answers Stripe for everything; retains Stripe but misses Adyen detect and reconcile; `failure_modes: ["knowledge-overtrusted"]`. `scoreRun` fails.

## Scores

Scored 2026-08-25 with `scoreRun` + `compareScores`. Command: `npx tsx --test tests/eval-t9-partial-knowledge.test.ts`.

| Condition | passed | behavior hits | verification steps | skills | references | expensive skills |
| --- | --- | --- | --- | --- | --- | --- |
| baseline | false | 0 / 3 | 0 | 0 | 2 | 0 |
| methodrail | true | 3 / 3 | 1 | 1 (`how`, not required) | 8 | 0 |

Baseline failure: `missing expected behaviors: retain the true Stripe subscriptions fact, detect Adyen for one-time payments, reconcile partial knowledge rather than discard or fully trust it`. `failure_modes` includes `knowledge-overtrusted`.

Methodrail evidence mentions Stripe, Adyen, and the stale “all payments” claim.

`compareScores`:

- `verdict`: **helped**
- `methodrail_helped`: **true**
- Where: passed expected behavior baseline missed; observed more expected behaviors; collected more verification steps
- Cost: skills 0→1, references 2→8, subagents 0→0, verification steps 0→1
- Extra complexity: none scored

Guardrails: discard-all fail (misses retain-Stripe); trust-all fail (misses Adyen detect and reconcile).

## Pass / fail

**PASS.**

```text
✔ T9 partial-knowledge constructed pair: Methodrail reconciles Stripe/Adyen
✔ T9 guardrail: discard-all synthetic trace fails scoreRun
✔ T9 guardrail: trust-all synthetic trace fails scoreRun
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

## Files written

- `evals/fixtures/partial-knowledge/task.md`
- `evals/fixtures/partial-knowledge/expected.yaml`
- `evals/fixtures/partial-knowledge/repo/src/payments.js`
- `evals/fixtures/partial-knowledge/repo/src/stripe.js`
- `evals/fixtures/partial-knowledge/repo/src/adyen.js`
- `evals/fixtures/partial-knowledge/.methodrail/PROJECT.md`
- `evals/fixtures/partial-knowledge/.methodrail/knowledge/payments.md`
- `evals/fixtures/partial-knowledge/README.md`
- `evals/runners/examples/partial-knowledge.baseline.json`
- `evals/runners/examples/partial-knowledge.methodrail.json`
- `tests/eval-t9-partial-knowledge.test.ts`
- `docs/internal/eval-t9-partial-knowledge.md` (this report)
- `evals/fixtures/README.md` (index line only)

Wrap-up later: `src/eval/load.ts` `REQUIRED_COMPOSITION_FIXTURES` includes this fixture. T6 files unchanged.
