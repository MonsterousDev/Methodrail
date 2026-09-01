# Decision record

Do not force every small choice into an ADR.

Operational choices live in the compact TSV trail owned by `show-me-your-work`. Durable ADRs are the second rung.

## When to offer an ADR

Offer an ADR only when all three are true:

```text
hard to reverse
+ surprising without context
+ real trade-off
= offer an ADR
```

1. **Hard to reverse** — changing course later is costly.
2. **Surprising without context** — a future reader would wonder why.
3. **Real trade-off** — genuine alternatives were considered and one was picked for a reason.

Consequential scope, public contracts, security, data migration, cross-domain reach, and repeated reopening are signals, not substitutes. If any of the three is missing, keep the choice operational.

A consequential but obvious choice with no trade-off does not automatically become an ADR. A reversible task-local choice stays TSV-only.

## Operational TSV (rung 1)

Keep the six-column pstack-compatible format unchanged:

```text
ts	phase	decision	why	evidence	result
```

Default location: working `decisions.tsv` or `.audit/<task>.tsv`. Persist locally; commit only when reviewability justifies it. Append one row per material fork, pivot, revert, or verified checkpoint. Reverse a small decision by appending a later row. Never edit history. Do not add IDs, significance columns, or `promoted_to`.

## Durable ADR (rung 2)

Promotion requires explicit approval:

1. Identify a material operational decision from the active run.
2. Recheck current evidence and the three-part ADR test.
3. Draft a standalone ADR in the project's canonical location (`docs/adr/` or `.methodrail/knowledge/decisions/`).
4. Wait for approval.
5. Write the approved ADR.
6. If the operational log remains available, append a normal TSV row recording promotion and use the ADR path as evidence.

The ADR must stand alone if the working TSV is later discarded. Rejected proposals create no ADR file.

## Reversal

- Operational-only decision → append a reversing or superseding TSV row.
- Active ADR → approved new ADR with explicit supersession.
- A later TSV row cannot override an active ADR.

Index ADRs from `.methodrail/PROJECT.md`. A decision is not evidence that the implementation matches the decision. Verify current behavior separately.

Suggested ADR fields remain in [domain-modeling ADR-FORMAT](../../skills/domain-modeling/references/ADR-FORMAT.md) and [decision.md](../../templates/project/knowledge/decisions/decision.md).
