# Context management

Context is a budget. Choose a transition instead of accumulating conversation forever.

```text
continue
clear
isolate
handoff
compact
```

## Continue

Use accumulated reasoning when it is still relevant to the current task. Default for short, coherent work.

## Clear

Use durable artifacts as the source of continuity when the old conversation is no longer useful. Start fresh and reload `.methodrail/PROJECT.md`, decisions, and evidence records.

## Isolate

Use a fresh child context for bounded work. Give the child a [task packet](protocols/task-packet.md), not the parent conversation.

## Handoff

Use explicit durable state when work moves between sessions or agents. Write what the next agent must know: intent, known facts, open frontier, evidence, and next action.

## Compact

Use only when continuity is required and context is too large. Compaction is lossy. Prefer structured durable artifacts over repeatedly summarizing giant conversations.

## Practical rule

If a fact must survive a new session, it belongs in the project harness, an evidence/decision record, or a task/review packet — not in chat residue.
