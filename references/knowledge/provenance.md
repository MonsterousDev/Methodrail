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

Typed notes record provenance as `validated_at` plus `relevant_paths`. Git-less repositories use `unversioned:<reason>` and reduced confidence. See [note contract](note-contract.md), [evidence records](../protocols/evidence-record.md), and [freshness](freshness.md).
