---
name: how
description: "Use for \"how does X work\", code walkthroughs before changing something, and placement / ownership / layering questions. Explains subsystem architecture and runtime flow from actual implementation. Use why for historical motivation and observe for live behavior."
---

# How

Explore the codebase to answer "how does X work?" Produce a working mental model of the current implementation, not annotated source and not a directory tour.

Two modes:

1. **Explain** (default). Explore the codebase and produce a clear explanation.
2. **Critique.** Explain first, then independently identify architectural issues.

## Before expensive exploration

```text
check project knowledge
↓
check whether relevant knowledge may be stale
↓
reuse or selectively refresh
```

1. Read `.methodrail/PROJECT.md` if present and any linked notes that match the question.
2. Check [freshness](../../references/knowledge/freshness.md) before treating stored notes as current.
3. Reuse still-valid knowledge. Refresh only the stale slice. Do not skip the investigation below merely because a note exists.

Then follow the investigation procedure. Do not shorten it.

## Explain mode

### Step 1. Understand the question and assess complexity

Parse what the user is asking about:

- "How does the rate limiter work?" — a subsystem
- "How do we handle billing for on-demand usage?" — a feature flow
- "How is the auth service structured?" — an architectural overview
- "Walk me through what happens when a user submits a form" — a runtime trace

Identify the scope. If ambiguous, state your best-guess interpretation before exploring. Don't ask. Let the user redirect if you're off.

**Assess complexity:**

- **Simple** (a single module, a small utility, a narrow "how does function X work"): skip explorer agents; explore and explain in a single pass. Go to Step 2b.
- **Complex** (a subsystem spanning multiple files/services, a cross-cutting feature, a full architectural overview): partition first, then synthesize. Go to Step 2a.

When in doubt, lean simple. You can always partition later if the explainer hits a wall.

### Step 2a. Explore (complex questions only)

Decompose the question into 2–4 parallel exploration angles, each a distinct slice so explorers don't duplicate work. Example split for "how does the rate limiter work?":

- Explorer 1: data model and state management
- Explorer 2: request path and enforcement
- Explorer 3: configuration and metrics infrastructure

Narrow questions: 2 explorers is fine. Broad subsystems: up to 4.

If the host supports subagents, spawn all explorers in a single message, read-only. Each explorer gets [explorer-prompt.md](references/explorer-prompt.md) plus its slice. If the host does not, run the same slices sequentially in this context. See [host capabilities](../../references/host-capabilities.md).

Each explorer should:

- Start broad: find relevant directories and key types/interfaces
- Follow the thread: from an entry point, trace callers, callees, data flow, type definitions
- Read the actual code; don't guess from file names
- Stop when it can describe the full path from input to output without hand-waving
- Note things that are surprising, non-obvious, or that a newcomer would get wrong

Then proceed to Step 3.

### Step 2b. Direct explain (simple questions)

Explore and explain in one pass, read-only. Use [explainer-prompt.md](references/explainer-prompt.md) for communication style and output format. If the host supports a read-only subagent, you may use one; otherwise do the work here.

Proceed to Step 4.

### Step 3. Synthesize (complex questions only)

Once all explorer slices return, synthesize them into one coherent explanation using [explainer-prompt.md](references/explainer-prompt.md). Reconcile overlapping findings, resolve contradictions by reading the code, and weave the slices into a unified picture.

### Step 4. Present

Present the explanation. You may lightly edit for clarity or add conversation context, but don't substantially rewrite.

### Output format

Follow this structure, adapted to the question. Not every section is needed.

**Overview.** 1–2 paragraphs. What it is, what it does, why it exists. Enough to decide whether to keep reading.

**Key Concepts.** The important types, services, or abstractions. Brief definition of each.

**How It Works.** Walk through the flow: what triggers it, what happens step by step, where data goes, the decision points. Prose, not a dump of code. Reference specific files and functions.

**Where Things Live.** A brief map of the relevant files. Not every file.

**Gotchas.** Non-obvious or surprising things. Known sharp edges.

**Unknowns.** Gaps you could not trace. Label inference as inferred, not observed. See [observation record](../../references/protocols/observation-record.md).

## Critique mode

Triggered when the user asks for architectural issues, problems, or improvements, not just understanding.

### Step 1. Explain first

Run the full explain flow above. You must understand the architecture before critiquing it.

### Step 2. Independent critics

After the explanation is complete, obtain independent critiques when the host supports it. Prefer diverse model families if the host can select models. Otherwise use independent agent contexts, or say that independent multi-model critique is unavailable.

Each critic gets the explanation, relevant file paths, [critic-prompt.md](references/critic-prompt.md), and [critique-rubric.md](references/critique-rubric.md).

### Step 3. Lead judgment

Categorize findings:

- **Act on.** Architectural problems worth fixing now
- **Consider.** Real concerns, cost/benefit unclear
- **Noted.** Valid observations, low priority
- **Dismissed.** Wrong, missing context, or style preference

Present the explanation first, then the critique. Someone who just wants to understand the system shouldn't wade through critique.

## Constraints

- Read-only. No production code changes.
- Do not infer architecture from filenames alone.
- Do not produce giant repository summaries unless specifically requested.
- Runtime evidence is out of scope unless you escalate to `observe`.

## Neighbors

```text
Need live behavior            → observe
Need historical motivation    → why
Need change consequences      → blast-radius
Need domain vocabulary        → domain-modeling
```

Complexity alone is not a reason to invoke `architect`.

May produce a knowledge candidate when a stable, surprising ownership or flow rule would be expensive to rediscover. Do not persist ordinary source summaries.

## Done when

The relevant path from entrypoint to effect is traced, authoritative state and side effects are accounted for, inference is labeled, and remaining unknowns are explicit.
