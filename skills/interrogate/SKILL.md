---
name: interrogate
description: Conduct conservative independent adversarial analysis of a high-risk change. Run only when the user explicitly requests interrogate.
disable-model-invocation: true
---

# Interrogate

Use independent analysis to expose consequential blind spots. This skill never activates from risk alone.

## Activation

Proceed only when the user explicitly names or invokes `interrogate`. A request to “review,” “double-check,” or implement high-risk code is not sufficient.

Decline or suggest ordinary `review` when the change is mechanical, narrowly local, or independent analysis would not materially improve confidence.

## Method

1. Fix a shared scope: request, acceptance criteria, full change range, relevant context, verification evidence, known deviations, and review rubric.
2. Obtain genuinely independent analyses when available. Give each reviewer the same core evidence and rubric.
3. Ask reviewers to identify concrete failure modes, violated invariants, unsafe assumptions, missing evidence, and rollback concerns.
4. Reject theatrical personas, duplicated opinions, and claims unsupported by source or runtime evidence.
5. Compare findings:
   - agreement increases confidence but is not proof;
   - disagreement identifies an assumption to inspect;
   - unique findings require direct validation.
6. Synthesize only validated findings, unresolved disagreements, and residual risk. Do not average incompatible conclusions.

## Constraints

- Read-only unless the user separately requests fixes.
- Minimize disclosure: share only repository context required for the review.
- Do not send secrets, credentials, personal data, or proprietary code to external services without explicit authorization.
- If independent reviewers are unavailable, say so; do not simulate independence.

## Completion

The report states who or what reviewed which scope, evidence-backed findings, unresolved disagreements, verification gaps, and residual risk.
