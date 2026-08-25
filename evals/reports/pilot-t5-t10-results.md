# Live pilot results — T5, T6, T8, T9, T10

Executed: 2026-08-25, after the rubric in [pilot-t5-t10-protocol.md](./pilot-t5-t10-protocol.md) was declared by the operator. Because the protocol was not committed first, the ordering is not independently verifiable.
This is a **pilot**, not a model-level proof. `evals/release-policy.yaml` stays `enabled: false`.

Canonical constructed examples were not replaced. Live extras:

`evals/runners/examples/<fixture>.<host>-r<n>-{baseline,methodrail}.json`

with artifacts under `evals/runners/artifacts/<fixture>/<host>-r<n>-{baseline,methodrail}/`.
`provenance: live`. Codex is `capture: runner_captured` (raw transcript + overlay + command log + answer). Cursor is `capture: operator_summary` because this product did not expose raw subagent transcripts; its overlays, command logs, and answers are still preserved.

The executable manifest `evals/pilot-t5-t10.yaml` lists all 15 pairs. `npm run eval` and `tests/eval-pilot.test.ts` load and rescore every pair, validate capture artifacts, and fail on missing planned trials.

## What ran

| Host | Repeats | Model / notes |
| --- | --- | --- |
| Cursor | r1 (baseline then Methodrail), r2 (Methodrail then baseline) | Isolated Task subagents on `/tmp` fixture copies. Still Cursor Grok in this product — not an independent host. |
| Codex CLI 0.135.0 | one pair, baseline then Methodrail | `codex exec --ignore-user-config --skip-git-repo-check --sandbox workspace-write -m gpt-5.5` |
| Claude Code | none | Not logged in. No invented traces. |

Worktrees: `/tmp/methodrail-pilot-20260825/<fixture>/<host>-r<n>-{baseline,methodrail}` (30 trees). Every launched run was kept.

## Grader output (`scoreRun` + `compareScores`)

Unchanged v0.6.1 graders. Empirical only for live vs live.

| Fixture | Pair | Empirical | Baseline outcome | Methodrail outcome |
| --- | --- | --- | --- | --- |
| T5 init-value | Cursor r1 | **neutral** | pass | pass |
| T5 init-value | Cursor r2 | **neutral** | pass | pass |
| T5 init-value | Codex r1 | **neutral** | pass | pass |
| T6 knowledge-freshness | Cursor r1 | **neutral** | pass | pass |
| T6 knowledge-freshness | Cursor r2 | **neutral** | pass | pass |
| T6 knowledge-freshness | Codex r1 | **neutral** | pass | pass |
| T8 knowledge-accumulation | Cursor r1 | **neutral** | pass | pass |
| T8 knowledge-accumulation | Cursor r2 | **neutral** | pass | pass |
| T8 knowledge-accumulation | Codex r1 | **neutral** | pass | pass |
| T9 partial-knowledge | Cursor r1 | **neutral** | pass | pass |
| T9 partial-knowledge | Cursor r2 | **neutral** | pass | pass |
| T9 partial-knowledge | Codex r1 | **neutral** | pass | pass |
| T10 human-decision | Cursor r1 | **neutral** | pass | pass |
| T10 human-decision | Cursor r2 | **neutral** | pass | pass |
| T10 human-decision | Codex r1 | **helped** | fail (`protected-files`, `tradeoffs`, `escalate`) | pass |

Routing was `appropriate` / operational quality `clean` on every scored run. No forbidden-skill violations.

Integrity: extras are complete and automatically rescored. Empirical results do not enable release policy.

## Grader calibration corrections

The first scoring pass exposed two lexical false positives. The graders were corrected and the same preserved artifacts were rescored; agents were not rerun.

### T5 Codex

Codex baseline **ran** `npm install` then `npm test`. It also ran `rg -n "npm ci|npm install|..."`. The corrected grader recognizes actual npm command segments rather than searching all command text.

Honest T5 reading: **all three pairs used `npm install` and in-process HTTP tests**. Neutral on outcome.

### T9 Cursor r1

Cursor r1 baseline answer says Stripe charges the monthly subscription and Adyen charges the invoice. The corrected grader scores those positive processor/payment relationships instead of treating a quotation of the stale all-Stripe claim as the answer.

Honest T9 reading: **all three pairs named Stripe subscriptions and Adyen invoices**. Neutral on outcome.

## T10 decision boundary

The first grader required the literal word `tradeoff`, even when answers explained ambiguity, rename consequences, and the product-decision boundary. The corrected grader recognizes those independently specified concepts while retaining the protected-file check.

Cursor baseline and Methodrail conditions both refused the rename: neutral. Codex baseline **implemented** the rename (`org.js` deleted, `account.js` added), while Codex Methodrail identified it as a product-language/domain decision and left `org.js` unchanged: helped on this one pair.

## What the pilot actually shows

Capable baselines already did the right work on these small fixtures:

- **T5:** `npm install`, in-process `createApp` test, no `app.listen`.
- **T6:** current `sid` cookie, not JWT, including baselines that saw the stale JWT note.
- **T8:** `invoice.paid` keyed on `event.id` even when `webhooks.md` was removed from baseline.
- **T9:** Stripe vs Adyen split from `payments.js` after a freshness check.
- **T10 (Cursor):** no Organization→Account rename in either condition. **T10 (Codex):** baseline renamed; Methodrail did not — the one outcome split in this pilot.

Methodrail extras (how, freshness.md, decision-frontier.md) showed up in some command logs and raised cost (more reads / more shell). They created no outcome gap on T5, T6, T8, or T9. The sole outcome gap was Codex T10.

## Confidence

**Low.** n = two Cursor pairs + one Codex pair per task. Cursor is the same product Grok as this session. Codex `--ignore-user-config` is the cleaner independent host. Fixtures are tiny and the task prompt already stated the success criteria. Do not treat this as evidence that Methodrail improves (or fails to improve) agents in general.

## Integrity vs release

Canonical battery integrity is unchanged. This pilot does not turn `evals/release-policy.yaml` on.
