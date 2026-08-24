# Eval fixtures

Shared fixtures live under `evals/routing`, `evals/pressure`, `evals/workflows`, and each skill's `evals/`.

Deterministic routing fixtures run without an LLM.
Fixtures with `requires_llm: true` are skipped unless a provider is configured.
