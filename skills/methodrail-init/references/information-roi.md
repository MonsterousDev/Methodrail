# Information ROI

```text
                     future agent benefit
information ROI = ──────────────────────────────
                  context + staleness + upkeep
```

Create or keep an artifact when a future agent would perform better because it exists, and the maintenance cost is justified.

High-value examples:

- important domain invariants
- unexpected ownership boundaries
- non-obvious runtime behavior
- deployment traps
- known failure modes
- consequential architectural rationale

Low-value examples:

- copied package.json
- obvious directory listings
- stale API inventories
- generic framework documentation

A tiny repository with obvious scripts may need only `.methodrail/PROJECT.md`. A service with a non-obvious boot sequence, hidden ownership, or expensive rediscovery should get control notes and focused knowledge files.

Do not generate files merely to fill `templates/project/`.
