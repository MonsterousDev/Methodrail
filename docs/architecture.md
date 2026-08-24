# Architecture

Methodrail is a **methodology with executable contracts**, not an agent runtime.

```text
                         USER / TASK
                             │
                             ▼
                       ┌────────────┐
                       │   ROUTER   │
                       └─────┬──────┘
                             │
                    ┌────────┴────────┐
                    │ CONTEXT COMPILER │
                    └────────┬────────┘
           knowledge · decision map · workflow
                             │
                    exploration skills → evidence
                             │
                    observation → verification → evals
                             │
                    learning / promotion
```

## Control plane

There is **one** orchestration control plane: the Methodrail router plus declarative workflows.

Skills must not install a second global workflow. Adapter projections stay thin.

## Layers

| Layer | Owns |
| --- | --- |
| Context | Packets, transitions (continue/clear/handoff/isolate/compact), progressive disclosure |
| Knowledge | Domain, decisions, behavior, rationale, operations — in the consuming repo |
| Evidence | Source, runtime, tests, traces, experiments |
| Exploration | how, why, observe, prototype, blast-radius |
| Decision | domain-modeling, decision frontier, architect |
| Execution | planning, implementation discipline, systematic-debugging |
| Assurance | verify-change, review, interrogate |
| Learning | promotion ladder, evals, structural enforcement |
| Integration | Cursor, Claude Code, Codex, generic |

## Deterministic vs judgment

Routing of obvious cases is deterministic and explainable (contract IDs fire, then policy). Model-assisted classification is a later extension point, not required for v0.1.

Validation, registry queries, workflow graph reachability, and eval comparison are deterministic.

## Extension points (not built)

No autonomous worker fleet, vector memory service, cloud control plane, billing, or model marketplace.
