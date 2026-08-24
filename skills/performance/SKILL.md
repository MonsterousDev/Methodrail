---
name: performance
description: "Measured performance investigation. Tie every fix to a baseline and a post-change measurement. Use for slow / expensive / high-latency issues. Use hillclimb for iterative optimization against a target."
disable-model-invocation: true
---

# Performance

You own the measurement story. Don't read source instead of measuring.

Follow [playbook.md](references/playbook.md). Summary:

1. Capture a baseline trace or timing via the project control/verification skill.
2. Use `how` to ground hypotheses. Most fixes come from eight strategy families, used as hypothesis generators, not a checklist: elimination, divide and conquer, caching, indirection, batching, redundancy, lazy evaluation, scheduling. A family earns an attempt only when the trace shows the signal it names.
3. Plan the fix from the trace. If it crosses a function boundary, `architect` first. Capture a post-fix trace. Verify each attempt before the next (`verify-change`).
4. "Inconclusive" or wrong-surface is not a pass.
5. Cite the measurement: baseline, post-fix, delta, artifact path.

For sustained improvement against a metric rather than a one-off fix, use `hillclimb`.
