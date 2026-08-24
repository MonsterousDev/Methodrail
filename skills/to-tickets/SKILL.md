---
name: to-tickets
description: "Break a plan, spec, or conversation into tracer-bullet tickets with blocking edges. Publishes to the project's tracker when available, otherwise to local markdown. Do not use to implement the work."
disable-model-invocation: true
---

# To tickets

Break a plan, spec, or conversation into **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it.

## Process

### 1. Gather context

Work from the conversation. If the user passes a spec path or issue, fetch and read it.

### 2. Explore the codebase if needed

Use domain glossary vocabulary. Respect ADRs. Look for prefactor opportunities: make the change easy, then make the easy change.

### 3. Draft vertical slices

- Each slice cuts a narrow but complete path through every needed layer: vertical, not a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Sized to one fresh context window
- Prefactoring first

Give each ticket **blocking edges**. A ticket with no blockers can start immediately.

**Wide refactors** are the exception. Sequence them as expand–contract rather than forcing a tracer bullet. Use `blast-radius` when a mechanical change fans across the codebase.

### 4. Quiz the user

For each ticket: title, blocked by, what it delivers. Ask about granularity and edges. Iterate until approved.

### 5. Publish

- **Local files** (default when no tracker is configured): one file per ticket under `.scratch/<feature-slug>/issues/` or `docs/tickets/<feature-slug>/`, numbered from `01` in dependency order.
- **Real tracker** (GitHub, Linear, GitLab, …): one issue per ticket, using native blocking when the tracker has it. Only when the project already uses that tracker.

Do not require `setup-matt-pocock-skills`. Do not close or modify any parent issue unless asked.

Local ticket body:

```markdown
# NN: Ticket title

**What to build:** end-to-end behaviour from the user's perspective.

**Blocked by:** numbers/titles, or "None (can start immediately)".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
```

Avoid specific file paths or code snippets unless a prototype snippet encodes a decision.

## Neighbors

```text
Wide refactor tickets         → blast-radius
Foggy destination             → wayfinder
```
