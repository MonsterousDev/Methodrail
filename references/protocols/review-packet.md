# Review packet

A reviewer should receive relevant context directly rather than spend expensive model turns rediscovering deterministic facts.

The `review` and `interrogate` skills should use this principle.

## Suggested contents

```text
Task intent
Acceptance criteria
Relevant design/decision
Base revision
Head revision
Relevant diff
Implementation summary
Verification evidence
Known deviations
Risk/rigor
Review rubric
```

Assemble the packet from artifacts that already exist. Do not ask the reviewer to reconstruct the diff, the test output, or the original request from chat.

If verification evidence is missing, say so in the packet. Review cannot substitute for `verify-change`.
