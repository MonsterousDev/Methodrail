# Knowledge lifecycle

```text
discovery
↓
candidate knowledge
↓
evidence validation
↓
classification
↓
promotion
↓
durable project knowledge
```

Do not persist every useful conversational insight.

## Promotion

Promote knowledge when it is:

- expensive to rediscover
- historically important
- easy to misunderstand
- operationally important
- repeatedly useful
- an important domain concept
- a non-obvious invariant
- a consequential decision

Classify it using the [knowledge model](model.md) before promoting. A hypothesis can be recorded as a hypothesis; it must not be filed as a fact. Reflect proposes a typed note and waits for explicit approval.

## Governance after promotion

A typed note is `active`, `disputed`, or `retired`. Omitted lifecycle means `active`. Omitted scope means `unbounded`.

Reflect may propose one of: create, narrow scope, dispute, resolve, or retire. After explicit approval it applies at most one logical knowledge transaction. A reciprocal dispute may update both notes and the PROJECT.md pointer set as that one transaction.

Resolution choices are: retain one claim, synthesize a replacement, or keep both with non-overlapping scopes. Current source and tests remain authoritative during every conflict.

Retired notes remain at their path for provenance and are never reused. Do not move a file to represent retirement.

If a governance transaction is only partly applied, show the incomplete diff. Do not guess the missing half. Ask whether to complete or revert it.

Init reports disputed, retired, malformed, and unbounded notes. It does not resolve or migrate them.

## Who may write `.methodrail/knowledge/`

- **Typed notes:** only `reflect`, after explicit human approval, using the [note contract](note-contract.md).
- **Decision records:** `.methodrail/knowledge/decisions/` when that is the project's ADR home.
- **Init:** recognize and index existing notes. Do not create files there (typed or untyped). Report useful missing knowledge as a candidate.
- **Other skills:** do not create untyped files there. Living glossaries belong in project-native docs, or in an already-existing `knowledge/domain.md`. Specs, research notes, and scratch writing stay in `docs/`, `specs/`, or `.scratch/`.

Backward-compatible **reading** of legacy untyped notes is required. New untyped writes are not.

## What not to persist

- copied manifests or directory listings
- obvious facts a search will find
- stale API inventories
- generic framework documentation
- unverified chat conclusions

Prefer [structural enforcement](../structural-enforcement.md) over documentation where possible. An invariant encoded as a type or test beats a paragraph that agents may ignore.

Information ROI:

```text
                     future reuse
                   + rediscovery cost
                   + misunderstanding risk
                   + historical/operational importance

information ROI = --------------------------------

                   context cost
                   + staleness risk
                   + maintenance
                   + duplication
```

Do not persist ordinary source summaries, one-off local behavior, temporary hypotheses, or trivial implementation detail.

## After promotion

Durable typed notes live under `.methodrail/knowledge/` using the [note contract](note-contract.md) and are indexed from `.methodrail/PROJECT.md`. Later sessions follow [reuse](reuse.md). They remain candidates for refresh or removal when [freshness](freshness.md) fails. Do not persist a candidate queue.
