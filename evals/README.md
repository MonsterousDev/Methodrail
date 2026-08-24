# Evals

These evals are for Methodrail maintainers. Consuming projects do not run them.

```text
same task
│
├── baseline agent without Methodrail skill
│
└── agent with Methodrail skill
        │
        ▼
compare behavior
```

## Layout

- `evals/routing/` — mixed-intent skill selection
- `evals/behavioral/` — whether loading a skill improves behavior
- `evals/pressure/` — discipline under schedule, shotgun, inference, and environment pressure
- `evals/fixtures/` — shared notes and pointers
- `skills/<name>/evals/` — per-skill positive and negative routing

## Running

Manual or recorded evaluation is acceptable. A provider abstraction may be added later; this repository does not ship an agent runtime.

1. Run the prompt without the candidate skill for a baseline.
2. Load the skill in a fresh context and rerun the same prompt.
3. Judge selection and behavior against `expected`.
4. Record harness, model, and outcome.

`npm test` / `npm run validate` check fixture shape, unique ids, and coverage. They do not simulate an agent.
