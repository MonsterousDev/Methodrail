# Eval fixtures

Per-skill routing fixtures live beside each `SKILL.md`. They describe prompts where a native agent should and should not select that skill; they do not feed a Methodrail router.

Pressure fixtures under `evals/pressure/` describe behaviors that must survive requests to skip discipline.

Use the fixtures in a native-harness evaluation:

1. Run the prompt without the skill to establish a baseline when evaluating behavior.
2. Make the candidate skill available, then run the same prompt in a fresh context.
3. Judge skill selection and output against the fixture's expectations.
4. Record the harness and model version with the result.

Repository validation checks fixture shape and positive/negative routing coverage. It intentionally does not simulate an agent.
