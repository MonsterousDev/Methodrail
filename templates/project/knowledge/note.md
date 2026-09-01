---
kind: invariant
status: verified
validated_at: unversioned:fill-from-git-or-reason
relevant_paths:
  - src/example.ts
# lifecycle defaults to active when omitted.
# Add scope only when the claim is path-bounded; do not invent it.
# scope:
#   include_paths:
#     - src/example
---

# Concise note title

## Claim

One sentence that a later agent can reuse without rediscovering the work.

## Evidence

- The source path, test, verification feature, or observation that supports the claim.
- What this evidence establishes. When ambiguity is likely, what it does not establish.
- Enough detail that a later agent can re-check it without init executing the recipe.

## Reuse guidance

When a future task should load this note, and what it should preserve.

## Refresh triggers

- A relevant path changes.
- The boundary named in the claim changes.
- Non-path invalidators when they exist (schema, ADR, linked verification, dependency).
