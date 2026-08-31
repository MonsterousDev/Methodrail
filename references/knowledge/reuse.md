# Knowledge reuse

Use this procedure in existing workflows. Do not force it for trivial inspect-and-edit work or unrelated notes. Do not copy this page into every skill.

```text
read .methodrail/PROJECT.md
→ follow only pointers relevant to the current task
→ read kind, status, lifecycle, scope, evidence, and provenance
→ decide eligibility for the task-relevant paths
→ reuse, narrow, reconcile, refuse, or escalate
→ explore only remaining unknowns
```

1. Read `.methodrail/PROJECT.md` at the git root if it exists. It may be a repository-bound link to external storage; do not search arbitrary workspace folders.
2. Follow only the pointers that bear on this task. Trivial inspect-and-edit work and unrelated notes do not need a knowledge decision ceremony.
3. Identify only the task paths relevant to a candidate note's claim, not every file the task touches.
4. Read kind, status, lifecycle, scope, evidence, and `validated_at` before applying the claim.
5. Refuse retired knowledge. Follow `superseded_by` when present. Retired notes stay addressable for provenance.
6. If the note is disputed, present the competing claims and current evidence without selecting a winner. Do not edit either note.
7. If `validated_at` is a Git SHA, inspect `git diff` / `git log` for `relevant_paths` since that revision. If it is `unversioned:` or the revision cannot be resolved, treat confidence as reduced and verify against current source.
8. Apply an eligible scoped note only inside its applicable paths. Exclusion wins. `src/mail` does not match `src/mailer.ts`.
9. Reconcile partial, provisional, stale, or unknown knowledge against current source and tests. Do not reject the whole repository or discard the whole note.
10. If current source contradicts the note: keep any still-valid part, name the stale claim, base the task on current source and tests, and propose at most one governance mutation. Never silently rewrite the note.
11. Name the disposition and note path in the answer or handoff when a note materially affects the task.

Typed notes follow the [note contract](note-contract.md). Legacy notes remain usable with reduced confidence. Prefer [structural enforcement](../structural-enforcement.md) when a test or type would encode the claim more reliably.
