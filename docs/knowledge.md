# Knowledge

Persist knowledge when it is terminology, rationale, historical decisions, rejected alternatives, subtle invariants, expensive discoveries, operational knowledge, or observed behavioral contracts.

Do not persist directory listings, CLI help, or other cheap rediscoveries.

Promotion:

```text
observation → candidate → evidence validation → classification → promotion
```

Freshness: code-derived claims should carry a revision or source fingerprint. Stale knowledge is dropped or revalidated, not trusted because it is on disk.

The consuming project's knowledge lives in that project (`.ai/knowledge/`). Methodrail owns schemas and methods.
