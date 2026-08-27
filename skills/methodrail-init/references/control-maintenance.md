# Control maintenance

`methodrail-init` is idempotent refresh as well as first-time setup. When `.methodrail/` already exists at the git root as a directory or repository-bound link:

```text
check existing project harness
↓
detect project changes
↓
validate control procedures
↓
update stale generated knowledge
↓
preserve curated human content
```

Reuse the canonical path. For a linked harness, validate `HARNESS.yaml` before writing. Do not move or relink it unless the user asks.

## Detect change

Compare the harness against current manifests, scripts, CI, entrypoints, and existing AI instructions. Generated command lists, control steps, and code-derived knowledge go stale when those sources change. See [freshness](../../../references/knowledge/freshness.md).

## Validate control

If `control/CONTROL.md` exists, check that listed commands still exist and still mean what the note says. A missing script is documentation drift. A command that runs but no longer produces the documented effect may be product regression — do not silently rewrite it as if the product were wrong.

```text
documentation/control drift  ≠  actual product regression
```

Update generated control text when the repository's supported procedure changed. Report suspected product regressions instead of “fixing” the harness to match a broken system.

## Preserve curated content

Human-authored knowledge, decisions, and unmarked prose stay. Update only Methodrail-owned generated blocks. Follow [merge semantics](merge-semantics.md).
