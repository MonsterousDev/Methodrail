# Typed knowledge note contract

Durable project knowledge that earns a typed note uses this contract. Decision records stay in `.methodrail/knowledge/decisions/` and are not typed notes. `rationale` and `observation` stay records; do not promote them as typed notes.

Identity is the file path: `.methodrail/knowledge/<slug>.md`. Duplicate titles among typed notes or their PROJECT.md index entries are invalid.

## Frontmatter

```yaml
kind: fact | invariant | convention | known-failure | hypothesis
status: verified | provisional
lifecycle: active | disputed | retired
validated_at: <40-character-git-sha | unversioned:<reason>>
relevant_paths:
  - src/example.ts
scope:
  include_paths:
    - src/example
  exclude_paths:
    - src/example/legacy
conflicts_with:
  - knowledge/other-claim.md
superseded_by: knowledge/current-claim.md
```

`validated_at` is a full Git SHA, or `unversioned:<reason>` when the repository has no Git history. Short SHAs and other strings are malformed. Unversioned provenance has reduced confidence and never counts as `fresh`.

A `hypothesis` must be `provisional`. A `verified` note must contain meaningful evidence.

`lifecycle` is optional; omitted means `active`. `scope` is optional; omitted means `unbounded`. Do not invent scope. Scope paths are repository-relative prefixes, not globs. Exclusion wins over inclusion. Matching is exact or descendant on a path-segment boundary (`src/mail` does not match `src/mailer.ts`).

`conflicts_with` is allowed only on `disputed` notes, must be reciprocal typed-note identities (`knowledge/<slug>.md`), and requires a meaningful `## Dispute` section. `superseded_by` is allowed only on `retired` notes and must target one existing non-retired typed note. A retired note without a successor requires a meaningful `## Retirement` section. Do not move a file to represent retirement.

## Sections

Required body sections: Claim, Evidence, Reuse guidance, Refresh triggers.

Keep the note at or below 80 lines and 4000 characters. Index it from `.methodrail/PROJECT.md` with a concise pointer. Do not copy the note into the project file.

## Legacy notes

Markdown under `.methodrail/knowledge/` without typed frontmatter remains loadable as **legacy**, with reduced confidence. Initialization may propose migration. Never silently rewrite a legacy note into typed form, and do not create new untyped notes. A living glossary that already exists at `knowledge/domain.md` may be updated in place by `domain-modeling`.

## Freshness

Freshness is a diagnostic, not a repository-invalid state:

- `fresh` — no `relevant_paths` changes since the Git SHA
- `review-required` — one or more relevant paths changed
- `unknown` — revision missing, Git-less tree, or unversioned provenance

A temporarily missing relevant path is a warning. Path traversal is an error.

Template: [templates/project/knowledge/note.md](../../templates/project/knowledge/note.md). Reuse procedure: [reuse.md](reuse.md).
