# Rigor

Rigor is guidance for native-agent behavior. It is not a scheduler.

Match investigation, design, review, and verification effort to consequence and reversibility. Workflow skills should consult this document when they need escalation guidance. Do not invoke expensive skills merely because a task is interesting.

## Level 0 — Mechanical

Examples: rename, formatting, obvious local config edit, generated-file update.

Typical behavior:

- inspect local context
- make the change
- run deterministic validation

Do not invoke `architect`, `prototype`, or `interrogate`.

## Multi-agent cost

Guidance, not a scheduler. Explicit user invocation remains allowed.

| Rigor | Parallel posture |
|---|---|
| 0–1 | Prefer one context |
| 2 | Isolated subagents only where they improve context quality or independence |
| 3 | Parallel exploration may be justified |
| 4 | Arena may be justified; name `interrogate` and wait |
| 5 | Strong independent evidence/review is expected where available |

Keep parallel semantics distinct: swarm partitions work; arena competes candidates; interrogate reviews adversarially; how explorers partition understanding; code-review axes split review dimensions.

## Level 1 — Bounded

A small local change or bug.

Typical behavior:

- understand the relevant local implementation
- apply appropriate verification
- limited review if useful

## Level 2 — Standard

A normal feature or behavior-changing change.

Typical behavior:

- understand current behavior
- define acceptance criteria
- plan proportionally
- verify with fresh evidence

## Level 3 — Cross-boundary

Touches multiple modules, ownership boundaries, or meaningful abstractions.

Typical behavior may include:

- `how`
- `domain-modeling`
- architecture assessment
- runtime observation
- `blast-radius`
- stronger review

## Level 4 — High risk

Examples: billing, permissions, auth, security-sensitive behavior, migrations, concurrency, destructive operations, major architecture.

Typical behavior may include:

- explicit evidence gathering
- `architect`
- `prototype`
- runtime observation
- `blast-radius`
- independent review
- `interrogate` only when explicitly requested

## Level 5 — Critical / hard to reverse

Use the strongest available evidence and explicit human approval for consequential choices.

Examples: irreversible migrations, destructive production operations, security model changes, highly consequential architectural commitments.

`interrogate` remains explicit-only even at this level.

## Choosing a level

Raise rigor when failure is expensive, the change is hard to reverse, or ownership/contracts are in play. Lower it when the change is local, mechanical, and covered by deterministic checks. When unsure, prefer one level higher for verification, not for ceremony.
