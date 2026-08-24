# Agent-friendly codebase

Agents fail less when the repository is explicit, constrained, and cheap to verify.

Encourage:

- explicit types
- strong domain vocabulary
- stable interfaces
- deep modules
- constrained states
- deterministic scripts
- clear ownership boundaries
- easy local verification
- useful static analysis
- low-ambiguity APIs
- representative tests
- observable runtime behavior

If agents repeatedly make the same mistake, consider changing the codebase or tooling so the mistake becomes difficult or impossible. A conversation reminder is the weakest fix. See [structural enforcement](structural-enforcement.md).
