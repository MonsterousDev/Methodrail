# Decision record

Do not force every small choice into an ADR.

Durable decision records are justified when the decision is:

- consequential
- surprising
- hard to reverse
- likely to be questioned later
- dependent on important evidence or tradeoffs

## Suggested fields

```text
Decision:
Question:
Alternatives:
Chosen approach:
Why:
Evidence:
Tradeoffs:
Reversibility:
Follow-up:
```

Place durable records in `.methodrail/knowledge/decisions/` when that directory exists, or in the project's established ADR location. Index them from `.methodrail/PROJECT.md`.

A decision is not evidence that the implementation matches the decision. Verify current behavior separately.
