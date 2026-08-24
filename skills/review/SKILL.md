---
name: review
description: Review a change for correctness, requirement fit, maintainability, evidence, and regressions. Run only when explicitly requested.
disable-model-invocation: true
---

# Review

Review independently from implementation and remain read-only unless the user asks for fixes. This workflow orchestrates leaf skills; it is not a duplicate of `code-review`.

```text
review packet
↓
code-review          two-axis leaf
↓
blast-radius         when boundaries changed or the diff is untrusted
↓
verify-change        evidence, not inspection
↓
interrogate          high rigor only, never automatic
```

Give the reviewer a [review packet](../../references/protocols/review-packet.md) of deterministic facts instead of making them rediscover the diff, tests, and intent.

## Workflow

1. Establish the review target, base revision, request, acceptance criteria, and repository guidance. Assemble the packet.
2. Invoke `code-review` for Standards vs Spec on the complete requested range. Do not review only the latest commit when the requested range is broader.
3. Use `blast-radius` when boundaries, schemas, or public contracts changed, or when a small diff is untrusted.
4. Do not substitute review for verification. Note verification gaps; run or request `verify-change` when claims of correctness lack fresh evidence.
5. Classify findings:
   - critical: data loss, security exposure, or unusable core behavior;
   - important: likely incorrect behavior, serious regression, or meaningful contract risk;
   - minor: optional improvement that does not block.
6. Converge: critical → fix; important → fix or explicitly adjudicate; minor → record; the same disputed issue repeatedly → escalate rather than loop.
7. Lead with findings, ordered by severity. Cite paths and lines.
8. If there are no findings, say so and list material verification gaps or residual risks.

## Constraints

- Do not edit code unless explicitly asked to apply fixes.
- Do not report style preferences as defects unless they violate an established standard.
- Do not invoke `interrogate` automatically; it is explicit-only. Suggest it when rigor is high, architecture is consequential, review is contested, or failure cost is high.
- Avoid infinite review loops.

## Completion

The requested change range was inspected in context, findings are evidence-backed and prioritized, and verification gaps are explicit.
