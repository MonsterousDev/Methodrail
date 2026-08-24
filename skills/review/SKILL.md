---
name: review
description: Review a change for correctness, requirement fit, maintainability, evidence, and regressions. Run only when explicitly requested.
disable-model-invocation: true
---

# Review

Review independently from implementation and remain read-only unless the user asks for fixes.

## Workflow

1. Establish the review target, base revision, request, acceptance criteria, and repository guidance.
2. Inspect the complete diff and relevant surrounding code, tests, contracts, and callers. Do not review only the latest commit when the requested range is broader.
3. Check:
   - requirement and specification fit;
   - correctness, error paths, and state transitions;
   - security and data handling relevant to the change;
   - maintainability and unnecessary complexity;
   - test quality and whether evidence supports the claims;
   - compatibility and regressions, using `blast-radius` when boundaries changed.
4. Verify suspected issues against source evidence. Avoid speculative findings without a concrete failure mode.
5. Classify findings:
   - critical: data loss, security exposure, or unusable core behavior;
   - high: likely incorrect behavior or serious regression;
   - medium: real bounded defect or meaningful maintainability risk;
   - low: optional improvement that does not block.
6. Lead with findings, ordered by severity. Cite paths and lines, explain impact, and suggest a focused remedy.
7. If there are no findings, say so and list material verification gaps or residual risks.

## Constraints

- Do not substitute review for verification.
- Do not edit code unless explicitly asked to apply fixes.
- Do not report style preferences as defects unless they violate an established standard.
- Do not invoke `interrogate` automatically; it is explicit-only.

## Completion

The requested change range was inspected in context, findings are evidence-backed and prioritized, and verification gaps are explicit.
