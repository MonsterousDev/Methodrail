# Knowledge freshness

Code-derived knowledge becomes stale.

Knowledge should ideally carry lightweight provenance:

```text
Relevant revision: <commit>
Relevant paths:
- src/billing/*
- src/subscriptions/*
```

When reused later:

```text
knowledge created at revision A
↓
inspect changes since A
↓
determine whether relevant sources changed
↓
reuse or selectively refresh
```

## How to check

1. Read the recorded revision and paths.
2. Inspect git history or diffs for those paths since that revision.
3. If nothing relevant changed, reuse the note and say so.
4. If relevant sources changed, re-validate the claim against current evidence before relying on it.
5. If provenance is missing, treat confidence as reduced until checked.

Do not require a database. Do not build a full invalidation engine. Check freshness intelligently: a comment-only change in an unrelated file does not stale a billing invariant.

Operational and historical knowledge (how to start the app; why Redis was introduced) stales differently from code-derived facts. Refresh control procedures against current commands; refresh rationale only when new historical evidence appears.
