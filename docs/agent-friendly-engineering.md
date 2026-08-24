# Agent-friendly codebases

When agents fail repeatedly, change the environment.

Prefer:

- explicit types and constrained state machines
- deep modules with stable interfaces
- deterministic project scripts (`test`, `lint`, `typecheck`, start/doctor)
- strong local tests and cheap verification
- clear ownership boundaries and explicit invariants
- generated code and useful static analysis
- low-ambiguity APIs

A control adapter (`.ai/control`) is the project-local steering wheel Methodrail skills should use instead of rediscovering how to boot the app every session.
