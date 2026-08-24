# Capability map

Canonical Methodrail surface. One owner per capability. Provenance is metadata, not a visible namespace.

| Capability | Canonical skill | Origin | Invocation | Escalates to | Used by |
|---|---|---|---|---|---|
| Project harness init | `methodrail-init` | Methodrail-native | explicit | `create-verification-skill` | humans |
| Existing-system investigation | `investigate` | Methodrail-native | explicit | `how`, `why`, `observe`, `research`, `prototype`, `blast-radius` | humans |
| Feature delivery | `develop` | Methodrail-native | explicit | `grill-with-docs`, `domain-modeling`, `wayfinder`, `architect`, `prototype`, `tdd`, `code-review`, `verify-change`, `blast-radius` | humans |
| Failure diagnosis and fix | `debug` | Methodrail-native | explicit | `diagnosing-bugs`, `observe`, `runtime-forensics`, `trace-forensics`, `performance`, `hillclimb`, `tdd`, `verify-change` | humans |
| Behavior-preserving restructure | `refactor` | Methodrail-native | explicit | `how`, `codebase-design`, `improve-codebase-architecture`, `blast-radius`, `code-review`, `verify-change` | humans |
| Change review workflow | `review` | Methodrail-native | explicit | `code-review`, `blast-radius`, `verify-change`, `interrogate` | humans |
| Current codebase understanding | `how` | pstack | model-invoked | `observe` | `investigate`, `develop`, `refactor`, `architect` |
| Historical motivation | `why` | pstack | model-invoked | — | `investigate`, `architect` |
| Live behavior | `observe` | Methodrail-native | model-invoked | `runtime-forensics` | `investigate`, `debug`, `verify-change` |
| External/reference research | `research` | Matt Pocock | model-invoked | — | `investigate`, `wayfinder` |
| Impact beyond the diff | `blast-radius` | pstack | model-invoked | `arena` (wide changes) | `develop`, `debug`, `refactor`, `review` |
| Ubiquitous language | `domain-modeling` | Matt Pocock | model-invoked | ADR via same skill | `develop`, `grill-with-docs`, `wayfinder` |
| Ambiguous requirements interview | `grill-with-docs` | Matt Pocock | explicit | `domain-modeling` | `develop`, `wayfinder` |
| Large uncertain planning | `wayfinder` | Matt Pocock | explicit | `grill-with-docs`, `research`, `prototype` | `develop` |
| Empirical experiment | `prototype` | Matt Pocock + Methodrail evidence semantics | explicit | — | `investigate`, `develop`, `wayfinder` |
| Architecture decision exercise | `architect` | pstack | explicit | `how`, `why`, `arena`, `interrogate` | `develop` |
| Deep-module design vocabulary | `codebase-design` | Matt Pocock | model-invoked | `architect` when a decision exists | `tdd`, `refactor`, `improve-codebase-architecture` |
| Hot-spot deepening hunt | `improve-codebase-architecture` | Matt Pocock | explicit | `grill-with-docs`, `codebase-design` | `refactor` |
| Test-first implementation | `tdd` | Matt Pocock | model-invoked | `codebase-design`, `verify-change` | `develop`, `debug` |
| Baseline bug diagnosis | `diagnosing-bugs` | Matt Pocock | model/workflow invoked | `runtime-forensics`, `trace-forensics`, `performance` | `debug` |
| Completion verification | `verify-change` | Superpowers-derived | model/workflow invoked | `observe`, project verify skill | all workflows |
| Two-axis diff review | `code-review` | Matt Pocock | model-invoked | — | `review`, `develop` |
| Adversarial independent review | `interrogate` | pstack | explicit / high rigor | — | `review` (suggested only) |
| Competing candidates | `arena` | pstack | explicit | `verify-change` | `architect`, `blast-radius` |
| Partitioned parallel coverage | `swarm` | pstack | explicit | — | humans, large investigations |
| Durable spec from resolved intent | `to-spec` | Matt Pocock | explicit | — | `develop` after grilling |
| Tracer-bullet tickets | `to-tickets` | Matt Pocock | explicit | `blast-radius` for wide refactors | `develop` |
| Live-process instrumentation | `runtime-forensics` | pstack playbook | explicit | `diagnosing-bugs` | `debug` |
| Captured artifact diagnosis | `trace-forensics` | pstack playbook | explicit | `diagnosing-bugs`, `performance` | `debug` |
| Measured perf investigation | `performance` | pstack playbook | explicit | `hillclimb`, `architect` | `debug` |
| Iterative metric optimization | `hillclimb` | pstack playbook | explicit | `show-me-your-work` | `debug` |
| Rendered visual equivalence | `visual-parity` | pstack playbook | explicit | — | humans |
| Project verify skill generation | `create-verification-skill` | pstack | explicit | `maintain-verification-skill` | `methodrail-init` |
| Verify-skill upkeep | `maintain-verification-skill` | pstack | explicit | `create-verification-skill` if missing | humans |
| Compact decision trail | `show-me-your-work` | pstack | explicit | — | `hillclimb`, long runs |
| Session lessons as candidates | `reflect` | pstack | explicit | knowledge / skill / structural-enforcement candidates | humans |

## Ownership decisions

- **Debugging baseline:** `diagnosing-bugs` (Matt). Superpowers `systematic-debugging` and the previous Methodrail skill are not public. Superpowers tracing/pressure techniques are composed into `diagnosing-bugs`.
- **TDD:** `tdd` (Matt). Superpowers TDD and pstack TDD are not public. Superpowers pressure material is a `tdd` reference. Verification-without-TDD remains `verify-change`.
- **Prototype:** one public `prototype`. Matt's throwaway branches plus Methodrail evidence semantics. pstack prototype playbook is a reference, not a competing skill.
- **Review:** `/review` is the workflow; `code-review` is the two-axis leaf. `interrogate` is explicit-only.
- **Implement:** Matt `implement` is not shipped. `/develop` owns the lifecycle and reuses `tdd` / `code-review` / `verify-change`.
- **Control planes:** `poteto-mode`, `ask-matt`, `using-superpowers`, and `setup-*` global routers are not imported.
