# Contributing

Do not create a skill because advice sounds good. Create a skill because a **recurring agent failure** has been observed and the skill **measurably** improves behavior.

## New skills must explain

1. **Failure observed** — what the agent actually did wrong, repeatedly.
2. **Skill hypothesis** — how a bounded procedure prevents that failure.
3. **Activation rule** — when the router or a workflow may invoke it.
4. **Non-activation rule** — when it must stay dark (especially expensive skills).
5. **Evals** — at least positive routing, negative routing, behavioral (or structural stand-in), and a pressure case.

Reject skills that are generic advice, long reference manuals, personality text, duplicate methodology, or work a compiler/linter/test should enforce.

## Skill contract

Every skill directory needs `skill.yaml`, `SKILL.md` (Agent Skills–compatible frontmatter plus the required headings), and `evals/` fixtures.

`SKILL.md` must answer: problem, observed failure, when to activate, when not to, required context, method, permitted evidence, side effects, completion, artifacts, what survives, evaluation.

## Architecture changes

Updates to protocols, router policy, workflows, or promotion rules must include:

- schema changes
- documentation updates
- eval fixtures that lock the new contract

## Repo commands

```bash
npm install
npm test
npx tsx src/cli/index.ts validate
npx tsx src/cli/index.ts eval
npx tsx src/cli/index.ts check
```

Do not add databases, vector stores, model SDKs, or cloud services unless the current functionality requires them. This repository stays local-first and inspectable.
