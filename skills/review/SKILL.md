---
name: review
description: Review a change for correctness, requirement fit, maintainability, evidence, and regressions. Run only when explicitly requested.
disable-model-invocation: true
---

# Review

Review independently from implementation and remain read-only unless the user asks for fixes.

Give the reviewer a [review packet](../../references/protocols/review-packet.md) of deterministic facts instead of making them rediscover the diff, tests, and intent.

## Workflow

1. Establish the review target, base revision, request, acceptance criteria, and repository guidance. Assemble the packet: intent, acceptance criteria, relevant design/decision, base and head revisions, relevant diff, implementation summary, verification evidence, known deviations, risk/rigor, and rubric.
2. Inspect the complete requested range and relevant surrounding code, tests, contracts, and callers. Do not review only the latest commit when the requested range is broader.
3. Check these axes:
   - intent/acceptance
   - correctness
   - architecture
   - maintainability
   - verification
   - blast radius
   - unnecessary complexity
4. Verify suspected issues against source evidence. Avoid speculative findings without a concrete failure mode. Use `blast-radius` when boundaries changed.
5. Classify findings:
   - critical: data loss, security exposure, or unusable core behavior;
   - important: likely incorrect behavior, serious regression, or meaningful contract risk;
   - minor: optional improvement that does not block.
6. Converge:
   - critical → fix;
   - important → fix or explicitly adjudicate;
   - minor → record; does not automatically block;
   - the same disputed issue repeatedly → escalate/arbitrate rather than loop.
7. Lead with findings, ordered by severity. Cite paths and lines, explain impact, and suggest a focused remedy.
8. If there are no findings, say so and list material verification gaps or residual risks.

## Constraints

- Do not substitute review for verification.
- Do not edit code unless explicitly asked to apply fixes.
- Do not report style preferences as defects unless they violate an established standard.
- Do not invoke `interrogate` automatically; it is explicit-only.
- Avoid infinite review loops.

## Completion

The requested change range was inspected in context, findings are evidence-backed and prioritized, and verification gaps are explicit.
