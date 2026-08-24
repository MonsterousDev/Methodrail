# Generated and curated merge semantics

Treat all pre-existing prose as curated unless it is inside an unmistakable Methodrail-owned block.

## Rules

1. Never replace an existing file wholesale because a template changed.
2. Create absent files atomically.
3. On refresh, classify each intended fact:
   - unchanged: leave byte-for-byte intact;
   - generated and stale: update only the owned block;
   - curated or ambiguous: preserve and report the conflict;
   - obsolete generated content: remove only when ownership is certain.
4. Use explicit markers only where a shared instruction file needs a pointer:

```markdown
<!-- methodrail:start -->
See `.methodrail/PROJECT.md` for repository-specific working guidance.
<!-- methodrail:end -->
```

5. Do not place markers around an entire user-authored file.
6. Preserve formatting, line endings, unrelated ordering, and symlinks.
7. Before writing, compare the proposed result with the current content.

## Idempotency check

Given the same repository evidence and user decisions, a second run must:

- create no files;
- alter no bytes;
- add no duplicate links or sections;
- report no new decisions.

If ownership cannot be established, skip the edit and explain what requires confirmation.
