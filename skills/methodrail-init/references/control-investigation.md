# Control investigation

During initialization or refresh, explicitly investigate:

```text
How do I start this project?
How do I know it is ready?
How do I drive representative behavior?
How do I inspect state?
How do I capture evidence?
How do I reset it?
How do I stop it?
```

If those answers are obvious from a single package script, record the commands in `.methodrail/PROJECT.md` and skip `CONTROL.md`.

If they are non-obvious, coordinated, or easy to get wrong, generate `.methodrail/control/CONTROL.md` using `templates/project/control/CONTROL.md` as a skeleton.

Possible sections:

```text
Start
Doctor/readiness
Drive
Inspect
Capture
Reset
Stop
Known limitations
```

Do not invent capabilities. Use real repository commands and real tooling. If a step cannot be performed in this environment, record the limitation instead of fabricating a procedure.
