# Knowledge reuse

Use this procedure in existing workflows. Do not force it for trivial inspect-and-edit work or unrelated notes. Do not copy this page into every skill.

```text
read .methodrail/PROJECT.md
→ follow only pointers relevant to the current task
→ read kind, status, evidence, and provenance
→ compare relevant_paths since validated_at
→ reuse, revalidate, or lower confidence
→ explore only remaining unknowns
```

1. Read `.methodrail/PROJECT.md` at the git root if it exists. It may be a repository-bound link to external storage; do not search arbitrary workspace folders.
2. Follow only the pointers that bear on this task.
3. Read the note’s kind, status, evidence, and `validated_at`.
4. If `validated_at` is a Git SHA, inspect `git diff` / `git log` for `relevant_paths` since that revision. If it is `unversioned:` or the revision cannot be resolved, treat confidence as reduced and verify against current source.
5. If relevant paths are unchanged and the evidence still applies, reuse the claim and cite the note in the reasoning or handoff.
6. If relevant paths changed, inspect only those files and revalidate the affected claim. Do not reject the whole repository or discard the whole note.
7. If current source contradicts the note: keep any still-valid part, name the stale claim, base the task on current source and tests, and propose a note update. Never silently rewrite the note.

Typed notes follow the [note contract](note-contract.md). Legacy notes remain usable with reduced confidence. Prefer [structural enforcement](../structural-enforcement.md) when a test or type would encode the claim more reliably.
