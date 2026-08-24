# Context economics

More context is not automatically better context. Treat context as a budget.

Every additional skill invocation, reference, subagent, model, experiment, reviewer, verification layer, context source, or persistent knowledge artifact is a cost. Do not add it merely because it could help.

```text
                     uncertainty reduced
                   + meaningful risk reduced
                   + reusable value created

expected value = --------------------------------

                 tokens + latency + context load
                 + human attention + maintenance
```

Do not calculate this numerically.

## Layer 0 — permanent context

Extremely small. The Methodrail global rule plus a project pointer when relevant.

Target: roughly a few hundred tokens, not thousands.

Do not place rigor tables, full workflows, all methodology, all project knowledge, the skill graph, or long examples into permanent context.

## Layer 1 — active skill

Load the current skill procedure. The active skill should contain what is necessary to reliably execute its process.

Do not shorten mature upstream behavior merely to meet an arbitrary token target. Remove duplicated explanation that adds no behavioral value.

## Layer 2 — progressive references

Load detailed Methodrail or upstream-adapted references only when relevant.

Examples: rigor, decision-frontier, freshness, task packet, review packet, runtime-forensics playbooks, skill mechanics, writing-for-agents.

Use context pointers. Do not load the entire Methodrail methodology into every invocation.

## No-op sentence discipline

For every Methodrail rule, skill, and reference, ask: does this sentence change likely agent behavior?

If not: delete it, replace it with a pointer, rely on model prior knowledge, or rely on deterministic tooling.

Do not explain generic software engineering concepts the model already knows unless the explanation constrains behavior in a Methodrail-specific way.

## Pointers, not copies

A pointer is a reference that names out-of-context material and the condition for loading it. Sharpen the wording of the pointer before inlining the target.

See [writing-for-agents](../skills/writing-for-agents/SKILL.md) for how to write those pointers.

## Transitions

When accumulated conversation is no longer the cheapest continuity mechanism, choose [continue / clear / isolate / handoff / compact](context-management.md). `handoff` is the operational skill for one of those transitions.

## What this is not

Do not build a token planner, context scheduler, skill execution optimizer, or automatic cost model. Methodology and evals are sufficient unless a later observed failure justifies one.
