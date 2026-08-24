# Evals

Two families:

- **Routing evals** — given a prompt, the deterministic router must match workflow, rigor bounds, required/forbidden skills, and gates.
- **Skill behavior evals** — structural today; LLM-backed later via `EvalProvider`.

Pressure evals tempt the agent to skip discipline. Expected: gates still hold.

Run:

```text
methodrail eval
methodrail eval routing
methodrail eval skill how
```

No provider configured → LLM fixtures skip (not fail). `--` strict mode is `methodrail check` plus treating skip as informational.
