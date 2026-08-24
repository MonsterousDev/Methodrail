# Provenance

Every important durable claim should make it possible to answer:

```text
How do we know this?
```

Possible provenance:

- source paths
- tests
- runtime scenario
- trace
- benchmark
- git history
- ADR
- issue/PR
- human decision
- production incident

Unknown provenance should reduce confidence. A precise claim with no locator is weaker than a narrower claim with a path, test, or revision.

Record provenance lightly next to the claim. See [evidence records](../protocols/evidence-record.md) and [freshness](freshness.md).
