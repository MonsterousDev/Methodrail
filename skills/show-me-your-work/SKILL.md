---
name: show-me-your-work
description: "Keep a compact decision/evidence trail for long or unattended work. Use for autonomous or multi-phase runs a human will review later. Do not use for trivial work. A conversation transcript is not this log."
disable-model-invocation: true
---

# Show me your work

```text
conversation transcript ≠ durable decision log
```

Keep one canonical log so a future agent or reviewer can reconstruct what was decided, why, and on what evidence.

## The format

A single TSV file, one row per decision. Copy [decision-log-template.tsv](references/decision-log-template.tsv). Columns:

- **ts.** ISO8601 timestamp
- **phase.** Phase or workstream
- **decision.** What was chosen or done, one line
- **why.** The reason in plain words
- **evidence.** A pointer: commit SHA, `file:line`, artifact path. Never a paragraph
- **result.** Outcome: `tests green`, `reverted`, `INCONCLUSIVE`, `open`

This is compatible with Methodrail [decision records](../../references/protocols/decision-record.md). The TSV is the compact operational trail. Offer a standalone ADR only when the choice is hard to reverse, surprising without context, and a real trade-off — then wait for approval. Do not add columns. A later TSV row cannot override an active ADR.

Use `scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>` so rows stay well-formed.

Log decision points and checkpoints, not every action. For loop runs, one row per iteration.

## Where it lives

By default a working artifact, not committed: `decisions.tsv` in the work dir, or `.audit/<task-slug>.tsv`. Commit it only when a reviewer needs the trail to trust the result.

## Rules

- One row is one decision. If it doesn't fit on one line, it isn't crisp yet.
- Append-only. A wrong call gets a new row that supersedes it. That row does not override an active ADR.
- Prefer evidence produced by committed scripts over hand-made one-offs.
- Not every Methodrail task needs a decision log. Skip trivial inspect-and-edit work.

## Audit

At the end of the run, check the log told the truth against the actual work. If the host exposes a transcript for this session, walk it; do not glob unrelated private chats. Cut invented entries. Add unlogged forks that shaped the work.

If the host can spawn a reviewer on a different model family, do so and end with an Attention section. If not, self-audit and state that independent review was unavailable. See [host capabilities](../../references/host-capabilities.md).

## Neighbors

```text
Often follows                 → hillclimb, arena, long debug
May inform                    → reflect, handoff
```
