# Skill mechanics

The skill-specific branch of [writing-for-agents](SKILL.md): what changes when the document is a skill (frontmatter, the invocation choice, and router skills). Everything else about writing it is the universal reference in `SKILL.md`.

Methodrail workflow skills are the lifecycle entrypoints. Do not create a competing global router.

## Invocation

Two choices, trading the two loads:

- A **model-invoked** skill keeps a `description`, so the agent can fire it autonomously, and other skills can reach it. You can still type its name: model-invocation always _includes_ user reach. The description is the skill's top-level context pointer, forced to stay loaded at all times. Mechanics: omit `disable-model-invocation`, and write a model-facing description carrying the trigger branches.
- A **user-invoked** skill strips the description from the agent's autonomous reach: only the human typing its name can invoke it. Zero discovery load, but the human must remember it exists. Mechanics: set `disable-model-invocation: true`; the `description` becomes human-facing.

Pick model-invocation only when the agent must reach the skill on its own, or another skill must. If it only ever fires by hand, or it is expensive, make it user-invoked.

Methodrail already marks workflow entry skills and high-cost operators explicit. Do not silently flip those to model-invoked.

Shared reference that two user-invoked skills both need can live in neither. Push it to a Methodrail `references/` file any skill can point at.

## Splitting by invocation

Split off a model-invoked skill when you have a distinct leading word that should trigger it on its own, or another skill must reach it. You pay context load for the new always-loaded description, so that independent reach has to be worth it.

## Router skills

When user-invoked skills multiply past what a human can remember, a **router skill** names the others and when to reach for each. Methodrail's routers are the native workflow skills: `methodrail-init`, `investigate`, `develop`, `debug`, `refactor`, `review`.

Do not add `ask-matt`, `poteto-mode`, or `using-superpowers`. Do not let `wayfinder` or `architect` become global routers.

A router can hint at explicit skills. It must not auto-fire them.

## Methodrail evals

A Methodrail skill is not done when the prose looks good.

```text
Observed recurring agent failure
        ↓
Does Methodrail already solve it?
        │
        ├── yes → improve/eval existing capability
        │
        └── no
             ↓
Does proven upstream work solve it?
        │
        ├── yes → adopt/adapt
        │
        └── no → design a new skill
             ↓
write using writing-for-agents principles
             ↓
baseline behavior
             ↓
skill-enabled behavior
             ↓
pressure cases where relevant
             ↓
ship only when behavior improves
```
