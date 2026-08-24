---
name: improve-codebase-architecture
description: "Scan for deepening opportunities in active, high-churn code, present candidates, then grill through the one you pick. Use when the user asks to improve architecture or when /refactor needs a structured hunt for real friction. Do not use for speculative cleanup of quiet code."
disable-model-invocation: true
---

# Improve codebase architecture

Surface architectural friction and propose **deepening opportunities**: refactors that turn shallow modules into deep ones. Prefer active/high-churn code, current work, and real recurring friction over speculative cleanup.

`/refactor` remains the Methodrail workflow. This skill is the operator it may invoke for a structured hunt.

Call `codebase-design` for the vocabulary (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**). Use the project's canonical glossary for domain names.

## Process

### 1. Explore

**Scope before you scan.** Deepening pays off by making future changes easier, so weight recently changed code.

- If the user named a module, subsystem, or pain point, take it.
- Otherwise walk commit history for hot spots. If changes are scattered, widen the net.
- Stop if the code is quiet, unused, or unrelated to current work.

Read the glossary and ADRs in the area first. Then walk the code and note friction:

- Understanding one concept requires bouncing between many small modules
- Modules are **shallow**
- Pure functions extracted for testability while real bugs hide in how they're called (no **locality**)
- Tightly-coupled modules leak across seams
- Hard to test through the current interface

Apply the **deletion test**. A "yes, concentrates complexity in callers" is the signal you want.

### 2. Present candidates

Write a self-contained HTML report to the OS temp directory so nothing lands in the repo: `$TMPDIR/architecture-review-<timestamp>.html` (fallback `/tmp`, or `%TEMP%` on Windows). Open it for the user and tell them the path. See [HTML-REPORT.md](references/HTML-REPORT.md).

Each candidate: files, problem, solution, benefits in locality/leverage, before/after, recommendation strength (`Strong` / `Worth exploring` / `Speculative`). End with a top recommendation.

If a candidate contradicts an existing ADR, only surface it when friction is real enough to reopen the ADR.

Do not propose interfaces yet. Ask which candidate to explore.

### 3. Grilling loop

Once the user picks a candidate, use `grill-with-docs` to walk constraints, the deepened module, the seam, and which tests survive. Use `domain-modeling` as terms crystallise. Use `codebase-design` / design-it-twice to explore alternative interfaces.

## Neighbors

```text
Vocabulary                    → codebase-design
Chosen candidate              → grill-with-docs
Workflow owner                → /refactor
```
