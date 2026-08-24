# Skill authoring

Each skill lives at `skills/<name>/SKILL.md` and starts with `name` and `description` frontmatter.

A useful skill:

- names a bounded task and when to use it;
- gives a short, executable procedure;
- identifies required inputs and concrete outputs;
- defines checks and stopping conditions;
- links to shared references instead of repeating them;
- avoids project-specific assumptions unless the skill explicitly targets one project.

Keep one canonical body. Put shared methodology in `references/` and link it. Test routing separately from behavioral and pressure evals, and revise the skill when evaluation exposes ambiguity.

Prefer a mature upstream skill over a weaker Methodrail reimplementation when behavior, license, and portability allow it. See [CONTRIBUTING.md](../CONTRIBUTING.md) and [capability-map.md](capability-map.md).

Do not add Methodrail-specific metadata when native skill metadata expresses the same intent. Expensive or explicit-only skills set `disable-model-invocation: true`.
