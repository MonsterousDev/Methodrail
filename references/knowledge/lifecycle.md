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

Classify it using the [knowledge model](model.md) before promoting. A hypothesis can be recorded as a hypothesis; it must not be filed as a fact.

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

Durable notes live under `.methodrail/knowledge/` and are indexed from `.methodrail/PROJECT.md`. They remain candidates for refresh or removal when [freshness](freshness.md) fails.
