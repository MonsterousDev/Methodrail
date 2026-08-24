# Context packets and transitions

A **context packet** is the minimum sufficient input for the next operation: task, question, scope, knowledge pointers, evidence pointers, unknowns, constraints, budget, expected outputs, provenance.

## Transitions

| Operation | When |
| --- | --- |
| continue | Accumulated context is still directly useful |
| clear | Next phase needs durable artifacts, not conversational reasoning |
| isolate | Bounded independent work; child gets a packet, not parent history |
| handoff | Work moves across sessions/agents with explicit state |
| compact | Continuity required but context is too large — lossy, last resort |

Prefer durable structured artifacts over repeated compaction.
