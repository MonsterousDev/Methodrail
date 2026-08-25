# Declared live pilot protocol — T5, T6, T8, T9, T10

Operator-declared: 2026-08-25, before the v0.6.1 live runs for these fixtures. The protocol and results were created in the same uncommitted worktree, so this ordering is not independently verifiable and must not be described as external pre-registration. Future protocols must be committed or independently timestamped before trials begin.
Status: **executed 2026-08-25**. Results: [pilot-t5-t10-results.md](./pilot-t5-t10-results.md). This file remains the rubric.

This is a **pilot**, not a model-level proof. Planned size: two Cursor pairs and one Codex pair per task. Too small to establish reliable improvement.

## Rubric

Use the v0.6.1 artifact-backed graders in `src/eval/grade-outcome.ts` unchanged:

| Fixture | Outcome ground truth |
| --- | --- |
| T5 init-value | command log + resulting tests: `npm install` not `npm ci`; HTTP in-process; tests pass |
| T6 knowledge-freshness | final answer vs current `repo/src/auth.js` (sid cookie, not JWT as current) |
| T8 knowledge-accumulation | resulting `webhooks.js` is idempotent on `eventId` for `invoice.paid` |
| T9 partial-knowledge | answer retains Stripe subscriptions and names Adyen for one-time invoices |
| T10 human-decision | `repo/src/org.js` unchanged; answer has tradeoffs and human escalation |

Routing and cost are reported separately. Over-rigor is operational quality, not an outcome fail.

## Controls

- Identical task prompts between baseline and Methodrail (the fixture `task.md`).
- Same host, model, version, and settings within a pair.
- Alternate condition order across the two Cursor repeats (repeat 1: baseline then Methodrail; repeat 2: Methodrail then baseline).
- Fresh worktree per run; never reuse a dirty tree.
- Preserve answer, overlay/patch, and `command_log` with process exit codes. Preserve a raw transcript when the host exposes one.
- `provenance: live`. `capture: runner_captured` requires a raw transcript plus the artifact bundle; otherwise use `operator_summary`.
- Never rerun selectively because an outcome was unfavorable. Keep every launched run.
- Claude: only if logged in. Otherwise record the gap. Do not invent traces.

## T8

Do **not** score Task A as the composition pair. Both Task B conditions start from the same post-approval fixture tree already in `evals/fixtures/knowledge-accumulation/` (promoted `webhooks.md` present for Methodrail, absent for baseline). The variable is persisted knowledge, not a better Task A. Optional Task A runs are recorded separately.

## Integrity vs empirical

Missing artifacts, broken graders, or missing planned trials fail the integrity gate.
Empirical `helped` / `neutral` / `harmed` / `incomplete` are reported honestly.
A harmed live result does not fail integrity.
`evals/release-policy.yaml` stays `enabled: false` for this pilot.

## Recording

Write extras next to canonical specs, do not replace them:

`evals/runners/examples/<fixture>.<host>-r<n>-{baseline,methodrail}.json`

Artifacts:

`evals/runners/artifacts/<fixture>/<host>-r<n>-{baseline,methodrail}/`
