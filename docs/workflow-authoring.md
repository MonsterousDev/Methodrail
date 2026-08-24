# Workflow authoring

Workflows are YAML state machines. They own phase transitions.

Required: `id`, `version`, `summary`, `kind`, `entry`, `states`, `completion.requires`.

Each state has `kind`, `description`, optional `skills`, `on_complete`, `on_blocked`, `optional`, `terminal`.

Validation checks: filename matches id, entry exists, transitions exist, skill states list skills, graph is reachable, a terminal state is reachable, referenced skills exist in the registry.

Do not encode a second router inside a skill. Question routing on investigation workflows maps question types to skills; the global router still selects the workflow.
