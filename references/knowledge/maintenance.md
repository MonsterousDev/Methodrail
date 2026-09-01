# Knowledge maintenance

v0.9 strengthens the required Markdown sections. It does not add frontmatter fields. Existing notes remain valid without migration.

## Evidence

For a high-value code- or behavior-derived claim, `## Evidence` identifies the strongest practical revalidation route:

- a deterministic test or command
- a project verification feature
- a source, schema, specification, or active ADR pointer
- a bounded manual inspection when execution is impossible

Say what the evidence establishes. When ambiguity is likely, say what it does not establish. Missing or broken revalidation evidence yields uncertainty, not automatic retirement. Do not embed executable command fields that init will run.

## Refresh triggers

`## Refresh triggers` names material non-path invalidators when they exist: dependency or API changes, configuration or schema changes, a superseding ADR or spec, control or deployment changes, failure of a linked verification feature, or a change in the claim's boundary.

`relevant_paths` remains the only deterministic source-change freshness input. Other triggers guide targeted reconciliation. They never produce a false `fresh` claim by themselves.

`validated_at` changes only after approved reconciliation through `reflect`.

## Release-time audit

Before a significant release, reconcile synchronously:

- notes connected to changed public behavior
- `review-required` or `unknown` notes that could affect the release
- release-critical invariants with a practical falsification route
- a small adversarial sample of apparently dependency-fresh notes when release risk justifies checking incomplete `relevant_paths`

Record outcomes in the release or dogfood report. Do not create a permanent knowledge-use ledger. Route approved mutations through `reflect` before freezing release evidence.

Do not add time-to-live fields or numeric confidence. Do not schedule background audits.
