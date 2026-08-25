# Eval T4 — Architecture decision quality

Internal maintainer record. Operator: Grok Bot T4. Date: 2026-08-24. No git commit. No Methodrail runtime. Scoring only.

## Purpose

Score **decision quality**, not maximum ceremony, on an ownership change: move session ownership from User to Organization.

The fixture is `evals/fixtures/architecture-decision`. The prompt is a first-slice architecture decision, not a platform rewrite. Methodrail should ground in the current implementation (`how`), treat Session ownership as a domain fact (`domain-modeling`), and run the `architect` skill to record a decision. It should not map the whole repo with `wayfinder`, swarm, arena, or interrogate. `prototype` is allowed only when empirical uncertainty remains; it is not required here.

## Expected Methodrail path

Required skills: `how`, `domain-modeling`, `architect`.

Forbidden: `wayfinder`, `arena`, `swarm`, `interrogate`.

`prototype` is optional. `verify-change` is optional. Verification that matters is recording and checking the decision, not a rewrite.

Expected behaviors (exact strings; the passing trace must match them):

- understand the current implementation
- consider domain ownership
- record a decision
- prototype only if empirical uncertainty remains

## Cost caps

`architect` is in global `EXPENSIVE_SKILLS` (`src/eval/types.ts`). Counting it against `max_expensive_skills: 2` would punish the skill this fixture exists to use.

This fixture overrides `expensive_skills` to `[wayfinder, arena, swarm, interrogate]` so `architect` is allowed. `wayfinder` stays forbidden: expensive mapping is not the point.

## Constructed traces (not live)

Notes on both JSON files say **constructed**.

- `evals/runners/examples/architecture-decision.baseline.json` — skips `how` / `domain-modeling`, jumps to a rewrite, skips recording a decision. `scoreRun` **fails**.
- `evals/runners/examples/architecture-decision.methodrail.json` — invokes `how`, `domain-modeling`, `architect`; records the Organization-owner decision; skips prototype; does not invoke `wayfinder`. `scoreRun` **passes**.

`compareScores` verdict: **helped**. Prototype was **not** required.

Compare output:

```text
Did Methodrail help? yes
Verdict: helped
Cost: skills 0→3, references 0→6, subagents 0→0, verification steps 0→2
Additional complexity: none scored
```

## Fixture slice

Tiny repo: `repo/src/session.js` (`sessionOwnerKey` returns `session.userId`). Knowledge notes say User owns Session today. Task: decide the first slice, do not rewrite a platform.

## Executable check

`tests/eval-t4-architecture-decision.test.ts`

Command: `npx tsx --test tests/eval-t4-architecture-decision.test.ts`

```text
✔ T4 architecture-decision scores decision quality, not maximum ceremony
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

**PASS.** Baseline fail, Methodrail pass, verdict **helped**. Prototype was not required. Methodrail did not invoke `wayfinder`.

## Files written

- `evals/fixtures/architecture-decision/task.md`
- `evals/fixtures/architecture-decision/expected.yaml`
- `evals/fixtures/architecture-decision/repo/src/session.js` (replaced `billing.js`)
- `.methodrail` knowledge / `PROJECT.md` (session ownership, still tiny)
- `evals/composition/architecture-decision.yaml`
- `evals/runners/examples/architecture-decision.baseline.json`
- `evals/runners/examples/architecture-decision.methodrail.json`
- `tests/eval-t4-architecture-decision.test.ts`
- `docs/internal/eval-t4-architecture-decision.md` (this report)

Not edited: `tests/eval-runner.test.ts`, simple-change / runtime-bug examples.
