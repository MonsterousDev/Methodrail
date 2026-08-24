# Eval fixtures

Per-skill routing fixtures live beside each `SKILL.md`. Cross-skill routing, behavioral, and pressure fixtures live under `evals/`.

They describe expected native-agent behavior. They do not feed a Methodrail router, because Methodrail has no custom router.

The realistic init fixture used by repository tests is `tests/fixtures/repository/`. Pressure case `pressure.ask-startup` points at that input tree because `package.json` already documents `npm start`.

Use fixtures in a native-harness evaluation:

1. Run the prompt without the skill to establish a baseline when evaluating behavior.
2. Make the candidate skill available, then run the same prompt in a fresh context.
3. Judge skill selection and output against the fixture's expectations.
4. Record the harness and model version with the result.
