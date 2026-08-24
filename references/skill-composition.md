# Skill composition

Skills are members of one Methodrail family. Organize them by functional role, not upstream origin.

Share infrastructure aggressively. Compose procedures conservatively. A skill should invoke or suggest another skill only when that additional procedure materially reduces uncertainty, reduces risk, provides missing evidence, or creates reusable value.

Do not turn every task into:

```text
how → observe → domain-modeling → wayfinder → architect
→ prototype → tdd → blast-radius → code-review → interrogate → reflect
```

That would be a failure.

## One workflow owner at a time

`/develop` owns the feature lifecycle. Inside it, `wayfinder`, `architect`, `prototype`, and `tdd` are bounded operators. They must not independently restart another full development lifecycle.

`/debug` owns debugging. `diagnosing-bugs` owns the diagnosis procedure inside it. `runtime-forensics` is an escalation operator. `verify-change` is an evidence gate.

Avoid process recursion such as develop → wayfinder → architect → full develop → review → another workflow.

## Communicate through artifacts

A later skill should reuse outputs created by an earlier skill where relevant. Do not force one skill to invoke another solely so that every Methodrail skill appears in the process.

```text
how                    → implementation understanding
observe                → runtime evidence
why                    → historical rationale
domain-modeling        → vocabulary + invariants
prototype              → empirical evidence
wayfinder              → decision map/tickets
architect              → architecture decision
tdd                    → executable behavioral evidence
verify-change          → fresh verification evidence
code-review            → findings
show-me-your-work      → decision/evidence trail
reflect                → learning candidates
handoff                → bounded continuity artifact
```

Use an ephemeral result when future reuse is unlikely. Persist durable artifacts only when value is clear.

Worth preserving: domain terminology, consequential decisions, surprising stable behavior, known recurring failures, expensive runtime discovery, project verification procedures.

Usually not: ordinary source summaries, one-off local variable behavior, temporary hypotheses, trivial implementation detail.

## Functional roles

### Harness

`methodrail-init`, `create-verification-skill`, `maintain-verification-skill`

### Understand

`how`, `observe`, `why`, `research`, `domain-modeling`

### Decide

`grill-with-docs`, `wayfinder`, `prototype`, `architect`

### Design / act

`codebase-design`, `improve-codebase-architecture`, `tdd`, `diagnosing-bugs`

### Assure

`verify-change`, `code-review`, `blast-radius`, `interrogate`

### Scale / specialize

`arena`, `swarm`, `runtime-forensics`, `trace-forensics`, `performance`, `hillclimb`, `visual-parity`

### Continuity / learning

`handoff`, `show-me-your-work`, `reflect`, `writing-for-agents`

These are functional groupings inside one Methodrail family. Do not expose upstream families in user-facing organization.

## Cheap path first

```text
deterministic tool
↓
local source inspection
↓
single skill
↓
isolated subagent
↓
parallel exploration
↓
competing candidates
↓
multi-model adversarial review
```

Only move downward when the current level cannot reliably resolve the problem or risk justifies escalation.

## Parallel semantics

Keep these distinct. Do not introduce a generic "parallelize everything" abstraction.

```text
swarm              = partition independent work
arena              = multiple candidates for the same problem
interrogate        = independent adversarial review
how explorers      = partition understanding
code-review axes   = independent review dimensions
```

## Multi-agent cost gate

Guidance, not a scheduler. Explicit user invocation remains allowed.

| Rigor | Parallel posture |
|---|---|
| 0–1 | Prefer one context |
| 2 | Isolated subagents only where they improve context quality or independence |
| 3 | Parallel exploration may be justified |
| 4 | Arena/interrogate may be justified for consequential uncertainty or review |
| 5 | Strong independent evidence/review is expected where available |

See [rigor](rigor.md) and [host capabilities](host-capabilities.md).

## Proportional examples

### Tiny change

```text
rename → inspect → edit → deterministic verification
```

### Normal feature

```text
develop → relevant understanding → acceptance criteria → tdd → verify
```

### Runtime bug

```text
debug → diagnosing-bugs → observe → runtime-forensics only if needed
→ regression evidence → fix → verify
```

### Large uncertain change

```text
develop → wayfinder → domain-modeling → how → architect
→ prototype empirical unknowns → implementation → blast-radius
→ code-review → interrogate only if risk warrants → verify
```

## Control planes

Methodrail-native workflow skills remain the primary lifecycle entrypoints. Do not import or activate `ask-matt`, `poteto-mode`, or `using-superpowers` as global routers. Do not let `wayfinder`, `architect`, or other rich operators become global control planes either.

See [capability map](capability-map.md) for canonical ownership.
